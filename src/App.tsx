import { useState, useEffect, useMemo } from 'react';
import { Book, BookFilters, SortType, CartItem, TrendingScore } from './types/book';
import { mockBooks } from './data/books';
import { Header } from './components/Header';
import { BookFiltersComponent } from './components/BookFilters';
import { BookList } from './components/BookList';
import { BookDetailsModal } from './components/BookDetailsModal';
import { AddBookModal } from './components/AddBookModal';
import { Cart } from './components/Cart';
import { TrendingSection } from './components/TrendingSection';
import { TrendingAlgorithm, InteractionTracker } from './utils/trending';
import { FuzzySearch, SearchAnalytics } from './utils/search';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [userAddedBooks, setUserAddedBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<'books' | 'cart'>('books');
  
  const [filters, setFilters] = useState<BookFilters>({
    category: 'All',
    ageRating: 'All',
    search: '',
    sortBy: 'trending'
  });

  const [trendingScores, setTrendingScores] = useState<TrendingScore[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<string[]>([]);

  // Load data on component mount
  useEffect(() => {
    // Load mock books
    setBooks(mockBooks);
    
    // Load user-added books from localStorage
    const savedBooks = localStorage.getItem('userAddedBooks');
    if (savedBooks) {
      try {
        const parsed = JSON.parse(savedBooks);
        setUserAddedBooks(parsed);
      } catch (error) {
        console.error('Error parsing saved books:', error);
      }
    }

    // Load cart items from localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Convert date strings back to Date objects
        const cartWithDates = parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setCartItems(cartWithDates);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  // Save user-added books to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userAddedBooks', JSON.stringify(userAddedBooks));
  }, [userAddedBooks]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Combine mock books and user-added books
  const allBooks = useMemo(() => {
    return [...books, ...userAddedBooks];
  }, [books, userAddedBooks]);

  // Calculate trending data
  useEffect(() => {
    const interactions = InteractionTracker.getInteractions();
    const scores = TrendingAlgorithm.calculateTrendingScores(allBooks, interactions);
    setTrendingScores(scores);

    const trendingBookIds = TrendingAlgorithm.detectTrendingBooks(scores);
    const trending = allBooks.filter(book => trendingBookIds.includes(book.id));
    setTrendingBooks(trending);

    const trendingCats = TrendingAlgorithm.getTrendingCategories(scores);
    setTrendingCategories(trendingCats);
  }, [allBooks]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = allBooks;

    // Apply search filter with enhanced fuzzy search
    if (filters.search) {
      filtered = FuzzySearch.searchBooks(allBooks, filters.search);
      
      // Track search
      SearchAnalytics.saveSearch({
        query: filters.search,
        timestamp: Date.now(),
        resultsCount: filtered.length
      });
      
      InteractionTracker.trackSearch(filters.search);
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(book => book.category === filters.category);
    }

    // Apply age rating filter
    if (filters.ageRating && filters.ageRating !== 'All') {
      filtered = filtered.filter(book => book.ageRating === filters.ageRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'trending':
          const scoreA = trendingScores.find(s => s.bookId === a.id)?.score || 0;
          const scoreB = trendingScores.find(s => s.bookId === b.id)?.score || 0;
          return scoreB - scoreA;
        case 'best-seller':
          return b.purchases - a.purchases;
        case 'most-liked':
          return b.likes - a.likes;
        case 'most-purchased':
          return b.purchases - a.purchases;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.publishedYear - a.publishedYear;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allBooks, filters, trendingScores]);

  // Calculate statistics
  const totalStats = useMemo(() => {
    return allBooks.reduce(
      (acc, book) => ({
        likes: acc.likes + book.likes,
        purchases: acc.purchases + book.purchases
      }),
      { likes: 0, purchases: 0 }
    );
  }, [allBooks]);

  // Calculate cart statistics
  const cartStats = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
    
    // Track book view
    InteractionTracker.trackView(book.id);
  };

  const handleLike = (bookId: string) => {
    const updateBooks = (booksList: Book[]) =>
      booksList.map(book =>
        book.id === bookId
          ? { ...book, likes: book.likes + 1 }
          : book
      );

    // Update the appropriate book list
    const bookInMockData = books.find(book => book.id === bookId);
    if (bookInMockData) {
      setBooks(updateBooks(books));
    } else {
      setUserAddedBooks(updateBooks(userAddedBooks));
    }

    // Update selected book if it's the one being liked
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook({ ...selectedBook, likes: selectedBook.likes + 1 });
    }

    // Track like interaction
    InteractionTracker.trackLike(bookId);

    toast.success('Book liked! 💖');
  };

  const handleAddToCart = (bookId: string) => {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    setCartItems(prev => {
      const existingItem = prev.find(item => item.book.id === bookId);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prev.map(item =>
          item.book.id === bookId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [...prev, { book, quantity: 1, addedAt: new Date() }];
      }
    });

    toast.success(`${book.title} added to cart! 🛒`);
  };

  const handleUpdateCartQuantity = (bookId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(bookId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.book.id === bookId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (bookId: string) => {
    const item = cartItems.find(item => item.book.id === bookId);
    setCartItems(prev => prev.filter(item => item.book.id !== bookId));
    
    if (item) {
      toast.success(`${item.book.title} removed from cart`);
    }
  };

  const handleCheckout = () => {
    // Update purchase counts for all books in cart
    cartItems.forEach(item => {
      const updateBooks = (booksList: Book[]) =>
        booksList.map(book =>
          book.id === item.book.id
            ? { ...book, purchases: book.purchases + item.quantity }
            : book
        );

      // Update the appropriate book list
      const bookInMockData = books.find(book => book.id === item.book.id);
      if (bookInMockData) {
        setBooks(updateBooks(books));
      } else {
        setUserAddedBooks(updateBooks(userAddedBooks));
      }

      // Track purchase interaction
      InteractionTracker.trackPurchase(item.book.id, item.quantity);
    });

    // Clear cart
    setCartItems([]);
    setCurrentView('books');
    
    toast.success('Order placed successfully! 🎉 Thank you for your purchase!');
  };

  const handleAddBook = (newBookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...newBookData,
      id: Date.now().toString(), // Simple ID generation
    };

    setUserAddedBooks(prev => [newBook, ...prev]);
    toast.success('Book added successfully! 📚');
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBook(null);
  };

  const handleSelectBookFromSearch = (book: Book) => {
    handleViewDetails(book);
  };

  const handleFilterByCategory = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddBook={() => setIsAddBookModalOpen(true)}
        onViewCart={() => setCurrentView('cart')}
        totalBooks={allBooks.length}
        totalLikes={totalStats.likes}
        totalPurchases={totalStats.purchases}
        cartItemCount={cartStats}
      />
      
      {currentView === 'books' ? (
        <main className="container mx-auto px-4 py-6">
          <BookFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            books={allBooks}
            onSelectBook={handleSelectBookFromSearch}
          />
          
          {/* Show trending section when no search is active */}
          {!filters.search && (
            <TrendingSection
              trendingBooks={trendingBooks}
              trendingScores={trendingScores}
              trendingCategories={trendingCategories}
              onViewBook={handleViewDetails}
              onFilterByCategory={handleFilterByCategory}
            />
          )}
          
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing {filteredAndSortedBooks.length} of {allBooks.length} books
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>
          
          <BookList
            books={filteredAndSortedBooks}
            onViewDetails={handleViewDetails}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
          />
        </main>
      ) : (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          onBackToBooks={() => setCurrentView('books')}
        />
      )}

      <BookDetailsModal
        book={selectedBook}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onLike={handleLike}
        onAddToCart={handleAddToCart}
      />

      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onAddBook={handleAddBook}
      />

      <Toaster />
    </div>
  );
}
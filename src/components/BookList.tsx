import { Book } from '../types/book';
import { BookCard } from './BookCard';

interface BookListProps {
  books: Book[];
  onViewDetails: (book: Book) => void;
  onLike: (bookId: string) => void;
  onAddToCart: (bookId: string) => void;
}

export function BookList({ books, onViewDetails, onLike, onAddToCart }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-muted-foreground text-center">
          <h3 className="text-lg mb-2">No books found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onViewDetails={onViewDetails}
          onLike={onLike}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
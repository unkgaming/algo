export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage: string;
  likes: number;
  purchases: number;
  ageRating: 'Children' | 'Young Adult' | 'Adult' | 'All Ages';
  price: number;
  rating: number;
  publishedYear: number;
  isUserAdded?: boolean;
}

export interface CartItem {
  book: Book;
  quantity: number;
  addedAt: Date;
}

export type SortType = 'best-seller' | 'most-liked' | 'most-purchased' | 'newest' | 'rating' | 'alphabetical' | 'trending';

export interface BookFilters {
  category: string;
  ageRating: string;
  search: string;
  sortBy: SortType;
}

// Analytics and trending types
export interface BookInteraction {
  bookId: string;
  type: 'view' | 'like' | 'purchase' | 'search';
  timestamp: number;
  value?: number; // for purchases (quantity), likes (1), etc.
}

export interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultsCount: number;
  bookId?: string; // if user clicked on a result
}

export interface TrendingScore {
  bookId: string;
  score: number;
  category: string;
  recentViews: number;
  recentLikes: number;
  recentPurchases: number;
}

export interface AutoCompleteResult {
  type: 'book' | 'author' | 'category';
  text: string;
  book?: Book;
  score: number;
}
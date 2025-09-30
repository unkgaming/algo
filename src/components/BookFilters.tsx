import { BookFilters, SortType, Book } from '../types/book';
import { categories, ageRatings } from '../data/books';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { EnhancedSearch } from './EnhancedSearch';

interface BookFiltersProps {
  filters: BookFilters;
  onFiltersChange: (filters: BookFilters) => void;
  books: Book[];
  onSelectBook?: (book: Book) => void;
}

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'trending', label: '🔥 Trending' },
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'most-purchased', label: 'Most Purchased' },
  { value: 'rating', label: 'Best Rating' },
  { value: 'newest', label: 'Newest' },
  { value: 'alphabetical', label: 'A-Z' },
];

export function BookFiltersComponent({ filters, onFiltersChange, books, onSelectBook }: BookFiltersProps) {
  const updateFilter = (key: keyof BookFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnhancedSearch
            books={books}
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
            onSelectBook={onSelectBook}
            placeholder="Search books, authors, categories..."
          />
          
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.ageRating} onValueChange={(value) => updateFilter('ageRating', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Ages" />
            </SelectTrigger>
            <SelectContent>
              {ageRatings.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as SortType)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
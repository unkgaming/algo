import { TrendingUp, Eye, Heart, ShoppingCart, Flame } from 'lucide-react';
import { Book, TrendingScore } from '../types/book';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

interface TrendingSectionProps {
  trendingBooks: Book[];
  trendingScores: TrendingScore[];
  trendingCategories: string[];
  onViewBook: (book: Book) => void;
  onFilterByCategory: (category: string) => void;
}

export function TrendingSection({
  trendingBooks,
  trendingScores,
  trendingCategories,
  onViewBook,
  onFilterByCategory
}: TrendingSectionProps) {
  const getTrendingScore = (bookId: string) => {
    return trendingScores.find(score => score.bookId === bookId);
  };

  const formatTrendingMetric = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  if (trendingBooks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Trending Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Trending Now
            <Badge variant="secondary" className="ml-2">
              Hot
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {trendingBooks.slice(0, 10).map((book) => {
                const score = getTrendingScore(book.id);
                return (
                  <Card
                    key={book.id}
                    className="w-72 flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onViewBook(book)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{book.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {book.author}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {book.category}
                          </Badge>
                          
                          {score && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {score.recentViews > 0 && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{formatTrendingMetric(score.recentViews)}</span>
                                </div>
                              )}
                              {score.recentLikes > 0 && (
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{formatTrendingMetric(score.recentLikes)}</span>
                                </div>
                              )}
                              {score.recentPurchases > 0 && (
                                <div className="flex items-center gap-1">
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>{formatTrendingMetric(score.recentPurchases)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Trending Categories */}
      {trendingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Hot Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingCategories.map((category, index) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterByCategory(category)}
                  className="relative"
                >
                  {category}
                  {index === 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 text-xs px-1 py-0"
                    >
                      #1
                    </Badge>
                  )}
                  {index === 1 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 text-xs px-1 py-0"
                    >
                      #2
                    </Badge>
                  )}
                  {index === 2 && (
                    <Badge
                      variant="outline"
                      className="absolute -top-2 -right-2 text-xs px-1 py-0"
                    >
                      #3
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
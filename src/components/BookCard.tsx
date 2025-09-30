import { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Book } from '../types/book';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
  onLike: (bookId: string) => void;
  onAddToCart: (bookId: string) => void;
}

export function BookCard({ book, onViewDetails, onLike, onAddToCart }: BookCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(book.id);
  };

  const handleAddToCart = () => {
    onAddToCart(book.id);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative">
          <ImageWithFallback
            src={book.coverImage}
            alt={book.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {book.ageRating}
            </Badge>
            {book.isUserAdded && (
              <Badge variant="outline" className="bg-blue-500/80 text-white border-blue-500">
                User Added
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(book)}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs mb-2">
              {book.category}
            </Badge>
            <h3 className="line-clamp-2 mb-1">{book.title}</h3>
            <p className="text-muted-foreground text-sm">{book.author}</p>
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(book.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-1">
              {book.rating}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{book.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                <span>{book.purchases.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">${book.price}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={`flex-1 ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
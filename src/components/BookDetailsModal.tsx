import { X, Heart, ShoppingCart, Star, Calendar, User, Tag } from 'lucide-react';
import { Book } from '../types/book';
import { Dialog, DialogContent, DialogHeader, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (bookId: string) => void;
  onAddToCart: (bookId: string) => void;
}

export function BookDetailsModal({ book, isOpen, onClose, onLike, onAddToCart }: BookDetailsModalProps) {
  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogDescription>
            View detailed information about {book.title} by {book.author}, including description, ratings, and purchase options.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <ImageWithFallback
              src={book.coverImage}
              alt={book.title}
              className="w-full h-96 object-cover rounded-lg"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onLike(book.id)}
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                Like ({book.likes.toLocaleString()})
              </Button>
              <Button
                onClick={() => onAddToCart(book.id)}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl mb-2">{book.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{book.author}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {book.category}
              </Badge>
              <Badge variant="secondary">
                {book.ageRating}
              </Badge>
              {book.isUserAdded && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  User Added
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(book.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {book.rating} / 5
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{book.publishedYear}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                  <Heart className="w-4 h-4" />
                  <span>Likes</span>
                </div>
                <div className="text-lg">{book.likes.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Purchases</span>
                </div>
                <div className="text-lg">{book.purchases.toLocaleString()}</div>
              </div>
            </div>
            
            <div>
              <h3 className="mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-2xl mb-2">${book.price}</div>
              <p className="text-sm text-muted-foreground">
                Published in {book.publishedYear} • {book.category} • {book.ageRating}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
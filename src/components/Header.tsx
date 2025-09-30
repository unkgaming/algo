import { Plus, BookOpen, TrendingUp, Star, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  onAddBook: () => void;
  onViewCart: () => void;
  totalBooks: number;
  totalLikes: number;
  totalPurchases: number;
  cartItemCount: number;
}

export function Header({ onAddBook, onViewCart, totalBooks, totalLikes, totalPurchases, cartItemCount }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-2xl">BookShop</h1>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {totalBooks} Books Available
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{totalLikes.toLocaleString()} total likes</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>{totalPurchases.toLocaleString()} purchases</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={onViewCart} 
                className="relative flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
              
              <Button onClick={onAddBook} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Book</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex md:hidden items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalBooks} books</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{totalLikes.toLocaleString()} likes</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>{totalPurchases.toLocaleString()} purchases</span>
          </div>
        </div>
      </div>
    </header>
  );
}
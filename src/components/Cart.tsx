import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { CartItem, Book } from '../types/book';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onCheckout: () => void;
  onBackToBooks: () => void;
}

export function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onBackToBooks }: CartProps) {
  const [isChecking, setIsChecking] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    setIsChecking(true);
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1500));
    onCheckout();
    setIsChecking(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBackToBooks} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Books
          </Button>
          <h1 className="text-2xl">Shopping Cart</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some books to get started!</p>
            <Button onClick={onBackToBooks}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBackToBooks} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Books
        </Button>
        <h1 className="text-2xl">Shopping Cart</h1>
        <Badge variant="secondary">{totalItems} {totalItems === 1 ? 'item' : 'items'}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.book.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={item.book.coverImage}
                    alt={item.book.title}
                    className="w-20 h-28 object-cover rounded flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="line-clamp-2 text-sm mb-1">{item.book.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.book.author}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.book.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.book.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.book.id, Math.max(0, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.book.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm">${item.book.price} each</div>
                        <div className="font-medium">${(item.book.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(total * 1.08).toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout} 
                className="w-full" 
                size="lg"
                disabled={isChecking}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isChecking ? 'Processing...' : `Checkout - $${(total * 1.08).toFixed(2)}`}
              </Button>
              
              <Button variant="outline" onClick={onBackToBooks} className="w-full">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
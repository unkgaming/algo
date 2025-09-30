import { useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Plus, Upload } from 'lucide-react';
import { Book } from '../types/book';
import { categories, ageRatings } from '../data/books';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Omit<Book, 'id'>) => void;
}

type FormData = {
  title: string;
  author: string;
  category: string;
  ageRating: 'Children' | 'Young Adult' | 'Adult' | 'All Ages';
  description: string;
  price: number;
  publishedYear: number;
  coverImageUrl: string;
};

export function AddBookModal({ isOpen, onClose, onAddBook }: AddBookModalProps) {
  const [coverImageUrl, setCoverImageUrl] = useState('');
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  const selectedCategory = watch('category');
  const selectedAgeRating = watch('ageRating');

  const onSubmit = (data: FormData) => {
    const newBook: Omit<Book, 'id'> = {
      ...data,
      coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1711185898594-868789f76f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBub3ZlbCUyMGZpY3Rpb258ZW58MXx8fHwxNzU4NjQ5MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      likes: 0,
      purchases: 0,
      rating: 0,
      isUserAdded: true
    };
    
    onAddBook(newBook);
    reset();
    setCoverImageUrl('');
    onClose();
  };

  const handleClose = () => {
    reset();
    setCoverImageUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Book
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new book to your collection. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter book title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register('author', { required: 'Author is required' })}
                placeholder="Enter author name"
              />
              {errors.author && (
                <p className="text-sm text-destructive">{errors.author.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'All').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Age Rating *</Label>
              <Select
                value={selectedAgeRating}
                onValueChange={(value) => setValue('ageRating', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age rating" />
                </SelectTrigger>
                <SelectContent>
                  {ageRatings.filter(age => age !== 'All').map((ageRating) => (
                    <SelectItem key={ageRating} value={ageRating}>
                      {ageRating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publishedYear">Published Year *</Label>
              <Input
                id="publishedYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                {...register('publishedYear', { 
                  required: 'Published year is required',
                  min: { value: 1000, message: 'Year must be valid' },
                  max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
                })}
                placeholder="2024"
              />
              {errors.publishedYear && (
                <p className="text-sm text-destructive">{errors.publishedYear.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Enter book description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="coverImageUrl"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/book-cover.jpg"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to use default cover image
            </p>
          </div>
          
          {coverImageUrl && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm">Preview:</Label>
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-32 h-48 object-cover rounded mt-2"
                  onError={() => setCoverImageUrl('')}
                />
              </CardContent>
            </Card>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
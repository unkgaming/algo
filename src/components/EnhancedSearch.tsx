import { useState, useEffect, useRef } from 'react';
import { Search, Clock, User, Tag, X } from 'lucide-react';
import { Book, AutoCompleteResult } from '../types/book';
import { FuzzySearch, SearchAnalytics } from '../utils/search';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface EnhancedSearchProps {
  books: Book[];
  value: string;
  onChange: (value: string) => void;
  onSelectBook?: (book: Book) => void;
  placeholder?: string;
}

export function EnhancedSearch({ 
  books, 
  value, 
  onChange, 
  onSelectBook,
  placeholder = "Search books, authors, categories..." 
}: EnhancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [autoCompleteResults, setAutoCompleteResults] = useState<AutoCompleteResult[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load popular searches and search history
    setPopularSearches(SearchAnalytics.getPopularSearches(5));
    
    // Load recent searches from localStorage
    const recent = SearchAnalytics.getSearchHistory()
      .slice(-5)
      .map(s => s.query)
      .filter((query, index, arr) => arr.indexOf(query) === index);
    setSearchHistory(recent);
  }, []);

  useEffect(() => {
    if (value.trim().length > 0) {
      const results = FuzzySearch.generateAutoComplete(books, value, 6);
      setAutoCompleteResults(results);
    } else {
      setAutoCompleteResults([]);
    }
  }, [value, books]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectSuggestion = (suggestion: string | AutoCompleteResult) => {
    if (typeof suggestion === 'string') {
      onChange(suggestion);
      setIsOpen(false);
      
      // Track search
      SearchAnalytics.saveSearch({
        query: suggestion,
        timestamp: Date.now(),
        resultsCount: FuzzySearch.searchBooks(books, suggestion).length
      });
    } else {
      if (suggestion.type === 'book' && suggestion.book && onSelectBook) {
        onSelectBook(suggestion.book);
        setIsOpen(false);
      } else {
        onChange(suggestion.text);
        setIsOpen(false);
        
        // Track search
        SearchAnalytics.saveSearch({
          query: suggestion.text,
          timestamp: Date.now(),
          resultsCount: FuzzySearch.searchBooks(books, suggestion.text).length,
          bookId: suggestion.book?.id
        });
      }
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'author':
        return <User className="w-4 h-4" />;
      case 'category':
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-9 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Auto-complete results */}
            {autoCompleteResults.length > 0 && (
              <div className="border-b">
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">Suggestions</p>
                  {autoCompleteResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.text}-${index}`}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => handleSelectSuggestion(result)}
                    >
                      {getIconForType(result.type)}
                      <div className="flex-1">
                        <span className="text-sm">{result.text}</span>
                        {result.type !== 'book' && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {result.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent searches */}
            {value.length === 0 && searchHistory.length > 0 && (
              <div className="border-b">
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">Recent searches</p>
                  {searchHistory.map((search, index) => (
                    <div
                      key={`recent-${search}-${index}`}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => handleSelectSuggestion(search)}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches */}
            {value.length === 0 && popularSearches.length > 0 && (
              <div>
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">Popular searches</p>
                  {popularSearches.map((search, index) => (
                    <div
                      key={`popular-${search}-${index}`}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => handleSelectSuggestion(search)}
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {value.length > 0 && autoCompleteResults.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">No suggestions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
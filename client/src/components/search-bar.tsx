
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2, ShoppingCart, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PRODUCT_CATEGORIES, formatPrice } from '@/lib/constants';
import { useLocation } from 'wouter';
import type { Product } from '@shared/schema';

interface SearchResult {
  query: string;
  results: Product[];
  total: number;
  suggestions: string[];
}

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function SearchBar({ isOpen, onClose, onProductSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // YouTube-style search API call
  const { data: searchResults, isLoading, error } = useQuery<SearchResult>({
    queryKey: ["/api/search", debouncedSearchTerm],
    enabled: debouncedSearchTerm.length >= 1,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  // Search suggestions API
  const { data: suggestions = [] } = useQuery<string[]>({
    queryKey: ["/api/search/suggestions", debouncedSearchTerm],
    enabled: debouncedSearchTerm.length >= 1 && debouncedSearchTerm.length < 3,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSearchTerm('');
        setSelectedIndex(-1);
      }, 100);
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.length > 0);
  };

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    saveToRecentSearches(searchTerm);
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      setLocation(`/product/${product.id}`);
    }
    handleClose();
  };

  // Handle search execution
  const executeSearch = (query: string = searchTerm) => {
    if (!query.trim()) return;
    
    saveToRecentSearches(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
    handleClose();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    executeSearch(suggestion);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recent: string) => {
    setSearchTerm(recent);
    executeSearch(recent);
  };

  // Handle close
  const handleClose = () => {
    setSearchTerm('');
    setSelectedIndex(-1);
    setShowSuggestions(false);
    onClose();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedIndex(-1);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = (searchResults?.results.length || 0) + suggestions.length + recentSearches.length;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : totalItems - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0) {
            if (selectedIndex < (searchResults?.results.length || 0)) {
              // Product selected
              const product = searchResults?.results[selectedIndex];
              if (product) handleProductSelect(product);
            } else if (selectedIndex < (searchResults?.results.length || 0) + suggestions.length) {
              // Suggestion selected
              const suggestionIndex = selectedIndex - (searchResults?.results.length || 0);
              const suggestion = suggestions[suggestionIndex];
              if (suggestion) handleSuggestionClick(suggestion);
            } else {
              // Recent search selected
              const recentIndex = selectedIndex - (searchResults?.results.length || 0) - suggestions.length;
              const recent = recentSearches[recentIndex];
              if (recent) handleRecentSearchClick(recent);
            }
          } else {
            executeSearch();
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, suggestions, recentSearches, selectedIndex]);

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
      cat.id === category || cat.name.toLowerCase().includes(category.toLowerCase())
    );
    return categoryInfo?.name || category;
  };

  // Popular searches
  const popularSearches = [
    "গিফট", "উপহার", "কাস্টম মগ", "টি-শার্ট", "ফ্রেম", "কিচেইন"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="modal-container max-w-4xl">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Search className="w-6 h-6 text-primary" />
            স্মার্ট সার্চ
          </DialogTitle>
          <DialogDescription className="sr-only">
            পণ্য খুঁজুন এবং তাৎক্ষণিক ফলাফল দেখুন
          </DialogDescription>
        </DialogHeader>
        
        <div className="modal-content">
          {/* Search Input */}
          <div className="px-6 py-4 border-b">
            <form onSubmit={(e) => { e.preventDefault(); executeSearch(); }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="পণ্যের নাম, ক্যাটেগরি বা বর্ণনা লিখুন... (YouTube-style অ্যালগোরিদম)"
                  className="pl-12 pr-12 py-3 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                  autoComplete="off"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
                {isLoading && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {/* Loading State */}
            {isLoading && debouncedSearchTerm && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p className="text-lg">খুঁজে দেখছি...</p>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && searchResults && searchResults.results.length > 0 && (
              <div className="p-6">
                <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  "{searchResults.query}" এর জন্য {searchResults.total}টি পণ্য পাওয়া গেছে (YouTube অ্যালগোরিদম ব্যবহার করে)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.results.map((product: Product, index: number) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`group bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary ${
                        index === selectedIndex ? 'border-primary shadow-lg bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(product.price)}
                            </span>
                            <Badge 
                              variant={product.stock > 0 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {product.stock > 0 ? `স্টক: ${product.stock}` : 'স্টক নেই'}
                            </Badge>
                          </div>

                          {product.category && (
                            <div className="mb-3">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryDisplayName(product.category)}
                              </Badge>
                            </div>
                          )}

                          <Button
                            size="sm"
                            className="w-full mt-auto group-hover:bg-primary group-hover:text-white transition-colors"
                            variant="outline"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            বিস্তারিত দেখুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && searchTerm && suggestions.length > 0 && (
              <div className="border-t p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">সাজেশন</h4>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                        index + (searchResults?.results.length || 0) === selectedIndex ? 'bg-blue-50 border border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults && searchResults.results.length === 0 && debouncedSearchTerm && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">কোন পণ্য পাওয়া যায়নি</h3>
                <p className="text-center max-w-md mb-4">
                  "{debouncedSearchTerm}" এর জন্য কোন ফলাফল নেই। 
                  অন্য কিছু দিয়ে খুঁজে দেখুন।
                </p>
                <Button variant="outline" onClick={clearSearch}>
                  সার্চ পরিষ্কার করুন
                </Button>
              </div>
            )}

            {/* Recent Searches & Popular Searches - Show when no query */}
            {!debouncedSearchTerm && (
              <div className="p-6 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-700">সাম্প্রতিক অনুসন্ধান</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        সব মুছুন
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((recent, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(recent)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{recent}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-700">জনপ্রিয় অনুসন্ধান</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(term)}
                        className="text-sm hover:bg-primary hover:text-white transition-colors"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">সার্চ টিপস:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• নির্দিষ্ট পণ্যের নাম লিখুন</li>
                    <li>• ক্যাটেগরি অনুযায়ী খুঁজুন</li>
                    <li>• একাধিক কীওয়ার্ড ব্যবহার করুন</li>
                    <li>• YouTube-style অ্যালগোরিদম সবচেয়ে প্রাসঙ্গিক ফলাফল দেখায়</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!debouncedSearchTerm && recentSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">পণ্য খুঁজুন</h3>
                <p className="text-center max-w-md">
                  আপনার পছন্দের পণ্য খুঁজে পেতে উপরের সার্চ বক্সে টাইপ করুন। 
                  YouTube-style অ্যালগোরিদম দিয়ে তাৎক্ষণিক ফলাফল পাবেন।
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-gray-50 text-center text-sm text-gray-600">
            <p>↑↓ নেভিগেট করুন | Enter সিলেক্ট করুন | ESC বন্ধ করুন</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

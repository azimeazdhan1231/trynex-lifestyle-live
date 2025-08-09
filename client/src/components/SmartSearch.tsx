
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface SmartSearchProps {
  onProductSelect?: (product: Product) => void;
  className?: string;
}

interface SearchResult {
  query: string;
  results: Product[];
  total: number;
  suggestions: string[];
}

export default function SmartSearch({ onProductSelect, className }: SmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // YouTube-style Search API call
  const { data: searchResults, isLoading, error } = useQuery<SearchResult>({
    queryKey: ["/api/search", debouncedQuery],
    enabled: debouncedQuery.length >= 1,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  // Popular search terms
  const popularSearches = [
    "গিফট", "উপহার", "কাস্টম মগ", "টি-শার্ট", "ফ্রেম", "কিচেইন"
  ];

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  };

  // Handle popular search click
  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    setIsOpen(true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = searchResults?.results.length || 0;

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
          if (selectedIndex >= 0 && searchResults?.results[selectedIndex]) {
            handleProductSelect(searchResults.results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          placeholder="পণ্য খুঁজুন... (YouTube অ্যালগোরিদম)"
          className="pl-10 pr-10 py-2 border-2 border-gray-200 focus:border-primary rounded-lg"
          autoComplete="off"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-2xl z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && debouncedQuery && (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-gray-600">খুঁজে দেখছি...</p>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && searchResults && searchResults.results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm text-gray-600">
                    "{searchResults.query}" এর জন্য {searchResults.total}টি পণ্য
                  </p>
                </div>
                <div className="space-y-1 p-2">
                  {searchResults.results.slice(0, 6).map((product: Product, index: number) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors ${
                        index === selectedIndex ? 'bg-blue-50 border border-primary' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          <Badge 
                            variant={product.stock > 0 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {product.stock > 0 ? `স্টক: ${product.stock}` : 'স্টক নেই'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults && searchResults.results.length === 0 && debouncedQuery && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  "{debouncedQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি
                </p>
                <p className="text-xs text-gray-500">
                  অন্য কীওয়ার্ড চেষ্টা করুন
                </p>
              </div>
            )}

            {/* Popular Searches - Show when no query */}
            {!debouncedQuery && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">জনপ্রিয় অনুসন্ধান</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePopularSearchClick(term)}
                      className="text-xs hover:bg-primary hover:text-white transition-colors"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Tips */}
            {!debouncedQuery && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  YouTube-style অ্যালগোরিদম ব্যবহার করে সবচেয়ে প্রাসঙ্গিক ফলাফল দেখানো হয়
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

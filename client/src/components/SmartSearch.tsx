import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
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
}

export default function SmartSearch({ onProductSelect, className }: SmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search API call
  const { data: searchResults, isLoading, error } = useQuery<SearchResult>({
    queryKey: ["/api/search", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Popular search terms
  const popularSearches = [
    "গিফট", "উপহার", "নতুন", "বেস্ট সেলার", "ফ্যাশন", "ইলেকট্রনিক্স"
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsOpen(true);
  };

  const handleProductClick = (product: Product) => {
    setIsOpen(false);
    setSearchQuery('');
    onProductSelect?.(product);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="পণ্য খুঁজুন... (যেমন: গিফট, মোবাইল, ফ্যাশন)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-2 border-gray-100 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && debouncedQuery && (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600">খুঁজে দেখছি...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600">খোঁজায় সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>
              </div>
            )}

            {/* Search Results */}
            {searchResults && searchResults.results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">
                    "{searchResults.query}" এর জন্য {searchResults.total}টি ফলাফল
                  </p>
                </div>
                
                <div className="p-2">
                  {searchResults.results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={product.image_url || 'https://via.placeholder.com/40x40'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={product.stock > 0 ? "secondary" : "destructive"} 
                              className="text-xs"
                            >
                              স্টক: {product.stock}
                            </Badge>
                            {product.is_featured && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                                ফিচার্ড
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults && searchResults.results.length === 0 && debouncedQuery && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  "{debouncedQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি
                </p>
                <p className="text-xs text-gray-500">
                  অন্য কীওয়ার্ড চেষ্টা করুন বা AI চ্যাটবটে প্রশ্ন করুন
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
                      onClick={() => handleSearch(term)}
                      className="h-7 text-xs rounded-full border-gray-200 hover:border-primary hover:text-primary"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
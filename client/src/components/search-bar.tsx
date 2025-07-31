import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface SearchBarProps {
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onProductSelect, placeholder = "পণ্য খুঁজুন...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Load all products for search
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products based on search query (YouTube-like algorithm)
  const searchResults = debouncedQuery.length >= 2 ? products.filter(product => {
    const searchTerm = debouncedQuery.toLowerCase();
    const productName = product.name.toLowerCase();
    const productCategory = (product.category || '').toLowerCase();
    const productDescription = (product.description || '').toLowerCase();

    // Exact match gets highest priority
    if (productName.includes(searchTerm)) return true;
    
    // Category match
    if (productCategory.includes(searchTerm)) return true;
    
    // Description match
    if (productDescription.includes(searchTerm)) return true;
    
    // Fuzzy matching for Bengali/English
    const words = searchTerm.split(' ');
    return words.some(word => 
      productName.includes(word) || 
      productCategory.includes(word) ||
      productDescription.includes(word)
    );
  }).slice(0, 8) : [];

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    
    if (value.length >= 2) {
      trackEvent('search', 'product_search', value);
    }
  };

  const handleProductClick = (product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    trackEvent('search_result_click', 'product_search', product.name);
    
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-primary transition-colors"
        />
        {query && (
          <Button
            onClick={clearSearch}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border-2">
          <CardContent className="p-0">
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">খুঁজছি...</span>
              </div>
            )}

            {!isLoading && debouncedQuery.length >= 2 && searchResults.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>কোন পণ্য পাওয়া যায়নি</p>
                <p className="text-sm mt-1">অন্য কীওয়ার্ড দিয়ে খুঁজে দেখুন</p>
              </div>
            )}

            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 mr-3">
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.category && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-3">
                  {product.stock > 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      স্টক: {product.stock}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      স্টক নেই
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {searchResults.length > 0 && (
              <div className="p-3 bg-gray-50 text-center">
                <p className="text-sm text-gray-600">
                  {searchResults.length} টি ফলাফল পাওয়া গেছে
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
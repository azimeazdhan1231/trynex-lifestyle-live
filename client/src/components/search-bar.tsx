
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface SearchBarProps {
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onProductSelect, 
  placeholder = "পণ্য খুঁজুন...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load all products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Real-time search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
    
    const results = products
      .map(product => {
        const name = product.name.toLowerCase();
        const category = (product.category || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        
        let score = 0;
        let matchedTerms = 0;
        
        // Check each word in the search query
        words.forEach(word => {
          // Exact matches get highest priority
          if (name.includes(word)) {
            score += 100;
            matchedTerms++;
            
            // Bonus for name starting with the word
            if (name.startsWith(word)) {
              score += 50;
            }
          }
          
          // Category matches
          if (category.includes(word)) {
            score += 80;
            matchedTerms++;
          }
          
          // Description matches
          if (description.includes(word)) {
            score += 30;
            matchedTerms++;
          }
          
          // Partial matches within words
          const nameWords = name.split(/\s+/);
          nameWords.forEach(nameWord => {
            if (nameWord.includes(word) && nameWord !== word) {
              score += 40;
            }
          });
        });
        
        // Must match at least one term
        if (matchedTerms === 0) {
          score = 0;
        } else {
          // Bonus for matching more terms
          score += matchedTerms * 20;
          
          // Bonus for in-stock items
          if (product.stock > 0) {
            score += 25;
          }
          
          // Bonus for exact query match
          if (name === normalizedQuery) {
            score += 200;
          }
        }
        
        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        // First sort by score
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Then by stock (in-stock first)
        if (b.product.stock !== a.product.stock) {
          return b.product.stock - a.product.stock;
        }
        // Finally by name alphabetically
        return a.product.name.localeCompare(b.product.name);
      })
      .slice(0, 10)
      .map(item => item.product);
    
    setSearchResults(results);
    setIsSearching(false);
  }, [products]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // For instant feedback on first character, search immediately
    if (value.length === 1) {
      performSearch(value);
    } else {
      // For subsequent characters, debounce for better performance
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 150);
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    setSearchResults([]);
    
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Highlight matched text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const words = query.toLowerCase().trim().split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-primary transition-all duration-200 bg-white"
          autoComplete="off"
        />
        {query && (
          <Button
            onClick={clearSearch}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-100 z-10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Live Search Results */}
      {isOpen && query.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[400px] overflow-hidden shadow-xl border-2 border-gray-100">
          <CardContent className="p-0">
            {/* Loading State */}
            {(isSearching || isLoadingProducts) && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-gray-600">খুঁজছি...</span>
              </div>
            )}

            {/* No Results */}
            {!isSearching && !isLoadingProducts && searchResults.length === 0 && query.length > 0 && (
              <div className="p-6 text-center">
                <div className="text-gray-500 mb-2">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">কোন পণ্য পাওয়া যায়নি</p>
                  <p className="text-sm mt-1">"{query}" এর জন্য কোন ফলাফল নেই</p>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন
                </p>
              </div>
            )}

            {/* Search Results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="max-h-[350px] overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b">
                  <p className="text-sm text-gray-600 font-medium">
                    {searchResults.length} টি ফলাফল পাওয়া গেছে
                  </p>
                </div>
                
                {searchResults.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors duration-200"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-12 h-12 mr-4 relative">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-semibold text-gray-900 truncate text-lg"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightMatch(product.name, query) 
                        }}
                      />
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.category && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex-shrink-0 ml-3 text-right">
                      <Badge 
                        variant={product.stock > 0 ? "secondary" : "destructive"} 
                        className="text-xs mb-1"
                      >
                        {product.stock > 0 ? `স্টক: ${product.stock}` : "স্টক নেই"}
                      </Badge>
                      {index < 3 && (
                        <div className="text-xs text-green-600 font-medium">
                          সেরা মিল
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

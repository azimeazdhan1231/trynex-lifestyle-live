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

  // Enhanced search algorithm with scoring (YouTube-like)
  const searchResults = debouncedQuery.length >= 2 ? products
    .map(product => {
      const searchTerm = debouncedQuery.toLowerCase().trim();
      const productName = product.name.toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      const productDescription = (product.description || '').toLowerCase();
      
      let score = 0;
      
      // Exact name match gets highest score
      if (productName === searchTerm) score += 100;
      else if (productName.startsWith(searchTerm)) score += 80;
      else if (productName.includes(searchTerm)) score += 60;
      
      // Category matching
      if (productCategory === searchTerm) score += 70;
      else if (productCategory.includes(searchTerm)) score += 40;
      
      // Description matching
      if (productDescription.includes(searchTerm)) score += 20;
      
      // Word-by-word matching for better results
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 1);
      const nameWords = productName.split(/\s+/);
      const categoryWords = productCategory.split(/\s+/);
      
      searchWords.forEach(searchWord => {
        // Exact word match in name
        if (nameWords.some(word => word === searchWord)) score += 50;
        // Partial word match in name
        else if (nameWords.some(word => word.includes(searchWord))) score += 25;
        
        // Word match in category
        if (categoryWords.some(word => word.includes(searchWord))) score += 15;
        
        // Character similarity (for typos)
        nameWords.forEach(nameWord => {
          if (nameWord.length >= 3 && searchWord.length >= 3) {
            const similarity = calculateSimilarity(searchWord, nameWord);
            if (similarity > 0.7) score += Math.floor(similarity * 30);
          }
        });
      });
      
      // Boost popular/in-stock items
      if (product.stock > 0) score += 10;
      if (product.stock > 10) score += 5;
      
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.product) : [];

  // Simple similarity function for typo tolerance
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance for better matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

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
    
    // Prevent any default behavior that might cause navigation
    if (onProductSelect) {
      // Small delay to ensure UI updates properly
      setTimeout(() => {
        onProductSelect(product);
      }, 100);
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

  // Generate search suggestions based on available products
  const generateSearchSuggestions = (query: string, products: Product[]): string[] => {
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();
    
    // Add category suggestions
    products.forEach(product => {
      if (product.category && product.category.toLowerCase().includes(queryLower)) {
        suggestions.add(product.category);
      }
      
      // Add similar product names
      const words = product.name.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 2 && word.includes(queryLower)) {
          suggestions.add(word);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 4);
  };

  // Get popular searches based on categories and common terms
  const getPopularSearches = (products: Product[]): string[] => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories.slice(0, 6);
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
                <p>কোন পণ্য পাওয়া যায়নি "{debouncedQuery}" এর জন্য</p>
                <p className="text-sm mt-1">সম্ভাব্য সাজেশন:</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {generateSearchSuggestions(debouncedQuery, products).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion);
                        setDebouncedQuery(suggestion);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {debouncedQuery.length < 2 && query.length >= 1 && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-2">জনপ্রিয় খোঁজ:</p>
                <div className="flex flex-wrap gap-2">
                  {getPopularSearches(products).map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(term);
                        setDebouncedQuery(term);
                      }}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.map((product, index) => {
              const searchTerm = debouncedQuery.toLowerCase();
              const highlightText = (text: string) => {
                if (!searchTerm) return text;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
              };

              return (
                <div
                  key={product.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 mr-3 relative">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {index < 3 && (
                      <div className="absolute -top-1 -left-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-medium text-gray-900 truncate"
                      dangerouslySetInnerHTML={{ __html: highlightText(product.name) }}
                    />
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.category && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 text-xs"
                          dangerouslySetInnerHTML={{ __html: highlightText(product.category) }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-3 flex flex-col items-end">
                    {product.stock > 0 ? (
                      <Badge variant="secondary" className="text-xs mb-1">
                        স্টক: {product.stock}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs mb-1">
                        স্টক নেই
                      </Badge>
                    )}
                    {index < 3 && (
                      <span className="text-xs text-green-600 font-medium">সেরা মিল</span>
                    )}
                  </div>
                </div>
              );
            })}

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
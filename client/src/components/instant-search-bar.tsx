import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  X, 
  TrendingUp, 
  Clock, 
  ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface InstantSearchBarProps {
  className?: string;
  placeholder?: string;
  onProductSelect?: (product: Product) => void;
  initialQuery?: string;
}

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InstantSearchBar({ 
  className = "", 
  placeholder = "পণ্য খুঁজুন...",
  onProductSelect,
  initialQuery = ""
}: InstantSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounced search query for API calls
  const debouncedQuery = useDebounce(query.trim(), 300);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trynex_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(term => term !== searchTerm)
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('trynex_recent_searches', JSON.stringify(newRecentSearches));
  }, [recentSearches]);

  // Fetch search results
  const { data: searchResults = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/search', debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Popular search terms
  const popularSearches = [
    "মগ", "টি-শার্ট", "কিমগ", "ফটো ফ্রেম", "গিফট বক্স",
    "পার্সোনালাইজড গিফট", "বার্থডে গিফট", "অ্যানিভার্সারি গিফট"
  ];

  // Generate search suggestions
  const suggestions = debouncedQuery.length >= 2 
    ? searchResults.slice(0, 8)
    : [];

  const showSuggestions = isOpen && (suggestions.length > 0 || recentSearches.length > 0 || popularSearches.length > 0);

  // Handle search submission
  const handleSearch = useCallback((searchTerm: string = query) => {
    if (!searchTerm.trim()) return;
    
    saveRecentSearch(searchTerm.trim());
    setIsOpen(false);
    setLocation(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  }, [query, saveRecentSearch, setLocation]);

  // Handle product selection
  const handleProductSelect = useCallback((product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    saveRecentSearch(product.name);
    
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      setLocation(`/product/${product.id}`);
    }
  }, [onProductSelect, saveRecentSearch, setLocation]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const totalItems = suggestions.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleProductSelect(suggestions[selectedIndex]);
        } else if (selectedIndex >= suggestions.length && selectedIndex < totalItems) {
          const recentIndex = selectedIndex - suggestions.length;
          const recentSearch = recentSearches[recentIndex];
          if (recentSearch) {
            setQuery(recentSearch);
            handleSearch(recentSearch);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, recentSearches, selectedIndex, handleProductSelect, handleSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('trynex_recent_searches');
  }, []);

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-12 py-2 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-gray-50 dark:bg-gray-800"
          data-testid="instant-search-input"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-0">
            {/* Search Results */}
            {suggestions.length > 0 && (
              <div className="border-b border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  পণ্য সমূহ
                </div>
                {suggestions.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3",
                      selectedIndex === index && "bg-gray-50 dark:bg-gray-700"
                    )}
                    data-testid={`search-result-${index}`}
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatPrice(parseFloat(product.price))}
                        {product.category && (
                          <span className="ml-2">• {product.category}</span>
                        )}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="border-b border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    সাম্প্রতিক অনুসন্ধান
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 h-auto"
                  >
                    সব মুছুন
                  </Button>
                </div>
                {recentSearches.map((searchTerm, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(searchTerm);
                      handleSearch(searchTerm);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3",
                      selectedIndex === suggestions.length + index && "bg-gray-50 dark:bg-gray-700"
                    )}
                    data-testid={`recent-search-${index}`}
                  >
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {searchTerm}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {debouncedQuery.length < 2 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  জনপ্রিয় অনুসন্ধান
                </div>
                <div className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => {
                          setQuery(term);
                          handleSearch(term);
                        }}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">খুঁজে দেখছি...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && debouncedQuery.length >= 2 && suggestions.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  কোন পণ্য পাওয়া যায়নি
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleSearch()}
                  className="text-primary"
                >
                  সব ফলাফল দেখুন
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
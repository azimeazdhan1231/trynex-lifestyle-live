import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
// Debounce implementation
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface SearchSuggestion {
  query: string;
  type: 'recent' | 'trending' | 'suggestion';
  count?: number;
}

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  inStock: boolean;
}

interface YoutubeSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function YoutubeSearchBar({ isOpen, onClose, initialQuery = "" }: YoutubeSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "relevance",
    inStock: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Get search suggestions with advanced algorithm
  const { data: searchSuggestions } = useQuery({
    queryKey: ["/api/search/suggestions", query],
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Get product suggestions for auto-complete
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        generateSuggestions(searchQuery);
      }
    }, 300),
    []
  );

  // Generate intelligent suggestions
  const generateSuggestions = useCallback((searchQuery: string) => {
    const newSuggestions: SearchSuggestion[] = [];
    
    // Add recent searches that match
    const matchingRecent = recentSearches
      .filter(recent => recent.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(recent => ({
        query: recent,
        type: 'recent' as const
      }));
    
    newSuggestions.push(...matchingRecent);

    // Use real product data for suggestions
    if (products && Array.isArray(products)) {
      // Product name matching
      const matchingProducts = products
        .filter((product: any) => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
        .map((product: any) => ({
          query: product.name,
          type: 'trending' as const,
          count: product.stock
        }));
      
      newSuggestions.push(...matchingProducts);
    }

    // Add intelligent auto-complete suggestions  
    const autoComplete = [
      `${searchQuery} গিফট`,
      `${searchQuery} কাস্টম`,
      `${searchQuery} ব্যক্তিগত`,
      `${searchQuery} বিশেষ`,
      `${searchQuery} হ্যান্ডমেড`
    ].slice(0, 2).map(suggestion => ({
      query: suggestion,
      type: 'suggestion' as const
    }));
    
    newSuggestions.push(...autoComplete);

    setSuggestions(newSuggestions);
    setShowSuggestions(true);
  }, [recentSearches]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  // Execute search with advanced algorithm
  const executeSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    saveToRecentSearches(searchQuery);
    
    // Build search URL with advanced parameters
    const searchParams = new URLSearchParams();
    searchParams.set('q', searchQuery);
    searchParams.set('algorithm', 'youtube'); // Use YouTube-style algorithm
    
    if (filters.category !== 'all') {
      searchParams.set('category', filters.category);
    }
    if (filters.minPrice) {
      searchParams.set('min_price', filters.minPrice);
    }
    if (filters.maxPrice) {
      searchParams.set('max_price', filters.maxPrice);
    }
    if (filters.sortBy !== 'relevance') {
      searchParams.set('sort', filters.sortBy);
    }
    if (filters.inStock) {
      searchParams.set('in_stock', 'true');
    }

    // Navigate to search results
    setLocation(`/search?${searchParams.toString()}`);
    onClose();
    setIsSearching(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    executeSearch(suggestion.query);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 px-4">
        <div ref={containerRef} className="w-full max-w-2xl">
          {/* Main Search Bar */}
          <Card className="shadow-2xl">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="পণ্য খুঁজুন... (যেমন: কাস্টম মগ, টি-শার্ট, গিফট)"
                      value={query}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 py-4 text-lg border-0 focus:ring-0 focus:border-0 rounded-l-lg"
                    />
                    {query && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={!query.trim() || isSearching}
                    className="px-6 py-4 text-lg bg-primary hover:bg-primary/90 rounded-l-none"
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-4 py-4 ml-2 rounded-lg border-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </form>

              {/* Advanced Filters */}
              <div className="border-t p-4">
                <div className="flex items-center justify-between mb-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    উন্নত ফিল্টার
                  </Button>
                  {Object.values(filters).some(v => v && v !== 'all' && v !== 'relevance') && (
                    <Badge variant="secondary" className="text-xs">
                      ফিল্টার সক্রিয়
                    </Badge>
                  )}
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="ক্যাটেগরি" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                        <SelectItem value="mugs">মগ</SelectItem>
                        <SelectItem value="t-shirts">টি-শার্ট</SelectItem>
                        <SelectItem value="frames">ফ্রেম</SelectItem>
                        <SelectItem value="keychains">কিচেইন</SelectItem>
                        <SelectItem value="custom-gifts">কাস্টম গিফট</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        placeholder="সর্বনিম্ন দাম"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        type="number"
                      />
                      <Input
                        placeholder="সর্বোচ্চ দাম"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        type="number"
                      />
                    </div>

                    <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="সর্ট করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">প্রাসঙ্গিকতা</SelectItem>
                        <SelectItem value="price-low">দাম: কম থেকে বেশি</SelectItem>
                        <SelectItem value="price-high">দাম: বেশি থেকে কম</SelectItem>
                        <SelectItem value="newest">নতুন</SelectItem>
                        <SelectItem value="popular">জনপ্রিয়</SelectItem>
                        <SelectItem value="rating">রেটিং</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="border-t max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-sm text-gray-600 px-3 py-2 font-medium">সাজেশন</div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <span className="flex-1">{suggestion.query}</span>
                        {suggestion.type === 'trending' && suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count} খোঁজ
                          </Badge>
                        )}
                        {suggestion.type === 'recent' && (
                          <Badge variant="outline" className="text-xs">
                            সাম্প্রতিক
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches (when no query) */}
              {!query && recentSearches.length > 0 && (
                <div className="border-t max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-sm text-gray-600 font-medium">সাম্প্রতিক অনুসন্ধান</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recent_searches');
                        }}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        সব মুছুন
                      </Button>
                    </div>
                    {recentSearches.slice(0, 5).map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick({ query: recent, type: 'recent' })}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="flex-1">{recent}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
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

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
  showFilters?: boolean;
}

export default function EnhancedSearchBar({ 
  onSearch, 
  placeholder = "পণ্য খুঁজুন...", 
  initialQuery = "",
  showFilters = false 
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Get product suggestions for auto-complete with optimized caching
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Real-time search with minimal delay (YouTube-style)
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        generateSuggestions(searchQuery);
        // Trigger live search
        onSearch(searchQuery);
        setTimeout(() => setIsSearching(false), 300);
      } else {
        onSearch('');
      }
    }, 150), // Reduced delay for instant feel like YouTube
    [onSearch]
  );

  // Generate intelligent suggestions with better performance
  const generateSuggestions = useCallback((searchQuery: string) => {
    const newSuggestions: SearchSuggestion[] = [];
    
    // Add recent searches that match (up to 3)
    const matchingRecent = recentSearches
      .filter(recent => recent.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(recent => ({
        query: recent,
        type: 'recent' as const
      }));
    
    newSuggestions.push(...matchingRecent);

    // Use real product data for smart suggestions
    if (products && Array.isArray(products)) {
      // Product name and category matching with relevance scoring
      const matchingProducts = products
        .filter((product: any) => {
          const name = (product.name || '').toLowerCase();
          const category = (product.category || '').toLowerCase();
          const description = (product.description || '').toLowerCase();
          const searchLower = searchQuery.toLowerCase();
          
          return name.includes(searchLower) || 
                 category.includes(searchLower) || 
                 description.includes(searchLower);
        })
        .sort((a: any, b: any) => {
          // Prioritize exact name matches, then partial matches
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          const searchLower = searchQuery.toLowerCase();
          
          if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
          if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;
          
          return aName.localeCompare(bName);
        })
        .slice(0, 4)
        .map((product: any) => ({
          query: product.name,
          type: 'trending' as const,
          count: product.stock
        }));
      
      newSuggestions.push(...matchingProducts);
    }

    // Add intelligent auto-complete suggestions (limited for performance)
    if (searchQuery.length >= 2) {
      const autoComplete = [
        `${searchQuery} গিফট`,
        `${searchQuery} কাস্টম`
      ].map(suggestion => ({
        query: suggestion,
        type: 'suggestion' as const
      }));
      
      newSuggestions.push(...autoComplete);
    }

    setSuggestions(newSuggestions.slice(0, 8)); // Limit to 8 suggestions
    setShowSuggestions(true);
  }, [recentSearches, products]);

  // Handle input change with instant feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      onSearch('');
    }
  };

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  // Execute search
  const executeSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    saveToRecentSearches(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    executeSearch(suggestion.query);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch(query);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => query && setShowSuggestions(true)}
          className="w-full pl-10 pr-12 h-11 text-base border-2 border-gray-200 focus:border-orange-500 transition-colors"
          data-testid="search-input"
        />
        
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              onSearch('');
              setShowSuggestions(false);
            }}
            className="absolute right-2 top-2 h-7 w-7 p-0 hover:bg-gray-100"
            data-testid="clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {isSearching && (
          <div className="absolute right-10 top-3.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                data-testid={`suggestion-${index}`}
              >
                {suggestion.type === 'recent' && (
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                {suggestion.type === 'trending' && (
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
                {suggestion.type === 'suggestion' && (
                  <Search className="h-4 w-4 text-orange-500 flex-shrink-0" />
                )}
                
                <span className="flex-1 text-sm text-gray-900 truncate">
                  {suggestion.query}
                </span>
                
                {suggestion.count !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.count} টি
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
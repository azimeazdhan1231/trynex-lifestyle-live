import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, X, TrendingUp, Clock, Hash, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product } from "@shared/schema";

interface SearchSuggestion {
  query: string;
  type: 'recent' | 'trending' | 'product' | 'category' | 'autocomplete';
  count?: number;
  product?: Product;
}

interface EnhancedSearchSystemProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function EnhancedSearchSystem({ 
  isOpen, 
  onClose, 
  placeholder = "পণ্য খুঁজুন...",
  autoFocus = true 
}: EnhancedSearchSystemProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Fetch products for search suggestions
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories for search suggestions
  const { data: categories = [] } = useQuery<{ name: string }[]>({
    queryKey: ['/api/categories'],
    select: (data) => data?.map(cat => ({ name: cat.name })) || [],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Generate intelligent search suggestions
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      // Show recent searches and trending when no query
      const recentSuggestions = recentSearches.slice(0, 5).map(recent => ({
        query: recent,
        type: 'recent' as const
      }));

      const trendingSuggestions = [
        { query: "কাস্টম মগ", count: 245, type: 'trending' as const },
        { query: "ব্যক্তিগত টি-শার্ট", count: 189, type: 'trending' as const },
        { query: "ফটো ফ্রেম গিফট", count: 156, type: 'trending' as const },
        { query: "বার্থডে গিফট", count: 134, type: 'trending' as const },
        { query: "কিচেইন", count: 98, type: 'trending' as const }
      ].slice(0, 3);

      setSuggestions([...recentSuggestions, ...trendingSuggestions]);
      return;
    }

    const newSuggestions: SearchSuggestion[] = [];
    const searchTerm = searchQuery.toLowerCase();

    // 1. Exact product matches (highest priority)
    const exactProductMatches = products
      .filter(product => {
        const name = (product.name || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        
        return name.includes(searchTerm) || 
               description.includes(searchTerm) || 
               category.includes(searchTerm);
      })
      .slice(0, 4)
      .map(product => ({
        query: product.name || '',
        type: 'product' as const,
        product
      }));

    newSuggestions.push(...exactProductMatches);

    // 2. Category suggestions
    const categoryMatches = categories
      .filter(cat => cat.name.toLowerCase().includes(searchTerm))
      .slice(0, 2)
      .map(cat => ({
        query: cat.name,
        type: 'category' as const
      }));

    newSuggestions.push(...categoryMatches);

    // 3. Auto-complete suggestions with Bengali support
    const autoCompleteSuggestions = [
      `${searchQuery} কাস্টম`,
      `${searchQuery} ব্যক্তিগত`,
      `${searchQuery} গিফট`,
      `${searchQuery} হ্যান্ডমেড`,
      `${searchQuery} বিশেষ`,
      `কাস্টম ${searchQuery}`,
      `ব্যক্তিগত ${searchQuery}`
    ]
      .filter(suggestion => suggestion.toLowerCase() !== searchTerm)
      .slice(0, 3)
      .map(suggestion => ({
        query: suggestion,
        type: 'autocomplete' as const
      }));

    newSuggestions.push(...autoCompleteSuggestions);

    // 4. Recent searches that match
    const matchingRecent = recentSearches
      .filter(recent => 
        recent.toLowerCase().includes(searchTerm) && 
        recent.toLowerCase() !== searchTerm
      )
      .slice(0, 2)
      .map(recent => ({
        query: recent,
        type: 'recent' as const
      }));

    newSuggestions.push(...matchingRecent);

    setSuggestions(newSuggestions.slice(0, 8)); // Limit to 8 suggestions
  }, [products, categories, recentSearches]);

  // Update suggestions when query changes
  useEffect(() => {
    generateSuggestions(debouncedQuery);
  }, [debouncedQuery, generateSuggestions]);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 10);
    
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Execute search
  const executeSearch = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    saveToRecentSearches(searchQuery);
    
    // Navigate to products page with search query
    const searchParams = new URLSearchParams();
    searchParams.set('search', searchQuery.trim());
    searchParams.set('algorithm', 'enhanced'); // Use enhanced search algorithm
    
    setLocation(`/products?${searchParams.toString()}`);
    onClose();
    setIsSearching(false);
  }, [query, saveToRecentSearches, setLocation, onClose]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' && suggestion.product) {
      // Navigate directly to product page
      setLocation(`/product/${suggestion.product.id}`);
      saveToRecentSearches(suggestion.query);
      onClose();
    } else if (suggestion.type === 'category') {
      // Navigate to products page with category filter
      const searchParams = new URLSearchParams();
      searchParams.set('category', suggestion.query);
      setLocation(`/products?${searchParams.toString()}`);
      saveToRecentSearches(suggestion.query);
      onClose();
    } else {
      // Execute search with suggestion
      setQuery(suggestion.query);
      executeSearch(suggestion.query);
    }
  }, [setLocation, saveToRecentSearches, onClose, executeSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        executeSearch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [suggestions, selectedIndex, handleSuggestionClick, executeSearch, onClose]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  }, [executeSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setSelectedIndex(-1);
    generateSuggestions("");
  }, [generateSuggestions]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
    generateSuggestions(query);
  }, [query, generateSuggestions]);

  // Get suggestion icon
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'product': return <Star className="w-4 h-4 text-blue-500" />;
      case 'category': return <Hash className="w-4 h-4 text-green-500" />;
      case 'autocomplete': return <Search className="w-4 h-4 text-gray-400" />;
      default: return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get suggestion type label
  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return 'সাম্প্রতিক';
      case 'trending': return 'জনপ্রিয়';
      case 'product': return 'পণ্য';
      case 'category': return 'ক্যাটেগরি';
      case 'autocomplete': return 'সাজেশন';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            উন্নত অনুসন্ধান
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pb-4">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-12 h-12 text-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
              autoFocus={autoFocus}
              data-testid="enhanced-search-input"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
                onClick={clearSearch}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </form>
        </div>

        {/* Search Suggestions */}
        <ScrollArea className="max-h-96">
          <div className="px-6 pb-6">
            {suggestions.length > 0 ? (
              <div className="space-y-1">
                {/* Recent searches header */}
                {!query && recentSearches.length > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600">সাম্প্রতিক অনুসন্ধান</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      সাফ করুন
                    </Button>
                  </div>
                )}

                {suggestions.map((suggestion, index) => (
                  <div key={`${suggestion.type}-${suggestion.query}-${index}`}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-auto p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedIndex === index ? 'bg-orange-50 border-orange-200' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={`search-suggestion-${index}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {getSuggestionIcon(suggestion.type)}
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {suggestion.query}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {getSuggestionTypeLabel(suggestion.type)}
                            </Badge>
                          </div>
                          
                          {suggestion.product && (
                            <div className="text-xs text-gray-500 mt-1">
                              {suggestion.product.category} • ৳{Number(suggestion.product.price).toLocaleString('bn-BD')}
                            </div>
                          )}
                          
                          {suggestion.count && (
                            <div className="text-xs text-gray-500 mt-1">
                              {suggestion.count} বার অনুসন্ধান করা হয়েছে
                            </div>
                          )}
                        </div>

                        {suggestion.type === 'product' && suggestion.product && (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={suggestion.product.image_url || '/placeholder-product.jpg'}
                              alt={suggestion.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </Button>
                    
                    {index < suggestions.length - 1 && suggestion.type !== suggestions[index + 1]?.type && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>কোন সাজেশন পাওয়া যায়নি</p>
                <p className="text-sm mt-1">Enter চাপুন অনুসন্ধান করতে</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>কিছু টাইপ করুন অনুসন্ধান শুরু করতে</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Search Button */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => executeSearch()}
              disabled={!query.trim() || isSearching}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              অনুসন্ধান করুন
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              বাতিল
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format price (you might want to import this from your constants)
function formatPrice(price: number): string {
  return `৳${price.toLocaleString('bn-BD')}`;
}
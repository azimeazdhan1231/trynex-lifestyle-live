import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_CATEGORIES, formatPrice } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import type { Product } from '@shared/schema';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load products with real-time updates
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1 * 60 * 1000, // 1 minute for fresher data
    cacheTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // Enhanced real-time search with category matching
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 1) return [];

    const query = searchTerm.toLowerCase().trim();
    const words = query.split(/\s+/).filter(word => word.length > 0);

    return products
      .map(product => {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productCategory = product.category?.toLowerCase() || '';
        const productDescription = product.description?.toLowerCase() || '';

        // Find matching category info
        const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
          cat.name.toLowerCase().includes(productCategory) || 
          cat.id === productCategory
        );
        const categoryName = categoryInfo?.name.toLowerCase() || productCategory;

        const searchableText = [productName, categoryName, productDescription].join(' ');

        // Exact name match (highest priority)
        if (productName.includes(query)) {
          score += productName.startsWith(query) ? 150 : 100;
        }

        // Category exact match
        if (categoryName.includes(query)) {
          score += 80;
        }

        // Word-by-word matching with Bengali support
        words.forEach(word => {
          if (word.length >= 2) {
            if (productName.includes(word)) {
              score += productName.startsWith(word) ? 50 : 30;
            }
            if (categoryName.includes(word)) {
              score += 25;
            }
            if (productDescription.includes(word)) {
              score += 15;
            }

            // Partial matching for longer words
            if (word.length >= 3) {
              const partial = word.substring(0, Math.max(2, word.length - 1));
              if (searchableText.includes(partial)) {
                score += 10;
              }
            }
          }
        });

        // Boost score for in-stock items
        if (product.stock > 0) {
          score += 5;
        }

        // Boost featured/latest items
        if (product.is_featured) score += 10;
        if (product.is_latest) score += 8;
        if (product.is_best_selling) score += 6;

        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        // Sort by score first, then by stock, then by name
        if (b.score !== a.score) return b.score - a.score;
        if (b.product.stock !== a.product.stock) return b.product.stock - a.product.stock;
        return a.product.name.localeCompare(b.product.name);
      })
      .slice(0, 10) // Show more results
      .map(item => item.product);
  }, [products, searchTerm]);

  // Debounced search tracking
  const trackSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        trackEvent('search_query', 'product_search', query);
      }
    }, 500),
    []
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || searchResults.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handleProductClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);

    // Track search with debouncing
    trackSearch(value);
  };

  const handleProductClick = (product: Product) => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);

    trackEvent('search_result_click', 'product_search', product.name);

    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
      cat.id === category || cat.name.toLowerCase().includes(category.toLowerCase())
    );
    return categoryInfo?.name || category;
  };

  return (
    <div className={`search-container relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-3 border-2 border-gray-200 focus:border-primary rounded-lg transition-all duration-200"
          aria-label="Product search"
          autoComplete="off"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto z-10 hover:bg-gray-100"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-pulse">খুঁজছি...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="overflow-y-auto max-h-96">
              {searchResults.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-14 h-14 mr-3 relative">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md border"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-sm">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Badge 
                          variant={product.stock > 0 ? "secondary" : "destructive"}
                          className="text-xs px-2 py-1"
                        >
                          {product.stock > 0 ? `স্টক: ${product.stock}` : 'স্টক নেই'}
                        </Badge>
                      </div>
                    </div>
                    {product.category && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryDisplayName(product.category)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.length > 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">কোন পণ্য পাওয়া যায়নি</p>
              <p className="text-sm mt-1">অন্য কিছু খুঁজে দেখুন</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}
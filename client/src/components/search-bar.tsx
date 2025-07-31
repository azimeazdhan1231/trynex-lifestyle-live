
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_CATEGORIES, formatPrice } from '@/lib/constants';
import { useLocation } from 'wouter';
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
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Load products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  });

  // Real-time search with debouncing
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 1) return [];

    const query = searchTerm.toLowerCase().trim();
    
    return products
      .filter(product => {
        // Search in product name, category, and description
        const productName = product.name.toLowerCase();
        const productCategory = product.category?.toLowerCase() || '';
        const productDescription = product.description?.toLowerCase() || '';
        
        // Find category display name
        const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
          cat.id === productCategory || 
          cat.name.toLowerCase().includes(productCategory)
        );
        const categoryName = categoryInfo?.name.toLowerCase() || productCategory;
        
        // Check if query matches any field
        return productName.includes(query) ||
               categoryName.includes(query) ||
               productDescription.includes(query) ||
               // Split query into words and check each
               query.split(' ').some(word => 
                 productName.includes(word) || 
                 categoryName.includes(word) ||
                 productDescription.includes(word)
               );
      })
      .sort((a, b) => {
        // Sort by relevance
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match first
        if (aName.includes(query) && !bName.includes(query)) return -1;
        if (bName.includes(query) && !aName.includes(query)) return 1;
        
        // Name starts with query
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        
        // Stock priority
        if (a.stock > 0 && b.stock === 0) return -1;
        if (b.stock > 0 && a.stock === 0) return 1;
        
        // Alphabetical
        return aName.localeCompare(bName);
      })
      .slice(0, 8); // Limit results
  }, [products, searchTerm]);

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
    setIsTyping(true);
    
    // Stop typing indicator after 500ms
    setTimeout(() => setIsTyping(false), 500);
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      // Navigate to products page with the selected product
      setLocation('/products');
    }
    
    // Blur the input
    inputRef.current?.blur();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

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
            handleProductSelect(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, selectedIndex]);

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

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
      cat.id === category || cat.name.toLowerCase().includes(category.toLowerCase())
    );
    return categoryInfo?.name || category;
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-2 border-2 border-gray-200 focus:border-primary rounded-lg transition-all duration-200"
          autoComplete="off"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto z-10 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {isTyping && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              <div>লোড হচ্ছে...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="overflow-y-auto max-h-80">
              {searchResults.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 mr-3">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded border"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-primary font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      <Badge 
                        variant={product.stock > 0 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {product.stock > 0 ? `স্টক: ${product.stock}` : 'স্টক নেই'}
                      </Badge>
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
              <Search className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">কোন পণ্য পাওয়া যায়নি</p>
              <p className="text-sm mt-1">"{searchTerm}" এর জন্য কোন ফলাফল নেই</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

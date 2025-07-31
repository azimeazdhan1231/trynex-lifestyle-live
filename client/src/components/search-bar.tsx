
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRODUCT_CATEGORIES, formatPrice } from '@/lib/constants';
import { useLocation } from 'wouter';
import type { Product } from '@shared/schema';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}

export default function SearchBar({ isOpen, onClose, onProductSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Load products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
  });

  // Real-time search with debouncing
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 1) return [];

    const query = searchTerm.toLowerCase().trim();
    
    return products
      .filter(product => {
        const productName = product.name.toLowerCase();
        const productCategory = product.category?.toLowerCase() || '';
        const productDescription = product.description?.toLowerCase() || '';
        
        const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
          cat.id === productCategory || 
          cat.name.toLowerCase().includes(productCategory)
        );
        const categoryName = categoryInfo?.name.toLowerCase() || productCategory;
        
        return productName.includes(query) ||
               categoryName.includes(query) ||
               productDescription.includes(query) ||
               query.split(' ').some(word => 
                 productName.includes(word) || 
                 categoryName.includes(word) ||
                 productDescription.includes(word)
               );
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        if (aName.includes(query) && !bName.includes(query)) return -1;
        if (bName.includes(query) && !aName.includes(query)) return 1;
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        if (a.stock > 0 && b.stock === 0) return -1;
        if (b.stock > 0 && a.stock === 0) return 1;
        
        return aName.localeCompare(bName);
      })
      .slice(0, 12);
  }, [products, searchTerm]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    setIsTyping(true);
    
    setTimeout(() => setIsTyping(false), 500);
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      setLocation('/products');
    }
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setSearchTerm('');
    setSelectedIndex(-1);
    onClose();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

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
          handleClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, selectedIndex]);

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryInfo = PRODUCT_CATEGORIES.find(cat => 
      cat.id === category || cat.name.toLowerCase().includes(category.toLowerCase())
    );
    return categoryInfo?.name || category;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Search className="w-6 h-6 text-primary" />
            পণ্য খুঁজুন
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="পণ্যের নাম, ক্যাটেগরি বা বর্ণনা লিখুন..."
              className="pl-12 pr-12 py-3 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
              autoComplete="off"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
            {isTyping && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="text-lg">পণ্য লোড হচ্ছে...</p>
            </div>
          ) : searchTerm.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">পণ্য খুঁজুন</h3>
              <p className="text-center max-w-md">
                আপনার পছন্দের পণ্য খুঁজে পেতে উপরের সার্চ বক্সে টাইপ করুন। 
                রিয়েল-টাইম সার্চ ফিচার দিয়ে তাৎক্ষণিক ফলাফল পাবেন।
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-600">
                "{searchTerm}" এর জন্য {searchResults.length}টি পণ্য পাওয়া গেছে
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`group bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary ${
                      index === selectedIndex ? 'border-primary shadow-lg bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-primary">
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
                          <div className="mb-3">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryDisplayName(product.category)}
                            </Badge>
                          </div>
                        )}

                        <Button
                          size="sm"
                          className="w-full mt-auto group-hover:bg-primary group-hover:text-white transition-colors"
                          variant="outline"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          বিস্তারিত দেখুন
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-center max-w-md mb-4">
                "{searchTerm}" এর জন্য কোন ফলাফল নেই। 
                অন্য কিছু দিয়ে খুঁজে দেখুন।
              </p>
              <Button variant="outline" onClick={clearSearch}>
                সার্চ পরিষ্কার করুন
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 text-center text-sm text-gray-600">
          <p>⌘ + K চেপে দ্রুত সার্চ করতে পারেন | ESC চেপে বন্ধ করুন</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

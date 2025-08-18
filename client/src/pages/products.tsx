import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid3X3, Star, Eye, Palette, Settings, ShoppingCart } from "lucide-react";
import EnhancedSearchBar from "@/components/enhanced-search-bar";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import UnifiedProductCard from "@/components/unified-product-card";
import OptimizedProductCard from "@/components/optimized-product-cards";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import SimpleCustomizeModal from "@/components/simple-customize-modal";
import CustomOrderSuccessModal from "@/components/CustomOrderSuccessModal";
import ComprehensiveProductLoading from "@/components/comprehensive-product-loading";
import EnhancedFilterSystem from "@/components/enhanced-filter-system";
import type { Product } from "@shared/schema";

import { PRODUCT_CATEGORIES } from "@/lib/constants";

// Helper function for price formatting
function formatPrice(price: number): string {
  return `৳${price.toFixed(2)}`;
}

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "নতুন আগে" },
  { value: "oldest", label: "পুরাতন আগে" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "name_asc", label: "নাম: A-Z" },
];

// Loading Skeleton
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-gray-300 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
}

// Main Products Page Component
export default function ProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [liveSearchResults, setLiveSearchResults] = useState<Product[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<{
    trackingId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    totalPrice: number;
    paymentMethod: string;
    productName: string;
    customizationInstructions: string;
  } | null>(null);
  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);

  // Ensure valid initial states to prevent Select errors
  React.useEffect(() => {
    if (!selectedCategory || selectedCategory.trim() === "") {
      setSelectedCategory("all");
    }
    if (!sortOption || sortOption.trim() === "") {
      setSortOption("newest");
    }
  }, [selectedCategory, sortOption]);

  // Fetch products directly from Supabase without caching
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0, // No caching - always fresh from Supabase
    gcTime: 0, // Remove immediately after component unmounts
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Always fetch fresh data on mount
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Live search functionality with optimized debouncing
  const performLiveSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setLiveSearchResults([]);
      return;
    }

    // Fast client-side filtering for instant results
    const filtered = products.filter(product => {
      const searchLower = query.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower) ||
        (product.category || '').toLowerCase().includes(searchLower)
      );
    });

    setLiveSearchResults(filtered);
  }, [products]);

  // Filter and sort products with live search integration
  const filteredProducts = useMemo(() => {
    // Use live search results if search is active, otherwise use all products
    let filtered = searchTerm && liveSearchResults.length >= 0 ? liveSearchResults : [...products];

    // Additional filtering by search term (for edge cases)
    if (searchTerm && liveSearchResults.length === 0) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category - Enhanced matching for gift categories
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        if (!product.category) return false;

        const productCategory = product.category.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();

        // Direct match
        if (productCategory === selectedCat) return true;

        // Gift category matching
        if (selectedCat.includes('gift-for-her') && (productCategory.includes('women') || productCategory.includes('her') || productCategory.includes('female'))) return true;
        if (selectedCat.includes('gift-for-him') && (productCategory.includes('men') || productCategory.includes('him') || productCategory.includes('male'))) return true;
        if (selectedCat.includes('gift-for-babies') && (productCategory.includes('baby') || productCategory.includes('kids') || productCategory.includes('children'))) return true;
        if (selectedCat.includes('birthday') && productCategory.includes('birthday')) return true;
        if (selectedCat.includes('anniversary') && productCategory.includes('anniversary')) return true;

        // Fallback to partial match
        return productCategory.includes(selectedCat) || selectedCat.includes(productCategory);
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
        case 'price_desc':
          return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        default: // newest
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    // Apply display limit for performance
    return filtered.slice(0, displayLimit);
  }, [products, searchTerm, liveSearchResults, selectedCategory, sortOption, displayLimit]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCustomizeClick = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleCustomOrderSuccess = (orderData: any) => {
    setOrderSuccess(orderData);
    setIsCustomizeModalOpen(false);
    setIsOrderSuccessModalOpen(true);
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  // Show premium loading screen when loading products
  if (isLoading) {
    return <ComprehensiveProductLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-xl mb-4">পণ্য লোড করতে সমস্যা হয়েছে</div>
            <p className="text-gray-600 mb-4">দয়া করে আবার চেষ্টা করুন</p>
            <Button onClick={() => refetch()} className="bg-rose-500 hover:bg-rose-600">
              আবার চেষ্টা করুন
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            আমাদের পণ্য সংগ্রহ
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            বিশেষ উপহার এবং কাস্টমাইজড আইটেম
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  performLiveSearch(e.target.value);
                }}
                className="pl-10"
                data-testid="input-product-search"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category">
                  <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="সাজান" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <OptimizedProductCard
              key={product.id}
              product={product}
              onViewDetails={handleProductClick}
              onCustomize={handleCustomizeClick}
            />
          ))}
        </div>

        {/* Load More Button */}
        {filteredProducts.length >= displayLimit && displayLimit < products.length && (
          <div className="text-center mt-8">
            <Button 
              onClick={handleLoadMore}
              className="bg-rose-500 hover:bg-rose-600 text-white"
              data-testid="button-load-more"
            >
              আরো পণ্য দেখুন
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-500 dark:text-gray-400 text-xl">
              কোনো পণ্য পাওয়া যায়নি
            </div>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              ভিন্ন ক্যাটেগরি বা সার্চ টার্ম ব্যবহার করে দেখুন
            </p>
          </div>
        )}

        {/* Product Modal */}
        {selectedProduct && (
          <UltraDynamicProductModal
            product={selectedProduct}
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
          />
        )}

        {/* Customize Modal */}
        {selectedProduct && (
          <SimpleCustomizeModal
            product={selectedProduct}
            isOpen={isCustomizeModalOpen}
            onClose={() => setIsCustomizeModalOpen(false)}
            onOrderSuccess={handleCustomOrderSuccess}
          />
        )}

        {/* Order Success Modal */}
        <CustomOrderSuccessModal
          isOpen={isOrderSuccessModalOpen}
          onClose={() => setIsOrderSuccessModalOpen(false)}
          orderDetails={orderSuccess}
        />
      </div>
    </div>
  );
}
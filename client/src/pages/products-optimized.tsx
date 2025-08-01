import { useState, useCallback, useMemo, Suspense, lazy } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useOptimizedProducts } from "@/hooks/useOptimizedProducts";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

// Lazy load components for better performance
const ProductCardOptimized = lazy(() => import("@/components/product-card-optimized"));
const CustomizeModal = lazy(() => import("@/components/customize-modal"));
// Removed QuickViewModal for now as it's causing import issues

// Loading skeleton component
const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <CardContent className="p-4">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

const CATEGORIES = [
  { value: "all", label: "সকল পণ্য" },
  { value: "t-shirts", label: "টি-শার্ট" },
  { value: "mugs", label: "মগ" },
  { value: "caps", label: "ক্যাপ" },
  { value: "water-bottles", label: "ওয়াটার বোতল" },
  { value: "accessories", label: "আনুষাঙ্গিক" }
];

const SORT_OPTIONS = [
  { value: "created_at_desc", label: "নতুন আগে" },
  { value: "created_at_asc", label: "পুরাতন আগে" },
  { value: "price_asc", label: "দাম কম থেকে বেশি" },
  { value: "price_desc", label: "দাম বেশি থেকে কম" },
  { value: "name_asc", label: "নাম (A-Z)" }
];

export default function ProductsOptimized() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("created_at_desc");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Parse sort option
  const [sortBy, sortOrder] = useMemo(() => {
    const [field, order] = sortOption.split('_');
    return [field as 'name' | 'price' | 'created_at', order as 'asc' | 'desc'];
  }, [sortOption]);

  // Use ultra-fast cached products hook
  const {
    products,
    isLoading,
    currentPage,
    totalPages,
    totalProducts,
    setCurrentPage,
    hasNextPage,
    hasPreviousPage
  } = useOptimizedProducts({
    searchTerm,
    sortBy,
    sortOrder,
    pageSize: 32 // Show all products at once
  });

  // Optimized handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
  }, []);

  const handleCustomize = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  }, []);

  const handleQuickView = useCallback((product: Product) => {
    // Quick view functionality - for now just open customize modal
    handleCustomize(product);
  }, [handleCustomize]);

  const handleAddToCart = useCallback((product: Product) => {
    // Optimized cart addition
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cartItems.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    toast({
      title: "কার্টে যোগ হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  }, [toast]);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">আমাদের পণ্যসমূহ</h1>
              <p className="text-gray-600 mt-1">
                মোট {totalProducts} টি পণ্য পাওয়া গেছে
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 16 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">কোনো পণ্য পাওয়া যায়নি</div>
            <p className="text-gray-500">অন্য ক্যাটেগরি বা কীওয়ার্ড দিয়ে খুঁজে দেখুন</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          }>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCardOptimized
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={wishlist.includes(product.id)}
                />
              ))}
            </div>
          </Suspense>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              পূর্ববর্তী
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              পরবর্তী
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {showCustomizeModal && selectedProduct && (
          <CustomizeModal
            product={selectedProduct}
            isOpen={showCustomizeModal}
            onClose={() => {
              setShowCustomizeModal(false);
              setSelectedProduct(null);
            }}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Quick view removed for performance - using customize modal directly */}
      </Suspense>
    </div>
  );
}
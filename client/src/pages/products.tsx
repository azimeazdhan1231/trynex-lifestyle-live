import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid3X3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import UnifiedProductCard from "@/components/unified-product-card";
import ProductModal from "@/components/product-modal";
import CustomizeModal from "@/components/customize-modal";
import MobileSearchDrawer from "@/components/mobile-search-drawer";
import { ProgressiveLoader, PerformanceErrorBoundary, PerformanceMonitor } from "@/components/enhanced-loading-system";
import type { Product } from "@shared/schema";

// Product categories
const PRODUCT_CATEGORIES = [
  { id: "all", name: "সব পণ্য" },
  { id: "mugs", name: "মগ" },
  { id: "frames", name: "ফ্রেম" },
  { id: "clothing", name: "পোশাক" },
  { id: "canvas", name: "ক্যানভাস" },
  { id: "accessories", name: "এক্সেসরিজ" },
  { id: "home", name: "ঘরের জিনিস" },
  { id: "stationery", name: "স্টেশনারি" },
  { id: "prints", name: "প্রিন্ট" },
  { id: "decorations", name: "সাজসজ্জা" },
];

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
  const [displayLimit, setDisplayLimit] = useState(20); // Start with 20 products
  // Remove local cart state - use global cart hook instead
  const { addToCart: globalAddToCart, cart: globalCart } = useCart();

  // Fetch products with enhanced performance optimization
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5, // 5 minutes for faster updates
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnReconnect: false,
    retry: 2,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
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

    return filtered;
  }, [products, searchTerm, selectedCategory, sortOption]);

  // Products to display (with pagination)
  const displayedProducts = filteredProducts.slice(0, displayLimit);
  const hasMoreProducts = filteredProducts.length > displayLimit;

  // Handle view product details - open modal
  const handleViewProduct = (product: Product) => {
    console.log("📱 Products page: handleViewProduct called with:", product.name);
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  // Handle customize product
  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  // Handle add to cart using global cart
  const handleAddToCart = async (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "স্টক শেষ",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    try {
      await globalAddToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url
      });

      toast({
        title: "কার্টে যোগ করা হয়েছে",
        description: `${product.name} কার্টে যোগ করা হয়েছে`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  // Handle add to cart with customization using global cart
  const handleAddToCartWithCustomization = async (product: Product, customization: any) => {
    try {
      await globalAddToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url
      }, customization);
      
      toast({
        title: "কাস্টম অর্ডার যোগ করা হয়েছে",
        description: `${product.name} কাস্টমাইজেশন সহ কার্টে যোগ করা হয়েছে`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding customized product to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কাস্টম পণ্য কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  // Load more products
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  // Show error if products failed to load
  if (error) {
    return (
      <MobileOptimizedLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">পণ্য লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-4">দয়া করে পেজ রিফ্রেশ করুন</p>
            <Button onClick={() => window.location.reload()}>
              পেজ রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section - Professional E-commerce Style */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 rounded-2xl p-6 sm:p-8 md:p-12 mb-8 text-white overflow-hidden shadow-2xl border border-white/20">
          <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              আমাদের পণ্যসমূহ
            </h1>
            <p className="text-blue-100 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              সেরা মানের কাস্টম গিফট এবং লাইফস্টাইল পণ্য। আপনার পছন্দমতো ডিজাইন করুন।
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Filters and Search - Mobile First */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search - Mobile Optimized */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-base border-2 focus:border-blue-500 rounded-xl"
              />
            </div>

            {/* Category Filter - Mobile Optimized */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 border-2 rounded-xl text-base">
                <Filter className="w-5 h-5 mr-2" />
                <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-base py-3">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort - Mobile Optimized */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="h-12 border-2 rounded-xl text-base">
                <Grid3X3 className="w-5 h-5 mr-2" />
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base py-3">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold">{displayedProducts.length}</span> টি পণ্য দেখানো হচ্ছে 
            (মোট <span className="font-semibold">{filteredProducts.length}</span> টি পণ্য)
            {searchTerm && (
              <span className="ml-2">
                "<strong>{searchTerm}</strong>" এর জন্য
              </span>
            )}
          </p>
        </div>

        {/* Products Grid - Mobile Optimized */}
        <PerformanceErrorBoundary>
          <PerformanceMonitor>
            <ProgressiveLoader 
              loadingState={{ 
                isLoading, 
                error: error?.message,
                progress: isLoading ? undefined : 100 
              }}
              onRetry={() => refetch()}
            >
              {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg p-8 shadow-sm max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-4">অন্য কিছু খোঁজার চেষ্টা করুন বা ফিল্টার পরিবর্তন করুন</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSortOption("newest");
                }}
              >
                সব ফিল্টার রিসেট করুন
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {displayedProducts.map((product) => (
                <UnifiedProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="text-center mt-12">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLoadMore}
                  className="px-8 py-3"
                >
                  আরও পণ্য দেখুন ({filteredProducts.length - displayLimit} টি বাকি)
                </Button>
              </div>
            )}

            {/* All products loaded message */}
            {!hasMoreProducts && displayedProducts.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-600">
                  সব <strong>{filteredProducts.length}</strong> টি পণ্য দেখানো হয়েছে
                </p>
              </div>
            )}
          </>
        )}

        {/* Mobile Search Drawer */}
        <MobileSearchDrawer
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOption={sortOption}
          setSortOption={setSortOption}
          categories={PRODUCT_CATEGORIES}
          sortOptions={SORT_OPTIONS}
          resultsCount={displayedProducts.length}
          totalCount={filteredProducts.length}
        />
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            console.log("📱 Closing product modal");
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomize}
        />
      )}

      {/* Customize Modal */}
      <CustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCartWithCustomization}
      />
    </MobileOptimizedLayout>
  );
}
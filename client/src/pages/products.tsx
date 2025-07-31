
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Settings,
  ArrowUpDown,
  TrendingUp,
  Package,
  Sparkles,
  ChevronDown,
  Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import Header from "@/components/header";
import ProductModal from "@/components/product-modal";
import CustomizeModal from "@/components/customize-modal";
import LazyImage from "@/components/LazyImage";
import { useCart } from "@/hooks/use-cart";
import { useAnalytics } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@shared/schema";

const PRODUCTS_PER_PAGE = 12;

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { addToCart } = useCart();
  useAnalytics();
  const { toast } = useToast();

  // Ultra-fast products loading with aggressive caching
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    gcTime: 1000 * 60 * 60, // 1 hour in memory
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });

  // Advanced filtering and sorting
  const processedProducts = products
    .filter((product: Product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      let matchesPrice = true;
      if (priceRange !== "all") {
        const price = Number(product.price);
        switch (priceRange) {
          case "0-500":
            matchesPrice = price <= 500;
            break;
          case "500-1000":
            matchesPrice = price > 500 && price <= 1000;
            break;
          case "1000-2000":
            matchesPrice = price > 1000 && price <= 2000;
            break;
          case "2000+":
            matchesPrice = price > 2000;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "popular":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case "newest":
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  // Handle pagination and "View More" functionality with performance optimization
  useEffect(() => {
    const initialProducts = processedProducts.slice(0, PRODUCTS_PER_PAGE);
    setDisplayedProducts(initialProducts);
    setCurrentPage(1);
    
    // Preload next batch of images for smoother "View More" experience
    if (processedProducts.length > PRODUCTS_PER_PAGE) {
      const nextBatch = processedProducts.slice(PRODUCTS_PER_PAGE, PRODUCTS_PER_PAGE * 2);
      nextBatch.forEach(product => {
        if (product.image_url) {
          const img = new Image();
          img.src = product.image_url;
        }
      });
    }
  }, [processedProducts]);

  const handleViewMore = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      const newProducts = processedProducts.slice(startIndex, endIndex);
      
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 800);
  }, [currentPage, processedProducts, isLoadingMore]);

  const hasMoreProducts = displayedProducts.length < processedProducts.length;

  // Handle product actions
  const handleAddToCart = async (product: Product, customization?: any) => {
    try {
      if (customization) {
        await addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image_url,
          customization
        });
      } else {
        await addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image_url
        });
      }
      
      toast({
        title: "পণ্য যোগ করা হয়েছে",
        description: `${product.name} কার্টে যোগ করা হয়েছে`,
      });

      // Track analytics
      const { trackAddToCart } = await import("@/lib/analytics");
      trackAddToCart(product.id, product.name, Number(product.price));
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "পণ্য যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  const handleViewProduct = (product: Product) => {
    console.log("🔍 Opening product modal for:", product.name, product);
    console.log("🔍 Current modal state:", showProductModal);
    setSelectedProduct(product);
    setShowProductModal(true);
    console.log("🔍 Modal should now be open");
    // Track product view immediately
    import("@/lib/analytics").then(({ trackProductView }) => {
      trackProductView(product.id, product.name, product.category || "uncategorized");
    });
  };

  const handleCustomizeProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Optimized loading state - only show if no cached data
  if (productsLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header cartCount={0} onCartOpen={() => {}} />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-4">
                  <div className="aspect-[1/1.2] bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header cartCount={0} onCartOpen={() => {}} />
      
      {/* Premium Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-300 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold">প্রিমিয়াম পণ্যসমূহ</h1>
            <Sparkles className="w-8 h-8 ml-3 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-xl md:text-2xl opacity-90 mb-8">বিশেষ কাস্টম গিফট এবং লাইফস্টাইল পণ্য</p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              <span className="font-semibold">{processedProducts.length}+ পণ্য</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="font-semibold">দ্রুত ডেলিভারি</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span className="font-semibold">প্রিমিয়াম কোয়ালিটি</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Advanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-8 border border-gray-100 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন... (নাম, বিবরণ)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-base bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-64 h-12 border-2 border-gray-200 rounded-xl text-base">
                <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                {categories.filter(cat => cat.is_active).map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name_bengali || category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 rounded-xl text-base">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">নতুন প্রথম</SelectItem>
                <SelectItem value="popular">জনপ্রিয় প্রথম</SelectItem>
                <SelectItem value="price-low">দাম কম থেকে বেশি</SelectItem>
                <SelectItem value="price-high">দাম বেশি থেকে কম</SelectItem>
                <SelectItem value="name">নাম অনুসারে</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 rounded-xl text-base">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="দামের রেঞ্জ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব দাম</SelectItem>
                <SelectItem value="0-500">৳০ - ৳৫০০</SelectItem>
                <SelectItem value="500-1000">৳৫০০ - ৳১০০০</SelectItem>
                <SelectItem value="1000-2000">৳১০০০ - ৳২০০০</SelectItem>
                <SelectItem value="2000+">৳২০০০+</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none h-12 px-4 border-r"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none h-12 px-4"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="text-gray-700">
              <span className="font-bold text-xl text-blue-600">{displayedProducts.length}</span>
              <span className="text-gray-600 ml-1">টি পণ্য দেখাচ্ছে</span>
              <span className="text-gray-500 ml-2">({processedProducts.length} টি পাওয়া গেছে)</span>
            </div>
            {searchTerm && (
              <Badge variant="outline" className="text-sm">
                "{searchTerm}" এর জন্য ফলাফল
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-2 md:mt-0">
            পৃষ্ঠা {currentPage} / {Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE)}
          </div>
        </div>

        {/* Products Grid */}
        <PremiumProductGrid 
          products={displayedProducts}
          viewMode={viewMode}
          favorites={favorites}
          onAddToCart={handleAddToCart}
          onViewProduct={handleViewProduct}
          onCustomizeProduct={handleCustomizeProduct}
          onToggleFavorite={toggleFavorite}
        />

        {/* View More Button */}
        {hasMoreProducts && (
          <div className="text-center mt-12">
            <Button
              onClick={handleViewMore}
              disabled={isLoadingMore}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  লোড হচ্ছে...
                </>
              ) : (
                <>
                  আরও দেখুন ({processedProducts.length - displayedProducts.length} টি বাকি)
                  <ChevronDown className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* No Products State */}
        {displayedProducts.length === 0 && !productsLoading && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-500 mb-6">অন্য ক্যাটেগরি বা সার্চ টার্ম চেষ্টা করুন</p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange("all");
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                সব ফিল্টার রিসেট করুন
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal - Optimized for fast opening */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          console.log("Closing product modal");
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        onCustomize={handleCustomizeProduct}
      />

      <CustomizeModal
        product={selectedProduct}
        isOpen={showCustomizeModal}
        onClose={() => {
          setShowCustomizeModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

// Premium Product Grid Component
interface PremiumProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  favorites: string[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomizeProduct: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

function PremiumProductGrid({ 
  products, 
  viewMode, 
  favorites,
  onAddToCart, 
  onViewProduct, 
  onCustomizeProduct,
  onToggleFavorite 
}: PremiumProductGridProps) {
  
  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white group">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/5 relative group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden">
                  <LazyImage
                    src={product.image_url || "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                  <Button 
                    size="sm" 
                    onClick={() => onViewProduct(product)}
                    className="bg-white/90 text-gray-800 hover:bg-white backdrop-blur-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    বিস্তারিত দেখুন
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  <Badge className={`${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {product.stock > 0 ? 'স্টকে আছে' : 'স্টক নেই'}
                  </Badge>
                  {product.is_featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      ফিচার্ড
                    </Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(product.id)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-600 backdrop-blur-sm"
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              <div className="lg:w-3/5 p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 
                      className="text-2xl font-bold text-gray-800 mb-3 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      onClick={() => onViewProduct(product)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-base line-clamp-3 mb-4">{product.description}</p>
                    {product.category && (
                      <Badge variant="outline" className="mb-4">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onCustomizeProduct(product)}
                      className="border-purple-500 text-purple-600 hover:bg-purple-50 px-6"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      কাস্টমাইজ
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      কার্টে যোগ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white transform hover:-translate-y-2 rounded-2xl">
          <div className="relative">
            {/* Much Bigger Product Image */}
            <div 
              className="aspect-[1/1.2] overflow-hidden bg-gray-50 cursor-pointer relative rounded-t-2xl"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🖱️ Image clicked for product:", product.name);
                onViewProduct(product);
              }}
            >
              {product.image_url ? (
                <LazyImage
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">ছবি লোড হচ্ছে...</span>
                  </div>
                </div>
              )}
              
              {/* Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🖱️ Eye button clicked for product:", product.name);
                      onViewProduct(product);
                    }}
                    className="bg-white/95 text-gray-800 hover:bg-white backdrop-blur-sm shadow-lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    বিস্তারিত
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 space-y-2">
              <Badge className={`${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} text-white shadow-lg`}>
                {product.stock > 0 ? 'স্টকে আছে' : 'স্টক নেই'}
              </Badge>
              {product.is_featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচার্ড
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(product.id)}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-600 backdrop-blur-sm shadow-lg"
            >
              <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          <CardContent className="p-6">
            <h3 
              className="font-bold text-lg md:text-xl text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🖱️ Title clicked for product:", product.name);
                onViewProduct(product);
              }}
            >
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.description || "বিশেষ কাস্টম পণ্য - আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন"}
            </p>

            <div className="flex items-center justify-between mb-5">
              <span className="text-xl md:text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
              {product.category && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {product.category}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl py-3 font-semibold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                কার্টে যোগ করুন
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onCustomizeProduct(product)}
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 transition-all py-3 font-semibold"
              >
                <Settings className="w-4 h-4 mr-2" />
                কাস্টমাইজ করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

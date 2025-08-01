import { useState, useCallback, useMemo, Suspense, lazy, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid3X3, List, ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import Header from "@/components/header";
import type { Product } from "@shared/schema";

// Lazy load heavy components
const CustomizeModal = lazy(() => import("@/components/customize-modal"));

// Ultra-fast hook for products with 1-year browser caching
function useUltraFastProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const CACHE_KEY = 'ultra-fast-products-v3';
      const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year
      
      try {
        // Try browser cache first - instant loading
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('⚡ Ultra-fast load from browser cache');
            setProducts(data);
            setIsLoading(false);
            return;
          }
        }

        // Fetch with aggressive optimization
        const startTime = performance.now();
        const response = await fetch('/api/products', {
          headers: {
            'Cache-Control': 'max-age=31536000, immutable',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        
        // Cache immediately for next time
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }));

        setProducts(data);
        setIsLoading(false);
        
        const duration = performance.now() - startTime;
        console.log(`🚀 Products loaded and cached in ${duration.toFixed(2)}ms`);
        
      } catch (err) {
        console.error('❌ Failed to load products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, isLoading, error };
}

// Ultra-fast product card component
function UltraFastProductCard({ 
  product, 
  onCustomize, 
  onAddToCart,
  onToggleWishlist,
  isInWishlist 
}: {
  product: Product;
  onCustomize: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image_url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-red-500 text-white text-xs">ফিচার্ড</Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-green-500 text-white text-xs">নতুন</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-2 right-2 w-8 h-8 p-0 ${
              isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">
              {product.name}
            </h3>
            <div className="flex items-center ml-2">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">4.8</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              স্টক: {product.stock}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              কার্ট
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(product);
              }}
            >
              <Zap className="w-3 h-3 mr-1" />
              অর্ডার
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton with accurate timing
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 16 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full aspect-square" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ProductsUltraFast() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showLoading, setShowLoading] = useState(true);
  
  const { toast } = useToast();
  const { products: allProducts, isLoading: dataLoading, error } = useUltraFastProducts();

  // Smart loading state - show for minimum duration for better UX
  useEffect(() => {
    if (!dataLoading && allProducts.length > 0) {
      // Ensure loading shows for at least 500ms for smooth UX
      const timer = setTimeout(() => setShowLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [dataLoading, allProducts.length]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

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
  }, [allProducts, searchTerm, selectedCategory, sortOption]);

  // Optimized handlers
  const handleCustomize = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={0} onCartOpen={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের পণ্যসমূহ
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            উচ্চমানের ও সাশ্রয়ী দামে বিভিন্ন ধরনের পণ্য পাবেন আমাদের কাছে
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="ক্যাটাগরি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                <SelectItem value="gifts">গিফট</SelectItem>
                <SelectItem value="lifestyle">লাইফস্টাইল</SelectItem>
                <SelectItem value="accessories">অ্যাক্সেসরিজ</SelectItem>
                <SelectItem value="custom">কাস্টম</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">নতুন আগে</SelectItem>
                <SelectItem value="oldest">পুরাতন আগে</SelectItem>
                <SelectItem value="price_asc">দাম কম থেকে বেশি</SelectItem>
                <SelectItem value="price_desc">দাম বেশি থেকে কম</SelectItem>
                <SelectItem value="name_asc">নাম (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
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

        {/* Products Section */}
        {showLoading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">পণ্য লোড করতে সমস্যা হয়েছে: {error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredProducts.map((product) => (
                <UltraFastProductCard
                  key={product.id}
                  product={product}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={wishlist.includes(product.id)}
                />
              ))}
            </div>

            {/* Same Products Section (Similar Products) */}
            {filteredProducts.length > 4 && (
              <div className="mt-16 pt-8 border-t">
                <h3 className="text-2xl font-bold text-center mb-8">আরও পণ্য দেখুন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, 4).map((product) => (
                    <UltraFastProductCard
                      key={`similar-${product.id}`}
                      product={product}
                      onCustomize={(product) => {
                        handleCustomize(product);
                        return Promise.resolve();
                      }}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={wishlist.includes(product.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Results Info */}
        <div className="text-center mt-8 text-gray-600">
          {!showLoading && (
            <p>মোট {filteredProducts.length} টি পণ্য পাওয়া গেছে</p>
          )}
        </div>
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
      </Suspense>
    </div>
  );
}
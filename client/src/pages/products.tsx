import { useState, useEffect } from "react";
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
import { useCart } from "@/hooks/use-cart";
import { useAnalytics } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
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
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { addToCart, totalItems } = useCart();
  useAnalytics();
  const { toast } = useToast();

  // Fast products loading
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 15, // 15 minutes in memory
  });

  // Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });

  // Process and filter products
  const processedProducts = products
    .filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (priceRange !== "all") {
        const price = parseFloat(product.price.toString());
        switch (priceRange) {
          case "0-500":
            return price <= 500;
          case "500-1000":
            return price > 500 && price <= 1000;
          case "1000-2000":
            return price > 1000 && price <= 2000;
          case "2000+":
            return price > 2000;
          default:
            return true;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
        case "price-high":
          return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  // Handle pagination
  useEffect(() => {
    setDisplayedProducts(processedProducts.slice(0, PRODUCTS_PER_PAGE));
    setCurrentPage(1);
  }, [processedProducts]);

  const hasMoreProducts = displayedProducts.length < processedProducts.length;

  const handleViewMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * PRODUCTS_PER_PAGE;
      setDisplayedProducts(processedProducts.slice(startIndex, endIndex));
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 500);
  };

  // Working handlers from homepage
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
    });

    trackAddToCart(product.id, product.name, Number(product.price));

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleProductView = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleCustomizeProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  };

  const handleCustomizeAddToCart = async (product: Product, customization: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      customization: customization,
    });
    
    toast({
      title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!",
      description: `${product.name} আপনার পছন্দমতো কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            আমাদের পণ্য কালেকশন
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            বিশেষ গিফট এবং লাইফস্টাইল পণ্যের বিশাল সংগ্রহ
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 border-gray-200 rounded-xl text-base"
              />
            </div>

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl text-base">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="ক্যাটেগরি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl text-base">
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl text-base">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">নতুন প্রথমে</SelectItem>
                <SelectItem value="price-low">কম দাম প্রথমে</SelectItem>
                <SelectItem value="price-high">বেশি দাম প্রথমে</SelectItem>
                <SelectItem value="name">নাম অনুসারে</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-xl p-4 shadow-md">
          <div className="text-gray-700">
            <span className="font-bold text-xl text-blue-600">{displayedProducts.length}</span>
            <span className="text-gray-600 ml-1">টি পণ্য দেখাচ্ছে</span>
            <span className="text-gray-500 ml-2">({processedProducts.length} টি পাওয়া গেছে)</span>
          </div>
        </div>

        {/* Working Product Grid from Homepage */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {displayedProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white transform hover:-translate-y-2">
                  <div className="relative">
                    {/* Product Image */}
                    <div 
                      className="aspect-square overflow-hidden bg-gray-50 cursor-pointer"
                      onClick={() => handleProductView(product)}
                    >
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
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

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleProductView(product)}
                        className="bg-white/80 hover:bg-white text-gray-600 backdrop-blur-sm shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 
                      className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => handleProductView(product)}
                    >
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        কার্টে যোগ করুন
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleCustomizeProduct(product)}
                        className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        কাস্টমাইজ করুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View More Button */}
            {hasMoreProducts && (
              <div className="text-center">
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
          </>
        ) : (
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

      {/* Working Modals from Homepage */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomizeProduct}
        />
      )}

      {selectedProduct && (
        <CustomizeModal
          product={selectedProduct}
          isOpen={showCustomizeModal}
          onClose={() => {
            setShowCustomizeModal(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleCustomizeAddToCart}
        />
      )}
    </div>
  );
}
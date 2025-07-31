
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Filter, Grid3X3, List, SortAsc, SortDesc, Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import Header from "@/components/header";
import ProductModal from "@/components/product-modal";
import CustomizeModal from "@/components/customize-modal";
import { useCart } from "@/hooks/use-cart";
import { useAnalytics } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState("all");
  const { addToCart } = useCart();
  useAnalytics(); // Initialize analytics tracking
  const { toast } = useToast();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes (categories change less frequently)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) => {
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
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

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

      // Track add to cart using analytics function directly
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
    setSelectedProduct(product);
    setShowProductModal(true);
    // Track view product using analytics function directly
    import("@/lib/analytics").then(({ trackProductView }) => {
      trackProductView(product.id, product.name, product.category || "uncategorized");
    });
  };

  const handleCustomizeProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12 sm:py-16 mt-14 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">আমাদের পণ্যসমূহ</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 px-2">বিশেষ কাস্টম গিফট এবং লাইফস্টাইল পণ্য</p>
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
              <span className="text-sm sm:text-base lg:text-lg font-semibold">{products.length}+ পণ্য উপলব্ধ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px] lg:w-56 h-10 sm:h-12 border-2 border-gray-200 text-sm sm:text-base">
                <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                <SelectItem value="Gift for Him">পুরুষদের জন্য গিফট</SelectItem>
                <SelectItem value="Gift for Her">মহিলাদের জন্য গিফট</SelectItem>
                <SelectItem value="Baby Gifts">শিশুদের গিফট</SelectItem>
                <SelectItem value="Men Gifts">পুরুষদের গিফট</SelectItem>
                <SelectItem value="Women Gifts">মহিলাদের গিফট</SelectItem>
                <SelectItem value="Kids Gifts">বাচ্চাদের গিফট</SelectItem>
                <SelectItem value="Mugs">মগ</SelectItem>
                <SelectItem value="T-Shirts">টি-শার্ট</SelectItem>
                <SelectItem value="Keychains">কিচেইন</SelectItem>
                <SelectItem value="Water Bottles">পানির বোতল</SelectItem>
                <SelectItem value="Personalized Gifts">ব্যক্তিগত গিফট</SelectItem>
                <SelectItem value="Corporate Gifts">কর্পোরেট গিফট</SelectItem>
                <SelectItem value="Anniversary Gifts">বার্ষিকী গিফট</SelectItem>
                <SelectItem value="Birthday Gifts">জন্মদিনের গিফট</SelectItem>
                <SelectItem value="Holiday Gifts">ছুটির দিনের গিফট</SelectItem>
                <SelectItem value="Custom Prints">কাস্টম প্রিন্ট</SelectItem>
                <SelectItem value="Gift Packages">গিফট প্যাকেজ</SelectItem>
                <SelectItem value="Home Decor Gifts">ঘর সাজানোর গিফট</SelectItem>
                <SelectItem value="Fashion Accessories">ফ্যাশন এক্সেসরিজ</SelectItem>
                <SelectItem value="Seasonal Specials">সিজনাল স্পেশাল</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px] lg:w-48 h-10 sm:h-12 border-2 border-gray-200 text-sm sm:text-base">
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">নতুন প্রথম</SelectItem>
                <SelectItem value="price-low">দাম কম থেকে বেশি</SelectItem>
                <SelectItem value="price-high">দাম বেশি থেকে কম</SelectItem>
                <SelectItem value="name">নাম অনুসারে</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px] lg:w-48 h-10 sm:h-12 border-2 border-gray-200 text-sm sm:text-base">
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
            <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none h-10 sm:h-12 px-3 sm:px-4"
              >
                <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none h-10 sm:h-12 px-3 sm:px-4"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 sm:mb-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex justify-center mb-4 sm:mb-6">
              <TabsList className="grid w-full max-w-4xl h-auto p-1 sm:p-2 bg-white shadow-lg rounded-xl border border-gray-200 overflow-x-auto" 
                style={{gridTemplateColumns: `repeat(${Math.min(categories.filter(cat => cat.is_active).length + 1, 6)}, 1fr)`}}>
                <TabsTrigger 
                  value="all" 
                  className="h-10 sm:h-12 text-xs sm:text-sm font-semibold px-2 sm:px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white whitespace-nowrap"
                >
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  সব পণ্য
                </TabsTrigger>
                {categories.filter(cat => cat.is_active).map((category) => (
                  <TabsTrigger 
                    key={category.name} 
                    value={category.name}
                    className="h-10 sm:h-12 text-xs sm:text-sm font-semibold px-2 sm:px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white whitespace-nowrap"
                  >
                    {category.image_url && (
                      <img src={category.image_url} alt="" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rounded" />
                    )}
                    {category.name_bengali}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <ProductGrid 
                products={filteredAndSortedProducts} 
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onViewProduct={handleViewProduct}
                onCustomizeProduct={handleCustomizeProduct}
              />
            </TabsContent>

            {categories.filter(cat => cat.is_active).map((category) => (
              <TabsContent key={category.name} value={category.name}>
                <ProductGrid 
                  products={filteredAndSortedProducts.filter(p => p.category === category.name)} 
                  viewMode={viewMode}
                  onAddToCart={handleAddToCart}
                  onViewProduct={handleViewProduct}
                  onCustomizeProduct={handleCustomizeProduct}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
          <div className="text-gray-600">
            <span className="font-semibold text-base sm:text-lg">{filteredAndSortedProducts.length}</span> টি পণ্য পাওয়া গেছে
          </div>
          {searchTerm && (
            <div className="text-xs sm:text-sm text-gray-500">
              "<span className="font-semibold">{searchTerm}</span>" এর জন্য ফলাফল
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomizeProduct: (product: Product) => void;
}

function ProductGrid({ products, viewMode, onAddToCart, onViewProduct, onCustomizeProduct }: ProductGridProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
          <p className="text-gray-500">অন্য ক্যাটেগরি বা সার্চ টার্ম চেষ্টা করুন</p>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 relative group">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                  alt={product.name}
                  className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button 
                    size="sm" 
                    onClick={() => onViewProduct(product)}
                    className="bg-white/90 text-gray-800 hover:bg-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    দেখুন
                  </Button>
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(product.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      {product.stock > 0 ? `স্টক: ${product.stock}` : "স্টক নেই"}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCustomizeProduct(product)}
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      কাস্টমাইজ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 bg-white hover:border-blue-300 transform hover:-translate-y-2">
          <div className="relative">
            <div className="aspect-square overflow-hidden bg-gray-50">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
              <Button 
                size="sm" 
                onClick={() => onViewProduct(product)}
                className="bg-white/90 text-gray-800 hover:bg-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => toggleFavorite(product.id)}
                className="bg-white/90 text-gray-800 hover:bg-white"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Stock Badge */}
            <Badge 
              className={`absolute top-3 left-3 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {product.stock > 0 ? 'স্টকে আছে' : 'স্টক নেই'}
            </Badge>

            {/* Featured Badge */}
            {product.is_featured && (
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500">
                <Star className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description || "বিশেষ কাস্টম পণ্য"}
            </p>

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
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                কার্টে যোগ করুন
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onCustomizeProduct(product)}
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600"
              >
                কাস্টমাইজ করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

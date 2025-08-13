import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid3X3, List, SlidersHorizontal, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import ModernProductCard from "@/components/modern-product-card";
import SimpleCustomizeModal from "@/components/simple-customize-modal";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import EnhancedCartModal from "@/components/enhanced-cart-modal";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@shared/schema";

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন আগে" },
  { value: "oldest", label: "পুরাতন আগে" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "name_asc", label: "নাম: A-Z" },
  { value: "featured", label: "ফিচার্ড প্রথমে" },
];

// Enhanced loading skeleton
function ModernProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function ModernProductsPage() {
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = Number(product.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Stock filter
    if (showOnlyInStock) {
      filtered = filtered.filter(product => (Number(product.stock) || 0) > 0);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "oldest":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case "price_asc":
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case "price_desc":
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortOption, priceRange, showOnlyInStock]);

  // Event handlers
  const handleAddToCart = (product: Product) => {
    const stock = Number(product.stock) || 0;
    if (stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      quantity: 1,
      image_url: product.image_url || undefined,
    });

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
      duration: 2000,
    });
  };

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    const isInWishlist = wishlist.includes(productId);
    toast({
      title: isInWishlist ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ করা হয়েছে",
      description: products.find(p => p.id === productId)?.name || "পণ্য",
      duration: 2000,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
    setPriceRange([0, 10000]);
    setShowOnlyInStock(false);
  };

  if (error) {
    return (
      <MobileOptimizedLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">কিছু সমস্যা হয়েছে</h1>
            <p className="text-gray-600 mb-6">পণ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।</p>
            <Button onClick={() => window.location.reload()}>
              আবার চেষ্টা করুন
            </Button>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                আমাদের পণ্যসমূহ
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                উচ্চমানের ও সাশ্রয়ী দামে বিভিন্ন ধরনের পণ্য এবং কাস্টমাইজেশন সুবিধা
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {filteredProducts.length} পণ্য
                </Badge>
              </div>
              
              {wishlist.length > 0 && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{wishlist.length} উইশলিস্ট</span>
                </div>
              )}
              
              {totalItems > 0 && (
                <button
                  onClick={() => setIsCartModalOpen(true)}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{totalItems} কার্টে</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters and Controls */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="পণ্য খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-orange-500 rounded-xl"
                  />
                </div>

                {/* Category */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 border-2 rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="ক্যাটাগরি" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                    {PRODUCT_CATEGORIES.filter(cat => cat.id && cat.id.trim()).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.bengaliName || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="h-12 border-2 rounded-xl">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
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

                {/* View Mode & Clear */}
                <div className="flex gap-2">
                  <div className="flex border-2 rounded-xl overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {(searchTerm || selectedCategory !== "all" || sortOption !== "newest") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="whitespace-nowrap"
                    >
                      সব পরিষ্কার
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={showOnlyInStock ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                  className="text-xs"
                >
                  শুধু স্টকে আছে
                </Button>
                
                <Button
                  variant={sortOption === "featured" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortOption("featured")}
                  className="text-xs"
                >
                  ফিচার্ড পণ্য
                </Button>

                {wishlist.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Show only wishlisted products
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="text-xs"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    উইশলিস্ট ({wishlist.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(12)].map((_, i) => (
                <ModernProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">কোনো পণ্য পাওয়া যায়নি</h3>
                <p className="text-gray-600 mb-6">
                  আপনার অনুসন্ধানের জন্য কোনো পণ্য খুঁজে পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।
                </p>
                <Button onClick={clearFilters} variant="outline">
                  সব ফিল্টার পরিষ্কার করুন
                </Button>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 transition-all duration-300 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {filteredProducts.map((product) => (
                <ModernProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onCustomize={handleCustomize}
                  onViewDetails={handleViewDetails}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={wishlist.includes(product.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <SimpleCustomizeModal
          product={selectedProduct}
          isOpen={isCustomizeModalOpen}
          onClose={() => {
            setIsCustomizeModalOpen(false);
            setSelectedProduct(null);
          }}
        />

        <UltraDynamicProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onCustomize={handleCustomize}
        />

        <EnhancedCartModal
          isOpen={isCartModalOpen}
          onClose={() => setIsCartModalOpen(false)}
        />
      </div>
    </MobileOptimizedLayout>
  );
}
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid3X3, Star, Heart, ShoppingCart, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import Header from "@/components/header";
import CustomizeModal from "@/components/customize-modal";
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

// Homepage-style Product Card (exact same as homepage)
function HomepageStyleProductCard({ product, onCustomize, onAddToCart }: {
  product: Product;
  onCustomize: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url || "/api/placeholder/400/400"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-2 right-2 w-8 h-8 p-0 rounded-full bg-white/80 hover:bg-white ${
              isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>

          {/* Action Buttons Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-white text-black hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(product);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                কাস্টমাইজ
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                অর্ডার
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-orange-600">
              ৳{formatPrice(Number(product.price))}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">4.8</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                স্টকে আছে
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                স্টক শেষ
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
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
  const [displayLimit, setDisplayLimit] = useState(20); // Start with 20 products
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number; customization?: any }>>([]);

  // Fetch products with ultra-fast caching
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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

  // Handle customize product
  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "স্টক শেষ",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  // Handle add to cart with customization
  const handleAddToCartWithCustomization = async (product: Product, customization: any) => {
    setCart(prev => [...prev, { product, quantity: customization.quantity || 1, customization }]);
    
    toast({
      title: "কাস্টম অর্ডার যোগ করা হয়েছে",
      description: `${product.name} কাস্টমাইজেশন সহ কার্টে যোগ করা হয়েছে`,
    });
  };

  // Load more products
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  // Show error if products failed to load
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={cart.length} onCartOpen={() => {}} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">পণ্য লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-4">দয়া করে পেজ রিফ্রেশ করুন</p>
            <Button onClick={() => window.location.reload()}>
              পেজ রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cart.length} onCartOpen={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের পণ্যসমূহ
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            সেরা মানের কাস্টম গিফট এবং লাইফস্টাইল পণ্য। আপনার পছন্দমতো ডিজাইন করুন।
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
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
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <Grid3X3 className="w-4 h-4 mr-2" />
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

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <HomepageStyleProductCard
                  key={product.id}
                  product={product}
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
      </div>

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
    </div>
  );
}
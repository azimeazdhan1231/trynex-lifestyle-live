import { useState, useEffect, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid3X3, Star, Heart, ShoppingCart, Zap, Plus } from "lucide-react";
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

// Product Card Component
function ProductCard({ product, onCustomize, onAddToCart }: {
  product: Product;
  onCustomize: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url || "/api/placeholder/400/400"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-1">ফিচার্ড</Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1">নতুন</Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-blue-500 text-white text-xs px-2 py-1">বেস্ট সেলার</Badge>
            )}
          </div>

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

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-gray-100"
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
                variant="default"
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
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                ৳{formatPrice(Number(product.price))}
              </span>
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  স্টকে আছে
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  স্টক শেষ
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">4.8</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton Component
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

  // Fetch products with aggressive caching for instant loading
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache forever
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

  // Handle customize product
  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  // Show error if products failed to load
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={0} onCartOpen={() => {}} />
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
      <Header cartCount={0} onCartOpen={() => {}} />
      
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
            <span className="font-semibold">{filteredProducts.length}</span> টি পণ্য পাওয়া গেছে
            {searchTerm && (
              <span className="ml-2">
                "<strong>{searchTerm}</strong>" এর জন্য
              </span>
            )}
          </p>

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-sm">লোড হচ্ছে...</span>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 && !isLoading ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredProducts.length > 0 && !isLoading && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              সব <strong>{filteredProducts.length}</strong> টি পণ্য দেখানো হয়েছে
            </p>
          </div>
        )}
      </div>

      {/* Customize Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <CustomizeModal
          isOpen={isCustomizeModalOpen}
          onClose={() => {
            setIsCustomizeModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      </Suspense>
    </div>
  );
}
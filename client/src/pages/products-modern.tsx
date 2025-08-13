import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  ArrowUp,
  Package,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Eye,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import ModernProductCard from "@/components/modern-product-card";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import ProductCustomizationModal from "@/components/ProductCustomizationModal";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@shared/schema";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন আগে", icon: Clock },
  { value: "oldest", label: "পুরাতন আগে", icon: Clock },
  { value: "price_asc", label: "দাম: কম থেকে বেশি", icon: ArrowUp },
  { value: "price_desc", label: "দাম: বেশি থেকে কম", icon: ArrowUp },
  { value: "name_asc", label: "নাম: A-Z", icon: Filter },
  { value: "popular", label: "জনপ্রিয়", icon: TrendingUp },
];

const PRICE_RANGES = [
  { label: "সব দাম", min: 0, max: Infinity },
  { label: "৫০০ টাকার নিচে", min: 0, max: 500 },
  { label: "৫০০-১০০০ টাকা", min: 500, max: 1000 },
  { label: "১০০০-২০০০ টাকা", min: 1000, max: 2000 },
  { label: "২০০০-৫০০০ টাকা", min: 2000, max: 5000 },
  { label: "৫০০০ টাকার উপরে", min: 5000, max: Infinity },
];

const ModernProductsPage = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower) ||
        (product.category || '').toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        return product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
               selectedCategory.toLowerCase().includes(product.category.toLowerCase());
      });
    }

    // Price range filter
    if (priceRange.min > 0 || priceRange.max < Infinity) {
      filtered = filtered.filter(product => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      
      switch (sortOption) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'popular':
          return (b.stock || 0) - (a.stock || 0);
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        default: // newest
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortOption, priceRange]);

  const displayedProducts = filteredProducts.slice(0, displayLimit);
  const hasMoreProducts = filteredProducts.length > displayLimit;

  // Categorize products for tabs
  const categorizedProducts = useMemo(() => {
    return {
      all: filteredProducts,
      featured: filteredProducts.filter(p => p.is_featured),
      trending: filteredProducts.filter(p => p.is_best_selling),
      latest: filteredProducts.filter(p => p.is_latest),
    };
  }, [filteredProducts]);

  // Handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
    setPriceRange(PRICE_RANGES[0]);
  };

  const activeFiltersCount = [
    searchTerm.trim() !== "",
    selectedCategory !== "all",
    priceRange !== PRICE_RANGES[0],
    sortOption !== "newest"
  ].filter(Boolean).length;

  // Loading skeleton
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );

  if (error) {
    return (
      <UltraSimpleLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">পণ্য লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-4">দয়া করে পেজ রিফ্রেশ করুন</p>
            <Button onClick={() => window.location.reload()}>
              পেজ রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      </UltraSimpleLayout>
    );
  }

  return (
    <>
      <UltraSimpleLayout>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                {products.length}+ পণ্যের বিশাল সংগ্রহ
              </Badge>
              
              <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                আপনার পছন্দের পণ্য খুঁজুন
              </h1>
              
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                হাজার হাজার মানসম্পন্ন পণ্যের মধ্য থেকে বেছে নিন আপনার পছন্দের আইটেম
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="পণ্য খুঁজুন... (যেমন: টি-শার্ট, মগ, গিফট)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm rounded-2xl focus:bg-white/30 focus:border-white/50 transition-all duration-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/70" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="py-8 bg-white border-b border-gray-200 sticky top-20 z-40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Left Side - Filters */}
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  ফিল্টার
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-orange-500 text-white ml-1 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                {/* Quick Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {["all", "t-shirt", "mug", "gift-for-her", "gift-for-him"].map((category) => (
                    <Button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                    >
                      {category === "all" ? "সব পণ্য" :
                       category === "t-shirt" ? "টি-শার্ট" :
                       category === "mug" ? "মগ" :
                       category === "gift-for-her" ? "তার জন্য" :
                       "তার জন্য"}
                    </Button>
                  ))}
                </div>

                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    সাফ করুন
                  </Button>
                )}
              </div>

              {/* Right Side - View Controls */}
              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} টি পণ্য পাওয়া গেছে
                </span>

                <div className="flex items-center gap-2">
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="border border-gray-300 rounded-lg p-1 flex">
                    <Button
                      onClick={() => setViewMode("grid")}
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      className="p-2"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setViewMode("list")}
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      className="p-2"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-6 bg-gray-50 rounded-xl border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        ক্যাটেগরি
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="ক্যাটেগরি বেছে নিন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                          {Object.entries(PRODUCT_CATEGORIES).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              {category.nameBengali}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        দামের পরিসর
                      </label>
                      <Select 
                        value={PRICE_RANGES.findIndex(r => r.min === priceRange.min && r.max === priceRange.max).toString()}
                        onValueChange={(value) => setPriceRange(PRICE_RANGES[parseInt(value)])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_RANGES.map((range, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        সাজানো
                      </label>
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  কোনো পণ্য পাওয়া যায়নি
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  আপনার খোঁজার মাপকাঠিতে কোনো পণ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে ভিন্ন কিওয়ার্ড বা ফিল্টার ব্যবহার করুন।
                </p>
                <Button onClick={clearFilters} className="bg-orange-500 hover:bg-orange-600">
                  সব ফিল্টার সাফ করুন
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layout
                  className={`grid gap-6 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
                      : "grid-cols-1 max-w-4xl mx-auto"
                  }`}
                >
                  {displayedProducts.map((product, index) => (
                    <ModernProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewProduct}
                      onCustomize={handleCustomize}
                      index={index}
                      className={viewMode === "list" ? "w-full" : ""}
                    />
                  ))}
                </motion.div>

                {/* Load More Button */}
                {hasMoreProducts && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-12"
                  >
                    <Button
                      onClick={handleLoadMore}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full font-medium"
                    >
                      আরও পণ্য দেখুন
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>
      </UltraSimpleLayout>

      {/* Product Modal */}
      <UltraDynamicProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onCustomize={handleCustomize}
      />

      {/* Customize Modal */}
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setSelectedProduct(null);
        }}
        onOrderPlaced={(trackingId) => {
          toast({
            title: "অর্ডার সফল!",
            description: `আপনার অর্ডার নম্বর: ${trackingId}`,
          });
          setIsCustomizeModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
};

export default ModernProductsPage;
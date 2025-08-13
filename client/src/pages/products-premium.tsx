import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  Star,
  Package,
  ArrowUpDown
} from "lucide-react";
import PremiumLayout from "@/components/premium-layout";
import PerfectResponsiveProductCard from "@/components/perfect-responsive-product-card";
import { PerfectProductGrid } from "@/components/perfect-product-grid";
import PremiumProductDetailModal from "@/components/premium-product-detail-modal";
import PremiumLoadingSkeleton from "@/components/premium-loading-system";
import PerfectCustomizeModal from "@/components/perfect-customize-modal";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product, Category } from "@shared/schema";

export default function PremiumProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();

  // Get URL parameters for initial filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const featuredParam = urlParams.get('featured');
    const latestParam = urlParams.get('latest');
    const bestsellingParam = urlParams.get('bestselling');

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (featuredParam) setSortBy('featured');
    if (latestParam) setSortBy('latest');
    if (bestsellingParam) setSortBy('bestselling');
  }, []);

  // Fetch products
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Sort products
    switch (sortBy) {
      case 'featured':
        filtered = filtered.filter(p => p.is_featured);
        break;
      case 'latest':
        filtered = filtered.filter(p => p.is_latest);
        break;
      case 'bestselling':
        filtered = filtered.filter(p => p.is_best_selling);
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceB - priceA;
        });
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Handle product interactions
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleCustomizeProduct = (product: Product) => {
    setCustomizeProduct(product);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleAddToCart = async (product: Product, customization?: any) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image: product.image_url || '',
        quantity: customization?.quantity || 1,
        customization
      });

      trackAddToCart(
        product.id, 
        product.name, 
        typeof product.price === 'string' ? parseFloat(product.price) : product.price
      );

      toast({
        title: "কার্টে যোগ করা হয়েছে!",
        description: `${product.name}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useMemo effect
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name");
    window.history.replaceState(null, '', '/products');
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "all" ? selectedCategory : null,
    sortBy !== "name" ? sortBy : null
  ].filter(Boolean).length;

  return (
    <PremiumLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold premium-heading">
            আমাদের পণ্য সংগ্রহ
          </h1>
          <p className="text-lg premium-text-muted max-w-2xl mx-auto">
            হাজারো পণ্যের মধ্যে থেকে আপনার পছন্দের পণ্য খুঁজে নিন
          </p>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="premium-button-secondary"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              ফিল্টার
              {activeFiltersCount > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="premium-button-secondary"
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          <Card className={`premium-card p-6 space-y-4 ${showFilters || window.innerWidth >= 1024 ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="পণ্য খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটেগরি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল ক্যাটেগরি</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name_bengali || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="সাজান" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">নাম অনুসারে</SelectItem>
                  <SelectItem value="price-low">দাম (কম থেকে বেশি)</SelectItem>
                  <SelectItem value="price-high">দাম (বেশি থেকে কম)</SelectItem>
                  <SelectItem value="featured">ফিচার্ড</SelectItem>
                  <SelectItem value="latest">নতুন</SelectItem>
                  <SelectItem value="bestselling">বেস্ট সেলার</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle (Desktop) */}
              <div className="hidden lg:flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="premium-button-secondary flex-1"
                >
                  {viewMode === "grid" ? (
                    <>
                      <List className="w-4 h-4 mr-2" />
                      তালিকা
                    </>
                  ) : (
                    <>
                      <Grid className="w-4 h-4 mr-2" />
                      গ্রিড
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filters & Clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">সক্রিয় ফিল্টার:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      খুঁজুন: {searchQuery}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      ক্যাটেগরি: {selectedCategory}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSelectedCategory("all")}
                      />
                    </Badge>
                  )}
                  {sortBy !== "name" && (
                    <Badge variant="secondary" className="gap-1">
                      সাজান: {sortBy}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSortBy("name")}
                      />
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="premium-button-secondary"
                >
                  সব পরিষ্কার করুন
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm premium-text-muted">
              {productsLoading ? (
                "লোড হচ্ছে..."
              ) : (
                `${filteredProducts.length}টি পণ্য পাওয়া গেছে`
              )}
            </span>
          </div>
          
          {!productsLoading && filteredProducts.length === 0 && searchQuery && (
            <Badge variant="outline" className="text-orange-600">
              কোন পণ্য পাওয়া যায়নি
            </Badge>
          )}
        </div>

        {/* Products Grid/List */}
        <div className="space-y-6">
          {productsLoading ? (
            <PremiumLoadingSkeleton variant={viewMode} count={12} />
          ) : productsError ? (
            <Card className="premium-card p-8 text-center">
              <div className="space-y-4">
                <Package className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">পণ্য লোড করতে সমস্যা হয়েছে</h3>
                  <p className="premium-text-muted">
                    দয়া করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.reload()}
                  className="premium-button-primary"
                >
                  রিফ্রেশ করুন
                </Button>
              </div>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="premium-card p-8 text-center">
              <div className="space-y-4">
                <Search className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">কোন পণ্য পাওয়া যায়নি</h3>
                  <p className="premium-text-muted">
                    আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন
                  </p>
                </div>
                {activeFiltersCount > 0 && (
                  <Button 
                    onClick={clearFilters}
                    className="premium-button-primary"
                  >
                    সব ফিল্টার পরিষ্কার করুন
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            viewMode === "list" ? (
              <div className="space-y-4">
                {filteredProducts.map((product: Product, index) => (
                  <PerfectResponsiveProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewProduct}
                    onCustomize={handleCustomizeProduct}
                    className="premium-fade-in"
                  />
                ))}
              </div>
            ) : (
              <PerfectProductGrid>
                {filteredProducts.map((product: Product, index) => (
                  <PerfectResponsiveProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewProduct}
                    onCustomize={handleCustomizeProduct}
                    className="premium-fade-in"
                  />
                ))}
              </PerfectProductGrid>
            )
          )}
        </div>

        {/* Load More Button (if needed) */}
        {filteredProducts.length > 0 && filteredProducts.length >= 24 && (
          <div className="text-center pt-8">
            <Button 
              variant="outline" 
              size="lg"
              className="premium-button-secondary px-8"
            >
              আরো পণ্য দেখুন
              <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <PremiumProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onCustomize={handleCustomizeProduct}
      />

      {/* Customize Modal */}
      {customizeProduct && (
        <PerfectCustomizeModal
          product={customizeProduct}
          isOpen={!!customizeProduct}
          onClose={() => setCustomizeProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </PremiumLayout>
  );
}
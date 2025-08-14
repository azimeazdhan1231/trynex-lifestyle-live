import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid3X3, List, SlidersHorizontal, Heart, ShoppingCart, X, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import UltraModernProductCard from "@/components/ultra-modern-product-card";
import SimpleCustomizeModal from "@/components/simple-customize-modal";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@shared/schema";

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন আগে" },
  { value: "oldest", label: "পুরাতন আগে" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "name_asc", label: "নাম: A-Z" },
  { value: "featured", label: "ফিচার্ড প্রথমে" },
  { value: "popular", label: "জনপ্রিয় প্রথমে" },
];

const VIEW_OPTIONS = [
  { value: "grid", icon: Grid3X3, label: "গ্রিড ভিউ" },
  { value: "list", icon: List, label: "লিস্ট ভিউ" }
];

export default function UltraModernProductsPage() {
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  const productsPerPage = viewMode === 'grid' ? 12 : 8;

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Parse URL parameters for initial filters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const category = params.get('category');
    const filter = params.get('filter');
    
    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
    if (filter === 'featured') setShowOnlyFeatured(true);
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
      const matchesFeatured = !showOnlyFeatured || product.is_featured;
      const matchesStock = !showOnlyInStock || product.stock > 0;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesFeatured && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      
      switch (sortOption) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "oldest":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case "popular":
          return (b.is_best_selling ? 1 : 0) - (a.is_best_selling ? 1 : 0);
        case "newest":
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortOption, priceRange, showOnlyFeatured, showOnlyInStock]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOption, priceRange, showOnlyFeatured, showOnlyInStock]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      quantity: 1,
      image_url: product.image_url || '',
    });
    toast({
      title: "পণ্য যোগ করা হয়েছে!",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
    setPriceRange([0, 10000]);
    setShowOnlyFeatured(false);
    setShowOnlyInStock(false);
  };

  // Loading skeleton
  const ProductSkeleton = () => (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">কিছু ভুল হয়েছে</h2>
          <p className="text-gray-600 mb-4">পণ্য লোড করতে সমস্যা হয়েছে</p>
          <Button onClick={() => window.location.reload()}>আবার চেষ্টা করুন</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">সকল পণ্য</h1>
              <p className="text-gray-600">
                {isLoading ? "লোড হচ্ছে..." : `${filteredAndSortedProducts.length} টি পণ্য পাওয়া গেছে`}
              </p>
            </div>
            
            {totalItems > 0 && (
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                কার্ট দেখুন
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </Badge>
              </Button>
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-3 text-base bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                data-testid="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showOnlyFeatured ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={showOnlyFeatured ? "bg-orange-500 hover:bg-orange-600" : "border-orange-500 text-orange-500 hover:bg-orange-50"}
              >
                <Star className="w-4 h-4 mr-1" />
                ফিচার্ড
              </Button>
              
              <Button
                variant={showOnlyInStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                className={showOnlyInStock ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-500 hover:bg-green-50"}
              >
                স্টকে আছে
              </Button>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-2">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-44 bg-white border-gray-300">
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

              <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-lg p-1">
                {VIEW_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={viewMode === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(option.value as 'grid' | 'list')}
                    className={`px-3 ${
                      viewMode === option.value 
                        ? "bg-orange-500 text-white hover:bg-orange-600" 
                        : "text-gray-600 hover:text-orange-500"
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden border-gray-300">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    ফিল্টার
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>ফিল্টার</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Mobile Filters Content */}
                    <FilterContent
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      clearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <Card className="sticky top-32">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">ফিল্টার</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-orange-500">
                    রিসেট
                  </Button>
                </div>
                <FilterContent
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  clearFilters={clearFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            
            {/* Active Filters */}
            {(searchTerm || selectedCategory !== "all" || showOnlyFeatured || showOnlyInStock) && (
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">সক্রিয় ফিল্টার:</span>
                  
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      খোজা: "{searchTerm}"
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-orange-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {PRODUCT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                      <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {showOnlyFeatured && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      ফিচার্ড
                      <button onClick={() => setShowOnlyFeatured(false)} className="ml-1 hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {showOnlyInStock && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      স্টকে আছে
                      <button onClick={() => setShowOnlyInStock(false)} className="ml-1 hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-gray-600">
                  সব ফিল্টার সাফ করুন
                </Button>
              </div>
            )}

            {/* Products List */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: productsPerPage }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
                <p className="text-gray-600 mb-4">আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
                <Button onClick={clearFilters} variant="outline">
                  সব ফিল্টার সাফ করুন
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {paginatedProducts.map((product) => (
                    <UltraModernProductCard
                      key={product.id}
                      product={product}
                      onViewProduct={handleViewProduct}
                      onCustomize={handleCustomize}
                      onAddToCart={handleAddToCart}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      পূর্ববর্তী
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (pageNumber > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={currentPage === pageNumber ? "bg-orange-500 hover:bg-orange-600" : ""}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      পরবর্তী
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <>
          <SimpleCustomizeModal
            isOpen={showCustomizeModal}
            onClose={() => setShowCustomizeModal(false)}
            product={selectedProduct}
            onAddToCart={(customizedProduct) => {
              addToCart(customizedProduct);
              toast({
                title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!",
                description: `${selectedProduct.name} কার্টে যোগ করা হয়েছে`,
              });
              setShowCustomizeModal(false);
            }}
          />

          <UltraDynamicProductModal
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
            product={selectedProduct}
            onCustomize={(product) => {
              setShowProductModal(false);
              handleCustomize(product);
            }}
          />
        </>
      )}
    </div>
  );
}

// Filter Content Component
interface FilterContentProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  clearFilters: () => void;
}

function FilterContent({ 
  selectedCategory, 
  setSelectedCategory, 
  priceRange, 
  setPriceRange, 
  clearFilters 
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      
      {/* Category Filter */}
      <div>
        <h4 className="font-semibold mb-3">ক্যাটাগরি</h4>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
            {PRODUCT_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div>
        <h4 className="font-semibold mb-3">দামের পরিসীমা</h4>
        <div className="px-3">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={10000}
            min={0}
            step={100}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>৳{priceRange[0]}</span>
            <span>৳{priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
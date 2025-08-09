import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, Filter, Grid, List, ChevronDown, X, SlidersHorizontal, 
  Heart, ShoppingCart, Eye, Star, Plus, Sparkles, ArrowUpDown, 
  Package, Zap, TrendingUp, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderNowModal from "@/components/order-now-modal";
import EnhancedCartModal from "@/components/enhanced-cart-modal";
import EnhancedCustomizationModal from "@/components/enhanced-customization-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
  sortBy: 'name' | 'price' | 'newest' | 'featured' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: '',
  minPrice: 0,
  maxPrice: 10000,
  inStock: false,
  featured: false,
  sortBy: 'featured',
  sortOrder: 'desc'
};

const SORT_OPTIONS = [
  { value: 'featured-desc', label: 'ফিচার্ড পণ্য আগে', icon: Star },
  { value: 'newest-desc', label: 'নতুন পণ্য আগে', icon: Clock },
  { value: 'popularity-desc', label: 'জনপ্রিয় পণ্য', icon: TrendingUp },
  { value: 'price-asc', label: 'কম দাম আগে', icon: ArrowUpDown },
  { value: 'price-desc', label: 'বেশি দাম আগে', icon: ArrowUpDown },
  { value: 'name-asc', label: 'নাম অনুসারে (A-Z)', icon: ArrowUpDown },
  { value: 'name-desc', label: 'নাম অনুসারে (Z-A)', icon: ArrowUpDown }
];

// Enhanced Product Card Component with hover effects and perfect responsive design
function EnhancedProductCard({ product }: { product: Product }) {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isOrderNowOpen, setIsOrderNowOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;
  const isOutOfStock = stock === 0;

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    trackProductView(product.id, product.name || 'Unknown Product', product.category || 'uncategorized');
    setIsQuickViewOpen(true);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name || 'Unknown Product',
      price: price,
      image: product.image_url || '',
      quantity: 1
    });

    trackAddToCart(product.id, product.name || 'Unknown Product', price);

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
      duration: 3000,
    });
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCustomizeOpen(true);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "ফেভারিট থেকে সরানো হয়েছে" : "ফেভারিটে যোগ করা হয়েছে",
      description: `${product.name}`,
      duration: 2000,
    });
  };

  const productImage = product.image_url || '/placeholder-product.jpg';

  return (
    <>
      <Card 
        className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white overflow-hidden ${
          isOutOfStock ? 'opacity-75' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewProduct}
        data-testid={`product-card-${product.id}`}
      >
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <div className="aspect-square relative bg-gray-100">
            {!imageError ? (
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
                loading="lazy"
                data-testid={`product-image-${product.id}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Overlay with Action Buttons */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
                onClick={handleQuickView}
                data-testid={`button-quick-view-${product.id}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                দ্রুত দেখুন
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="bg-orange-500/90 hover:bg-orange-600 text-white backdrop-blur-sm"
                onClick={handleCustomize}
                data-testid={`button-customize-${product.id}`}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                কাস্টমাইজ
              </Button>
            </div>

            {/* Product Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.is_featured && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs font-medium">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচার্ড
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" className="bg-gray-800 text-white border-0 text-xs">
                  স্টক নেই
                </Badge>
              )}
              {stock > 0 && stock <= 5 && (
                <Badge variant="destructive" className="text-xs">
                  মাত্র {stock}টি বাকি
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                isFavorite 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white/80 hover:bg-white text-gray-700'
              }`}
              onClick={toggleFavorite}
              data-testid={`button-favorite-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Product Details */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Category */}
              {product.category && (
                <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                  {product.category}
                </Badge>
              )}

              {/* Product Name */}
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>

              {/* Product Description */}
              {product.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Price and Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  <span className="text-xs text-gray-500">
                    স্টক: {stock}টি
                  </span>
                </div>

                <Button
                  size="sm"
                  className={`${
                    isOutOfStock 
                      ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  } text-white transition-all duration-200 transform hover:scale-105`}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  data-testid={`button-add-to-cart-${product.id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {isOutOfStock ? 'স্টক নেই' : 'যোগ করুন'}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Quick View Modal */}
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Additional image thumbnails will be added here when multiple images are supported */}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-gray-600 mt-2">{product.description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-orange-600">
                    {formatPrice(price)}
                  </span>
                  <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
                    {isOutOfStock ? 'স্টক নেই' : `${stock}টি স্টকে আছে`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      কার্টে যোগ করুন
                    </Button>
                    
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOrderNowOpen(true);
                      }}
                      disabled={isOutOfStock}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      অর্ডার করুন
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={handleCustomize}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    কাস্টমাইজ করুন
                  </Button>
                </div>
              </div>

              {/* Additional Product Info */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">প্রোডাক্ট আইডি:</span>
                  <span className="font-mono">{product.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ক্যাটেগরি:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">স্টক স্ট্যাটাস:</span>
                  <span className={isOutOfStock ? 'text-red-600' : 'text-green-600'}>
                    {isOutOfStock ? 'স্টক নেই' : 'স্টকে আছে'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Now Modal */}
      <OrderNowModal
        isOpen={isOrderNowOpen}
        onClose={() => setIsOrderNowOpen(false)}
        product={product}
      />

      {/* Enhanced Customization Modal */}
      <EnhancedCustomizationModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        product={product}
      />
    </>
  );
}

// Enhanced Search Component with real-time filtering
function EnhancedSearchAndFilter({ 
  filters, 
  setFilters, 
  categories,
  productCount,
  isLoading 
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: { name: string }[];
  productCount: number;
  isLoading: boolean;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 10000) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="পণ্য খুঁজুন... (উদাহরণ: কাস্টম মগ, টি-শার্ট, ফটো ফ্রেম)"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
              data-testid="search-input"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex gap-3 items-center">
            {/* Sort Dropdown */}
            <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  ফিল্টার
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    <span>ফিল্টার অপশন</span>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        সব সাফ করুন
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm font-medium">ক্যাটেগরি</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">সব ক্যাটেগরি</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium">দামের সীমা</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">সর্বনিম্ন</Label>
                        <Input
                          type="number"
                          placeholder="০"
                          value={filters.minPrice || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">সর্বোচ্চ</Label>
                        <Input
                          type="number"
                          placeholder="১০০০০"
                          value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 10000 }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <Label className="text-sm font-medium">দ্রুত ফিল্টার</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inStock"
                          checked={filters.inStock}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: !!checked }))}
                        />
                        <Label htmlFor="inStock" className="text-sm">শুধু স্টকে আছে এমন পণ্য</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={filters.featured}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, featured: !!checked }))}
                        />
                        <Label htmlFor="featured" className="text-sm">শুধু ফিচার্ড পণ্য</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            {isLoading ? (
              <span>অনুসন্ধান করা হচ্ছে...</span>
            ) : (
              <span>
                {productCount}টি পণ্য পাওয়া গেছে
                {activeFiltersCount > 0 && ` (${activeFiltersCount}টি ফিল্টার প্রয়োগ করা হয়েছে)`}
              </span>
            )}
          </div>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-orange-600 hover:text-orange-700">
              সব ফিল্টার সাফ করুন
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Products Page Component
export default function RedesignedProductsPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Parse URL parameters for initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || urlParams.get('q') || '';
    const categoryFilter = urlParams.get('category') || '';
    
    if (searchQuery || categoryFilter) {
      setFilters(prev => ({
        ...prev,
        search: searchQuery,
        category: categoryFilter
      }));
    }
  }, []);

  // Fetch products with error handling and retry
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery<{ name: string }[]>({
    queryKey: ['/api/categories'],
    select: (data) => data?.map(cat => ({ name: cat.name })) || [],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    let filtered = products.filter(product => {
      // Search filter - enhanced with multiple field search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          product.name || '',
          product.description || '',
          product.category || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) return false;

      // Price range filter
      const price = Number(product.price) || 0;
      if (price < filters.minPrice || price > filters.maxPrice) return false;

      // Stock filter
      if (filters.inStock && (Number(product.stock) || 0) === 0) return false;

      // Featured filter
      if (filters.featured && !product.is_featured) return false;

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      if (filters.sortBy === 'price') {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        return filters.sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      } else if (filters.sortBy === 'name') {
        const comparison = (a.name || '').localeCompare(b.name || '');
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      } else if (filters.sortBy === 'featured') {
        const aFeatured = a.is_featured ? 1 : 0;
        const bFeatured = b.is_featured ? 1 : 0;
        return filters.sortOrder === 'asc' ? aFeatured - bFeatured : bFeatured - aFeatured;
      } else if (filters.sortBy === 'newest') {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return filters.sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      return 0;
    });

    return filtered;
  }, [products, filters]);

  // Loading state
  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">পণ্য লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-4">অনুগ্রহ করে পুনরায় চেষ্টা করুন</p>
            <Button onClick={() => refetch()} className="bg-orange-500 hover:bg-orange-600">
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Search and Filter Section */}
        <EnhancedSearchAndFilter
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          productCount={filteredProducts.length}
          isLoading={isLoading}
        />

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 product-grid">
              {filteredProducts.map((product) => (
                <EnhancedProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">কোন পণ্য পাওয়া যায়নি</h2>
              <p className="text-gray-600 mb-4">আপনার অনুসন্ধানের জন্য কোন পণ্য পাওয়া যায়নি। অন্য কিছু খুঁজে দেখুন।</p>
              <Button 
                variant="outline" 
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                সব ফিল্টার সাফ করুন
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Filter, Grid, List, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import EnhancedProductGrid from "@/components/enhanced-product-grid";
import { trackProductView } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
  sortBy: 'name' | 'price' | 'newest' | 'featured';
  sortOrder: 'asc' | 'desc';
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 10000,
  inStock: false,
  featured: false,
  sortBy: 'featured',
  sortOrder: 'desc'
};

const SORT_OPTIONS = [
  { value: 'featured-desc', label: 'ফিচার্ড পণ্য আগে' },
  { value: 'newest-desc', label: 'নতুন পণ্য আগে' },
  { value: 'price-asc', label: 'কম দাম আগে' },
  { value: 'price-desc', label: 'বেশি দাম আগে' },
  { value: 'name-asc', label: 'নাম অনুসারে (A-Z)' },
  { value: 'name-desc', label: 'নাম অনুসারে (Z-A)' }
];

export default function EnhancedProductsPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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
    select: (data) => data?.map(cat => ({ name: cat.name })) || []
  });

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.minPrice > 0 || filters.maxPrice < 10000) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product => 
        (product.name || '').toLowerCase().includes(searchTerm) ||
        (product.description || '').toLowerCase().includes(searchTerm) ||
        (product.category || '').toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(product => product.category === filters.category);
    }

    // Price range filter
    result = result.filter(product => {
      const price = Number(product.price) || 0;
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Stock filter
    if (filters.inStock) {
      result = result.filter(product => Number(product.stock) > 0);
    }

    // Featured filter
    if (filters.featured) {
      result = result.filter(product => product.is_featured);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return filters.sortOrder === 'asc' 
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        
        case 'price':
          const priceA = Number(a.price) || 0;
          const priceB = Number(b.price) || 0;
          return filters.sortOrder === 'asc' 
            ? priceA - priceB 
            : priceB - priceA;
        
        case 'newest':
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return filters.sortOrder === 'desc' 
            ? dateB - dateA 
            : dateA - dateB;
        
        case 'featured':
        default:
          const featuredA = a.is_featured ? 1 : 0;
          const featuredB = b.is_featured ? 1 : 0;
          if (featuredA !== featuredB) {
            return filters.sortOrder === 'desc' 
              ? featuredB - featuredA 
              : featuredA - featuredB;
          }
          // Secondary sort by name
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return result;
  }, [products, filters]);

  // Handle filter changes
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Track filter usage (simplified)
    console.log('Filter used:', key, value);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
    
    console.log('Sort changed:', sortBy, sortOrder);
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    console.log('All filters cleared');
  };

  const handleProductSelect = (product: Product) => {
    setLocation(`/product/${product.id}`);
  };

  const handleCustomize = (product: Product) => {
    setLocation(`/customize/${product.id}`);
  };

  // Set page title
  useEffect(() => {
    document.title = "পণ্যসমূহ - Trynex Lifestyle";
  }, []);

  return (
    <MobileOptimizedLayout>
      <div className="pb-safe-area-bottom">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              আমাদের পণ্যসমূহ
            </h1>
            <p className="text-gray-600">
              {isLoading 
                ? 'পণ্য লোড হচ্ছে...'
                : `${filteredProducts.length}টি পণ্য পাওয়া গেছে`
              }
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-lg border p-4 mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
                data-testid="input-search"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  data-testid="button-clear-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 flex-shrink-0"
                    data-testid="button-filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    ফিল্টার
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>ফিল্টার অপশন</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    {/* Category Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">ক্যাটেগরি</Label>
                      <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="সব ক্যাটেগরি" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
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
                      <Label className="text-sm font-medium mb-2 block">দামের পরিসীমা</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="সর্বনিম্ন"
                          value={filters.minPrice || ''}
                          onChange={(e) => updateFilter('minPrice', Number(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="সর্বোচ্চ"
                          value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                          onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || 10000)}
                        />
                      </div>
                    </div>

                    {/* Stock Filter */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inStock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) => updateFilter('inStock', checked)}
                      />
                      <Label htmlFor="inStock" className="cursor-pointer">
                        শুধু স্টকে আছে এমন পণ্য
                      </Label>
                    </div>

                    {/* Featured Filter */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.featured}
                        onCheckedChange={(checked) => updateFilter('featured', checked)}
                      />
                      <Label htmlFor="featured" className="cursor-pointer">
                        শুধু ফিচার্ড পণ্য
                      </Label>
                    </div>

                    <Separator />

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="w-full"
                      disabled={activeFiltersCount === 0}
                      data-testid="button-clear-filters"
                    >
                      সব ফিল্টার সাফ করুন
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Quick Category Filters */}
              <div className="flex gap-2 overflow-x-auto">
                {categories.slice(0, 3).map((category) => (
                  <Button
                    key={category.name}
                    variant={filters.category === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('category', 
                      filters.category === category.name ? 'all' : category.name
                    )}
                    className="flex-shrink-0 text-sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Sort and View Controls */}
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                {/* Sort */}
                <Select 
                  value={`${filters.sortBy}-${filters.sortOrder}`} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-48">
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

                {/* View Mode Toggle */}
                <div className="hidden md:flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                    data-testid="button-grid-view"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none border-l-0"
                    data-testid="button-list-view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">সক্রিয় ফিল্টার:</span>
                
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    খুঁজুন: {filters.search}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilter('search', '')}
                      className="p-0 h-auto ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}

                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.category}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilter('category', 'all')}
                      className="p-0 h-auto ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}

                {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ৳{filters.minPrice} - ৳{filters.maxPrice}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateFilter('minPrice', 0);
                        updateFilter('maxPrice', 10000);
                      }}
                      className="p-0 h-auto ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}

                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    স্টকে আছে
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilter('inStock', false)}
                      className="p-0 h-auto ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}

                {filters.featured && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ফিচার্ড
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilter('featured', false)}
                      className="p-0 h-auto ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-4">
                  <Filter className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">পণ্য লোড করতে সমস্যা</h3>
                  <p className="text-sm text-gray-600">দুঃখিত, পণ্যগুলি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>
                </div>
                <Button onClick={() => refetch()}>
                  আবার চেষ্টা করুন
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          <EnhancedProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
            onProductSelect={handleProductSelect}
            onCustomize={handleCustomize}
            className="mb-8"
          />

          {/* No Results */}
          {!isLoading && !error && filteredProducts.length === 0 && products.length > 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
                <p className="text-gray-600 mb-6">
                  আপনার ফিল্টার অনুযায়ী কোন পণ্য খুঁজে পাওয়া যায়নি। অন্য অপশন চেষ্টা করুন।
                </p>
                <Button onClick={clearAllFilters}>
                  সব ফিল্টার সাফ করুন
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Performance Info for Debug */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 text-xs text-gray-500 text-center">
              <p>
                প্রোডাক্টস: {products.length} | ফিল্টার্ড: {filteredProducts.length} | 
                লোডিং: {isLoading ? 'হ্যাঁ' : 'না'} | ত্রুটি: {error ? 'হ্যাঁ' : 'না'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}
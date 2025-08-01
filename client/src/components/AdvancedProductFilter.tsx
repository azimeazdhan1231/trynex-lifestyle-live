import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Filter, Search, X, Star, TrendingUp, Package, 
  Palette, Grid, List, ChevronDown, Brain, Sparkles,
  ArrowUpDown, SlidersHorizontal
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Product } from "@shared/schema";

interface FilterOptions {
  searchQuery: string;
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  featured: boolean;
  latest: boolean;
  bestSelling: boolean;
  sortBy: 'name' | 'price_low' | 'price_high' | 'newest' | 'featured' | 'ai_score';
  viewMode: 'grid' | 'list';
}

interface AdvancedProductFilterProps {
  products: Product[];
  onFilteredProducts: (products: Product[]) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  enableAI?: boolean;
}

const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  category: 'all',
  priceRange: [0, 10000],
  inStock: false,
  featured: false,
  latest: false,
  bestSelling: false,
  sortBy: 'ai_score',
  viewMode: 'grid'
};

// AI-powered search scoring
const calculateAIScore = (product: Product, searchQuery: string, userPreferences: any = {}): number => {
  let score = 0;
  const query = searchQuery.toLowerCase();
  const name = product.name.toLowerCase();
  const description = (product.description || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  // Exact match gets highest score
  if (name === query) score += 100;
  
  // Name contains query
  if (name.includes(query)) score += 50;
  
  // Description contains query
  if (description.includes(query)) score += 20;
  
  // Category match
  if (category.includes(query)) score += 30;
  
  // Bengali keyword matching
  const bengaliKeywords = {
    'গিফট': ['gift', 'present', 'উপহার'],
    'টি-শার্ট': ['tshirt', 't-shirt', 'shirt'],
    'মগ': ['mug', 'cup', 'কাপ'],
    'কাস্টম': ['custom', 'customize', 'personalized'],
    'ফ্যাশন': ['fashion', 'style', 'clothing'],
    'ইলেকট্রনিক্স': ['electronics', 'gadget', 'device']
  };
  
  Object.entries(bengaliKeywords).forEach(([bengali, english]) => {
    if (query.includes(bengali) || english.some(word => query.includes(word))) {
      if (name.includes(bengali) || english.some(word => name.includes(word))) {
        score += 40;
      }
    }
  });
  
  // Boost based on product flags
  if (product.is_featured) score += 15;
  if (product.is_latest) score += 10;
  if (product.is_best_selling) score += 12;
  
  // Price range preference (boost mid-range products)
  const price = parseFloat(product.price);
  if (price >= 300 && price <= 2000) score += 5;
  
  return score;
};

export default function AdvancedProductFilter({ 
  products, 
  onFilteredProducts, 
  onViewModeChange,
  enableAI = true 
}: AdvancedProductFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return cats.sort();
  }, [products]);

  // Get price range
  const priceRange = useMemo(() => {
    const prices = products.map(p => parseFloat(p.price)).filter(p => !isNaN(p));
    return {
      min: Math.min(...prices) || 0,
      max: Math.max(...prices) || 10000
    };
  }, [products]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter with AI scoring
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim();
      
      if (enableAI && filters.sortBy === 'ai_score') {
        // AI-powered search with scoring
        filtered = filtered
          .map(product => ({
            ...product,
            aiScore: calculateAIScore(product, query)
          }))
          .filter(product => product.aiScore > 0)
          .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      } else {
        // Traditional search
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          (product.description || '').toLowerCase().includes(query.toLowerCase()) ||
          (product.category || '').toLowerCase().includes(query.toLowerCase())
        );
      }
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Feature filters
    if (filters.featured) {
      filtered = filtered.filter(product => product.is_featured);
    }
    if (filters.latest) {
      filtered = filtered.filter(product => product.is_latest);
    }
    if (filters.bestSelling) {
      filtered = filtered.filter(product => product.is_best_selling);
    }

    // Sorting (if not already sorted by AI)
    if (!filters.searchQuery.trim() || filters.sortBy !== 'ai_score') {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price_low':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price_high':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'newest':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          case 'featured':
            return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
          default:
            // AI score sorting (for non-search scenarios)
            const scoreA = (a.is_featured ? 3 : 0) + (a.is_latest ? 2 : 0) + (a.is_best_selling ? 2 : 0);
            const scoreB = (b.is_featured ? 3 : 0) + (b.is_latest ? 2 : 0) + (b.is_best_selling ? 2 : 0);
            return scoreB - scoreA;
        }
      });
    }

    return filtered;
  }, [products, filters, enableAI]);

  // Update active filters count
  useEffect(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.category !== 'all') count++;
    if (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    if (filters.latest) count++;
    if (filters.bestSelling) count++;
    
    setActiveFiltersCount(count);
  }, [filters, priceRange]);

  // Emit filtered products
  useEffect(() => {
    onFilteredProducts(filteredProducts);
  }, [filteredProducts, onFilteredProducts]);

  // Emit view mode changes
  useEffect(() => {
    onViewModeChange(filters.viewMode);
  }, [filters.viewMode, onViewModeChange]);

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <Card className="w-full mb-6 bg-gradient-to-r from-white to-blue-50/30 border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="w-5 h-5 text-blue-600" />
              {enableAI && (
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
              )}
            </div>
            <CardTitle className="text-lg">
              উন্নত ফিল্টার
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            {enableAI && (
              <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
                <Brain className="w-3 h-3 mr-1" />
                AI পাওয়ার্ড
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('viewMode', 'grid')}
                className="px-3 py-1 h-8"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('viewMode', 'list')}
                className="px-3 py-1 h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Collapse Toggle */}
            <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="px-3 py-1 h-8">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  {isCollapsed ? 'দেখান' : 'লুকান'}
                  <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center">
                        <Search className="w-4 h-4 mr-2" />
                        পণ্য খুঁজুন
                        {enableAI && filters.searchQuery && (
                          <Badge variant="outline" className="ml-2 text-xs border-blue-400 text-blue-700">
                            AI স্মার্ট সার্চ
                          </Badge>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder="পণ্যের নাম, বিবরণ বা ক্যাটেগরি লিখুন..."
                          value={filters.searchQuery}
                          onChange={(e) => updateFilter('searchQuery', e.target.value)}
                          className="pl-10"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {filters.searchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateFilter('searchQuery', '')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Category Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">ক্যাটেগরি</Label>
                        <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সকল ক্যাটেগরি</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          মূল্য পরিসর (৳{filters.priceRange[0]} - ৳{filters.priceRange[1]})
                        </Label>
                        <div className="px-2">
                          <Slider
                            value={filters.priceRange}
                            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                            max={priceRange.max}
                            min={priceRange.min}
                            step={50}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>৳{priceRange.min}</span>
                          <span>৳{priceRange.max}</span>
                        </div>
                      </div>

                      {/* Sort Options */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          সাজান
                        </Label>
                        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as FilterOptions['sortBy'])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {enableAI && (
                              <SelectItem value="ai_score">
                                <div className="flex items-center">
                                  <Brain className="w-4 h-4 mr-2" />
                                  AI স্মার্ট সাজান
                                </div>
                              </SelectItem>
                            )}
                            <SelectItem value="name">নাম অনুযায়ী</SelectItem>
                            <SelectItem value="price_low">কম দাম</SelectItem>
                            <SelectItem value="price_high">বেশি দাম</SelectItem>
                            <SelectItem value="newest">নতুন</SelectItem>
                            <SelectItem value="featured">ফিচার্ড</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quick Filters */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">দ্রুত ফিল্টার</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="inStock"
                              checked={filters.inStock}
                              onCheckedChange={(checked) => updateFilter('inStock', checked as boolean)}
                            />
                            <Label htmlFor="inStock" className="text-sm flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              স্টকে আছে
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="featured"
                              checked={filters.featured}
                              onCheckedChange={(checked) => updateFilter('featured', checked as boolean)}
                            />
                            <Label htmlFor="featured" className="text-sm flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              ফিচার্ড
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="latest"
                              checked={filters.latest}
                              onCheckedChange={(checked) => updateFilter('latest', checked as boolean)}
                            />
                            <Label htmlFor="latest" className="text-sm flex items-center">
                              <Sparkles className="w-4 h-4 mr-1" />
                              নতুন
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="bestSelling"
                              checked={filters.bestSelling}
                              onCheckedChange={(checked) => updateFilter('bestSelling', checked as boolean)}
                            />
                            <Label htmlFor="bestSelling" className="text-sm flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              বেস্ট সেলিং
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          সব ফিল্টার সাফ করুন
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
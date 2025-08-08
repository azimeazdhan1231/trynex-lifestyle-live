import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Skeleton component for loading states
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Star, 
  ShoppingCart,
  Heart,
  Eye,
  TrendingUp,
  Clock,
  ArrowUpDown
} from "lucide-react";
import UnifiedProductCard from "@/components/unified-product-card";
import { formatPrice } from "@/lib/constants";
import YoutubeSearchBar from "@/components/search/youtube-search-bar";
import type { Product } from "@shared/schema";

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  inStock: boolean;
  rating: string;
}

interface SearchResults {
  products: Product[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  searchTime: number;
  suggestions?: string[];
  correctedQuery?: string;
  relatedQueries?: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "relevance",
    inStock: false,
    rating: "all"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    const category = urlParams.get('category') || 'all';
    const minPrice = urlParams.get('min_price') || '';
    const maxPrice = urlParams.get('max_price') || '';
    const sortBy = urlParams.get('sort') || 'relevance';
    const inStock = urlParams.get('in_stock') === 'true';
    const rating = urlParams.get('rating') || 'all';
    const page = parseInt(urlParams.get('page') || '1');

    setSearchQuery(query);
    setFilters({ category, minPrice, maxPrice, sortBy, inStock, rating });
    setCurrentPage(page);
  }, []);

  // Build search parameters
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
    if (filters.inStock) params.set('in_stock', 'true');
    if (filters.rating !== 'all') params.set('rating', filters.rating);
    if (currentPage > 1) params.set('page', currentPage.toString());
    params.set('algorithm', 'youtube'); // Use YouTube-style search algorithm
    
    return params.toString();
  }, [searchQuery, filters, currentPage]);

  // Search API call with YouTube-style algorithm
  const { data: searchResults, isLoading, error } = useQuery<SearchResults>({
    queryKey: ["/api/search/advanced", searchParams],
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // YouTube-style search algorithm implementation
  const processSearchResults = (results: Product[], query: string) => {
    if (!query || !results) return results;

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return results.map(product => {
      let relevanceScore = 0;
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();

      // Exact match bonus
      if (productText.includes(query.toLowerCase())) {
        relevanceScore += 100;
      }

      // Individual term matches
      searchTerms.forEach(term => {
        if (productText.includes(term)) {
          relevanceScore += 10;
        }
        
        // Title match bonus
        if (product.name.toLowerCase().includes(term)) {
          relevanceScore += 25;
        }

        // Category match bonus
        if (product.category?.toLowerCase().includes(term)) {
          relevanceScore += 15;
        }
      });

      // Popularity factors (similar to YouTube)
      if (product.is_best_selling) relevanceScore += 20;
      if (product.is_featured) relevanceScore += 15;
      if (product.is_latest) relevanceScore += 10;

      // Stock availability
      if (product.stock > 0) relevanceScore += 5;
      if (product.stock > 10) relevanceScore += 5;

      return {
        ...product,
        relevanceScore
      };
    }).sort((a, b) => {
      // Sort by relevance score (YouTube-style)
      if (filters.sortBy === 'relevance') {
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
      
      // Other sorting options
      switch (filters.sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'popular':
          return (b.is_best_selling ? 1 : 0) - (a.is_best_selling ? 1 : 0);
        default:
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
    });
  };

  // Update URL when filters change
  const updateURL = (newFilters?: Partial<SearchFilters>, newPage?: number) => {
    const updatedFilters = newFilters ? { ...filters, ...newFilters } : filters;
    const page = newPage || currentPage;
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (updatedFilters.category !== 'all') params.set('category', updatedFilters.category);
    if (updatedFilters.minPrice) params.set('min_price', updatedFilters.minPrice);
    if (updatedFilters.maxPrice) params.set('max_price', updatedFilters.maxPrice);
    if (updatedFilters.sortBy !== 'relevance') params.set('sort', updatedFilters.sortBy);
    if (updatedFilters.inStock) params.set('in_stock', 'true');
    if (updatedFilters.rating !== 'all') params.set('rating', updatedFilters.rating);
    if (page > 1) params.set('page', page.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      category: "all",
      minPrice: "",
      maxPrice: "",
      sortBy: "relevance",
      inStock: false,
      rating: "all"
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    updateURL(defaultFilters, 1);
  };

  // Mock search results for demonstration
  const mockResults: SearchResults = searchResults || {
    products: [],
    totalResults: 0,
    totalPages: 0,
    currentPage: 1,
    searchTime: 0.15,
    suggestions: ["কাস্টম মগ প্রিন্ট", "ব্যক্তিগত টি-শার্ট ডিজাইন", "ফটো ফ্রেম গিফট"],
    relatedQueries: ["কাস্টম গিফট", "ব্যক্তিগত উপহার", "বার্থডে গিফট"]
  };

  const processedProducts = processSearchResults(mockResults.products, searchQuery);

  // Get active filter count
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'category') return value !== 'all';
    if (key === 'sortBy') return value !== 'relevance';
    if (key === 'rating') return value !== 'all';
    if (key === 'inStock') return value === true;
    return value && value !== '';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* YouTube-style Search Bar Modal */}
      <YoutubeSearchBar
        isOpen={showSearchBar}
        onClose={() => setShowSearchBar(false)}
        initialQuery={searchQuery}
      />

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowSearchBar(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
              >
                <Search className="w-4 h-4" />
                অনুসন্ধান পরিবর্তন করুন
              </Button>
              
              {searchQuery && (
                <div className="hidden sm:block">
                  <Badge variant="secondary" className="text-sm">
                    "{searchQuery}" এর জন্য {mockResults.totalResults} টি ফলাফল
                    <span className="ml-1 text-xs text-gray-500">
                      ({mockResults.searchTime}s)
                    </span>
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                ফিল্টার
                {activeFilterCount > 0 && (
                  <Badge variant="destructive" className="text-xs min-w-0 px-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search Info */}
          {searchQuery && (
            <div className="sm:hidden mt-2">
              <Badge variant="secondary" className="text-sm">
                "{searchQuery}" এর জন্য {mockResults.totalResults} টি ফলাফল ({mockResults.searchTime}s)
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটেগরি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  <SelectItem value="mugs">মগ</SelectItem>
                  <SelectItem value="t-shirts">টি-শার্ট</SelectItem>
                  <SelectItem value="frames">ফ্রেম</SelectItem>
                  <SelectItem value="keychains">কিচেইন</SelectItem>
                  <SelectItem value="custom-gifts">কাস্টম গিফট</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="সর্বনিম্ন দাম"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                type="number"
              />

              <Input
                placeholder="সর্বোচ্চ দাম"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                type="number"
              />

              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="সর্ট করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">প্রাসঙ্গিকতা</SelectItem>
                  <SelectItem value="price-low">দাম: কম থেকে বেশি</SelectItem>
                  <SelectItem value="price-high">দাম: বেশি থেকে কম</SelectItem>
                  <SelectItem value="newest">নতুন</SelectItem>
                  <SelectItem value="popular">জনপ্রিয়</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="রেটিং" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব রেটিং</SelectItem>
                  <SelectItem value="4+">৪+ স্টার</SelectItem>
                  <SelectItem value="3+">৩+ স্টার</SelectItem>
                  <SelectItem value="2+">২+ স্টার</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={filters.inStock ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('inStock', !filters.inStock)}
                  className="whitespace-nowrap"
                >
                  শুধু স্টকে
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  রিসেট
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* No Search Query State */}
        {!searchQuery && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">কী খুঁজছেন?</h2>
            <p className="text-gray-500 mb-6">অনুসন্ধান শুরু করতে উপরে ক্লিক করুন</p>
            <Button onClick={() => setShowSearchBar(true)} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              অনুসন্ধান করুন
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searchQuery && !isLoading && (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  "{searchQuery}" এর অনুসন্ধান ফলাফল
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {mockResults.searchTime}s
                </div>
              </div>

              {/* Search Suggestions */}
              {mockResults.suggestions && mockResults.suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">আপনি এগুলোও খুঁজতে পারেন:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockResults.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          updateURL(filters, 1);
                        }}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* No Results */}
            {processedProducts.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">কোনো ফলাফল পাওয়া যায়নি</h2>
                <p className="text-gray-500 mb-6">
                  "{searchQuery}" এর জন্য কোনো পণ্য খুঁজে পাওয়া যায়নি
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">পরামর্শ:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• বানানভুল আছে কিনা দেখুন</li>
                    <li>• সহজ শব্দ ব্যবহার করুন</li>
                    <li>• ফিল্টার কমান</li>
                  </ul>
                  <Button variant="outline" onClick={clearFilters}>
                    সব ফিল্টার রিমুভ করুন
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                  {processedProducts.map((product) => (
                    <UnifiedProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {mockResults.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                          updateURL(filters, currentPage - 1);
                        }}
                      >
                        পূর্ববর্তী
                      </Button>
                      
                      {Array.from({ length: Math.min(5, mockResults.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            onClick={() => {
                              setCurrentPage(page);
                              updateURL(filters, page);
                            }}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        disabled={currentPage === mockResults.totalPages}
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                          updateURL(filters, currentPage + 1);
                        }}
                      >
                        পরবর্তী
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Related Queries */}
            {mockResults.relatedQueries && mockResults.relatedQueries.length > 0 && (
              <div className="mt-12 p-6 bg-white rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  সম্পর্কিত অনুসন্ধান
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mockResults.relatedQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(query);
                        setCurrentPage(1);
                        updateURL(filters, 1);
                      }}
                      className="text-sm"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid, List, ChevronDown, Star, Heart, ShoppingCart, Eye, ArrowUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { useCart } from '../hooks/use-cart';
import { formatPrice } from '../lib/utils';
import { toast } from '../hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  stock?: number;
  rating?: number;
  discount?: number;
  tags?: string[];
  is_featured?: boolean;
  created_at?: string;
}

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Wishlist and favorites
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { addItem } = useCart();

  // Categories and tags for filters
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)] as string[];
  }, [products]);

  const allTags = useMemo(() => {
    const tags = products.flatMap(p => p.tags || []);
    return [...new Set(tags)];
  }, [products]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setTotalProducts(data.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(product => product.is_featured);
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter(product => (product.stock || 0) > 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, selectedTags, showFeaturedOnly, inStockOnly]);

  // Update displayed products
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    setCurrentPage(prev => prev + 1);
    setLoadingMore(false);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1
    });
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasMoreProducts = displayedProducts.length < filteredProducts.length;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">প্রোডাক্ট লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">আমাদের প্রোডাক্ট</h1>
          <p className="text-gray-600">
            {filteredProducts.length} টি প্রোডাক্ট পাওয়া গেছে {totalProducts} টির মধ্যে
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">নাম অনুসারে</SelectItem>
                <SelectItem value="price-low">দাম (কম থেকে বেশি)</SelectItem>
                <SelectItem value="price-high">দাম (বেশি থেকে কম)</SelectItem>
                <SelectItem value="rating">রেটিং অনুসারে</SelectItem>
                <SelectItem value="newest">নতুন প্রোডাক্ট</SelectItem>
                <SelectItem value="featured">ফিচার্ড প্রোডাক্ট</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              ফিল্টার
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="font-medium">ক্যাটেগরি</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব ক্যাটেগরি" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব ক্যাটেগরি</SelectItem>
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
                <Label className="font-medium">দামের রেঞ্জ</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <Label className="font-medium">কুইক ফিল্টার</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={showFeaturedOnly}
                      onCheckedChange={setShowFeaturedOnly}
                    />
                    <Label htmlFor="featured" className="text-sm">শুধু ফিচার্ড</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instock"
                      checked={inStockOnly}
                      onCheckedChange={setInStockOnly}
                    />
                    <Label htmlFor="instock" className="text-sm">স্টকে আছে</Label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium">ট্যাগ</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 6).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag)
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
            <p className="text-gray-500">অন্য কিছু খুঁজে দেখুন বা ফিল্টার পরিবর্তন করুন</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  size="lg"
                  className="px-8"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      লোড হচ্ছে...
                    </>
                  ) : (
                    'আরো দেখুন'
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {displayedProducts.length} / {filteredProducts.length} টি প্রোডাক্ট দেখানো হচ্ছে
                </p>
              </div>
            )}
          </>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50"
            size="icon"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}

function ProductCard({ product, viewMode, isWishlisted, onToggleWishlist, onAddToCart }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
  
  const discountedPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Large Image for List View */}
            <div className="relative w-48 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={imageError ? defaultImage : (product.image_url || defaultImage)}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_featured && (
                  <Badge className="bg-yellow-500 text-white text-xs">ফিচার্ড</Badge>
                )}
                {product.discount && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {product.discount}% ছাড়
                  </Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white"
                onClick={onToggleWishlist}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(discountedPrice)}
                    </span>
                    {product.discount && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  {product.stock !== undefined && (
                    <p className="text-xs text-gray-500">
                      স্টক: {product.stock > 0 ? `${product.stock} টি` : 'শেষ'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    দেখুন
                  </Button>
                  <Button
                    onClick={onAddToCart}
                    disabled={product.stock === 0}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    কার্ট
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-white border-gray-200 hover:border-blue-200">
      <CardContent className="p-0">
        {/* Larger Image for Grid View */}
        <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden bg-gray-100">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageError ? defaultImage : (product.image_url || defaultImage)}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-yellow-500 text-white text-xs">ফিচার্ড</Badge>
            )}
            {product.discount && (
              <Badge className="bg-red-500 text-white text-xs">
                {product.discount}% ছাড়
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onToggleWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              দেখুন
            </Button>
            <Button
              onClick={onAddToCart}
              disabled={product.stock === 0}
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              কার্ট
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs text-gray-500 mt-1">{product.category}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(discountedPrice)}
                </span>
                {product.discount && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                </div>
              )}
            </div>
          </div>

          {product.stock !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `স্টক: ${product.stock} টি` : 'স্টক শেষ'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

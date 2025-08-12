import { useState, useEffect, memo, useCallback, Suspense, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import EnhancedCustomizeModal from "@/components/enhanced-customize-modal";
import CustomOrderCheckout from "@/components/custom-order-checkout";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { 
  ArrowRight,
  Star, 
  Zap, 
  Award,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Gift,
  Sparkles,
  TrendingUp,
  Package,
  Heart,
  ShoppingBag,
  Users,
  Clock,
  Shield,
  Truck,
  PhoneCall,
  MessageCircle,
  Eye,
  ShoppingCart,
  Flame,
  Crown,
  Percent,
  X
} from "lucide-react";
import { formatPrice, createWhatsAppUrl, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product, Offer } from "@shared/schema";

// Enhanced Product Card with animations
const EnhancedProductCard = memo(function EnhancedProductCard({ 
  product, 
  onViewProduct, 
  onAddToCart, 
  onCustomize,
  index 
}: {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const hasDiscount = false; // Discount feature not implemented yet
  const discountedPrice = price;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="group relative"
    >
      <Card 
        className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/95 backdrop-blur-sm cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewProduct(product)}
        data-testid={`card-product-${product.id}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Discount Badge */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className="absolute top-3 left-3 z-10"
            >
              <Badge className="bg-red-500 text-white font-bold shadow-lg">
                <Percent className="w-3 h-3 mr-1" />
                ছাড়
              </Badge>
            </motion.div>
          )}

          {/* Trending Badge */}
          {product.is_featured && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="absolute top-3 right-3 z-10"
            >
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg">
                <Flame className="w-3 h-3 mr-1" />
                ট্রেন্ডিং
              </Badge>
            </motion.div>
          )}

          {/* Product Image */}
          <div className="relative w-full h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            )}
            <img
              src={product.image_url || "/api/placeholder/400/500"}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 left-4 right-4 flex gap-2"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProduct(product);
                  }}
                  data-testid={`button-view-${product.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  দেখুন
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  data-testid={`button-add-cart-${product.id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  কার্ট
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-70'
            } ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Product Info */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Category */}
            <Badge variant="outline" className="text-xs">
              {product.category || 'গিফট'}
            </Badge>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {hasDiscount ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">
                  5.0
                </span>
              </div>
            </div>

            {/* Customize Button */}
            {onCustomize && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed border-primary text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(product);
                }}
                data-testid={`button-customize-${product.id}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                কাস্টমাইজ করুন
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Enhanced Hero Section
const DynamicHeroSection = memo(function DynamicHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "আপনার পছন্দের গিফট শপ",
      subtitle: "বিশেষ মুহূর্তগুলোকে করুন আরও মধুর",
      description: "৫০০+ পণ্য • দ্রুত ডেলিভারি • কাস্টমাইজেশন",
      cta: "কেনাকাটা শুরু করুন",
      bg: "from-purple-600 via-pink-600 to-red-600"
    },
    {
      title: "কাস্টমাইজড গিফট সল্যুশন",
      subtitle: "আপনার কল্পনাকে বাস্তব করুন",
      description: "ফটো প্রিন্ট • নাম লেখা • ইউনিক ডিজাইন",
      cta: "কাস্টম অর্ডার",
      bg: "from-blue-600 via-cyan-600 to-teal-600"
    },
    {
      title: "সারাদেশে দ্রুত ডেলিভারি",
      subtitle: "১-৩ দিনে পৌঁছে যাবে আপনার কাছে",
      description: "নিরাপদ প্যাকেজিং • ট্র্যাকিং সুবিধা • রিটার্ন পলিসি",
      cta: "অর্ডার করুন",
      bg: "from-emerald-600 via-green-600 to-lime-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden rounded-3xl mx-4 lg:mx-8 my-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].bg}`}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full animate-pulse" />
            <div className="absolute top-1/3 -right-10 w-60 h-60 bg-white rounded-full animate-pulse delay-1000" />
            <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-white rounded-full animate-pulse delay-2000" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center text-white p-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl"
            >
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              
              <motion.h2 
                className="text-xl md:text-2xl lg:text-3xl mb-4 font-medium"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {heroSlides[currentSlide].subtitle}
              </motion.h2>
              
              <motion.p 
                className="text-lg md:text-xl mb-8 opacity-90"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {heroSlides[currentSlide].description}
              </motion.p>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg shadow-2xl transform transition-all duration-300 hover:scale-105"
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

// Enhanced Features Section
const DynamicFeaturesSection = memo(function DynamicFeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "১০০% অরিজিনাল",
      description: "সকল পণ্যের মান নিশ্চয়তা",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Truck,
      title: "দ্রুত ডেলিভারি",
      description: "১-৩ দিনে সারাদেশে পৌঁছে দেওয়া",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: PhoneCall,
      title: "২৪/৭ সাপোর্ট",
      description: "যেকোনো সময় যোগাযোগ করুন",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "কাস্টমাইজেশন",
      description: "আপনার পছন্দ অনুযায়ী ডিজাইন",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            কেন আমাদের বেছে নিবেন?
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            আমরা দিচ্ছি সেরা সেবা এবং মানসম্পন্ন পণ্য যা আপনার প্রত্যাশার চেয়েও বেশি
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <motion.div 
                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Product Search and Filter Component
const SearchAndFilter = memo(function SearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/50 py-4 px-4 lg:px-8"
    >
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-primary rounded-xl bg-white shadow-sm"
              data-testid="input-search"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden border-2 border-gray-200 rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            ফিল্টার
          </Button>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none"
              data-testid="select-category"
            >
              <option value="">সব ক্যাটেগরি</option>
              {PRODUCT_CATEGORIES.slice(1).map(category => (
                <option key={category.id} value={category.id}>
                  {category.bengaliName}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none"
              data-testid="select-sort"
            >
              <option value="">সাজান</option>
              <option value="price-low">দাম: কম থেকে বেশি</option>
              <option value="price-high">দাম: বেশি থেকে কম</option>
              <option value="name">নাম অনুযায়ী</option>
              <option value="rating">রেটিং অনুযায়ী</option>
            </select>
          </div>
        </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 p-4 bg-gray-50 rounded-xl space-y-3"
            >
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none"
              >
                <option value="">সব ক্যাটেগরি</option>
                {PRODUCT_CATEGORIES.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.bengaliName}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none"
              >
                <option value="">সাজান</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
                <option value="name">নাম অনুযায়ী</option>
                <option value="rating">রেটিং অনুযায়ী</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Loading Skeletons
const ProductCardSkeleton = memo(function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse border-0 shadow-lg">
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-8 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
});

// Main Component
export default function HomeUltraEnhanced() {
  const [location, navigate] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [showCustomCheckout, setShowCustomCheckout] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasScrolled, setHasScrolled] = useState(false);

  const { toast } = useToast();
  const { addToCart } = useCart();

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Filter and sort products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a: Product, b: Product) => {
    switch (sortBy) {
      case 'price-low':
        return (typeof a.price === 'string' ? parseFloat(a.price) : a.price) - 
               (typeof b.price === 'string' ? parseFloat(b.price) : b.price);
      case 'price-high':
        return (typeof b.price === 'string' ? parseFloat(b.price) : b.price) - 
               (typeof a.price === 'string' ? parseFloat(a.price) : a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return 0; // Rating sorting not available yet
      default:
        return 0;
    }
  });

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Event handlers
  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} আপনার কার্টে যোগ হয়েছে`,
    });
  }, [addToCart, toast]);

  const handleCustomize = useCallback((product: Product) => {
    setCustomizeProduct(product);
  }, []);

  return (
    <UltraSimpleLayout>
      {/* Enhanced Hero Section */}
      <DynamicHeroSection />

      {/* Features Section */}
      <DynamicFeaturesSection />

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Products Section */}
      <section className="py-12 px-4 lg:px-8 min-h-screen">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              আমাদের পণ্য সমূহ
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে আপনার পছন্দের জন্য
            </p>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
                layout
              >
                {paginatedProducts.map((product: Product, index: number) => (
                  <EnhancedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onViewProduct={handleViewProduct}
                    onAddToCart={handleAddToCart}
                    onCustomize={handleCustomize}
                  />
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center items-center gap-2 mt-12"
                >
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="rounded-xl min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-6">অন্য কিছু খুঁজে দেখুন অথবা ফিল্টার পরিবর্তন করুন</p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSortBy("");
                }}
                className="rounded-xl"
              >
                সব পণ্য দেখুন
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modals */}
      <UltraDynamicProductModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onCustomize={handleCustomize}
      />

      <EnhancedCustomizeModal
        isOpen={!!customizeProduct}
        onClose={() => setCustomizeProduct(null)}
        product={customizeProduct}
        onAddToCart={async (customProduct, customization) => {
          addToCart({ ...customProduct, quantity: 1 });
          setCustomizeProduct(null);
          setShowCustomCheckout(true);
        }}
      />

      <CustomOrderCheckout
        isOpen={showCustomCheckout}
        onClose={() => setShowCustomCheckout(false)}
      />
    </UltraSimpleLayout>
  );
}
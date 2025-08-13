import { useState, useEffect, memo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import CleanProductCard from "@/components/clean-product-card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { 
  ArrowRight,
  Star, 
  Search,
  ChevronLeft,
  ChevronRight,
  Gift,
  Sparkles,
  Heart,
  ShoppingCart,
  Flame,
  Eye,
  Shield,
  Truck,
  PhoneCall,
  Package,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react";
import { formatPrice, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@shared/schema";

// Compact Hero Section
const CompactHeroSection = memo(function CompactHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "বিশেষ গিফট কালেকশন",
      subtitle: "আপনার প্রিয়জনের জন্য নিখুঁত উপহার",
      cta: "শপিং শুরু করুন",
      bg: "from-gradient-start to-gradient-end",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "ট্রেন্ডিং পণ্য",
      subtitle: "সবচেয়ে জনপ্রিয় আইটেম এখানে",
      cta: "এখনই দেখুন",
      bg: "from-blue-600 to-purple-600",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "দ্রুত ডেলিভারি",
      subtitle: "সারাদেশে ১-৩ দিনে পৌঁছে দিই",
      cta: "অর্ডার করুন",
      bg: "from-green-600 to-teal-600",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].bg}`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url("${heroSlides[currentSlide].image}")` }}
          />
          
          <div className="relative h-full flex items-center justify-center px-4 sm:px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center text-white max-w-4xl mx-auto"
            >
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Button 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base shadow-xl transform transition-all duration-300 hover:scale-105"
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
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

// Compact Features Section
const CompactFeaturesSection = memo(function CompactFeaturesSection() {
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
      description: "১-৩ দিনে সারাদেশে",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: PhoneCall,
      title: "২৪/৭ সাপোর্ট",
      description: "যেকোনো সময় যোগাযোগ",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "সেরা সেবা",
      description: "গ্রাহক সন্তুষ্টি আমাদের অগ্রাধিকার",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-6 sm:py-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            কেন আমাদের বেছে নিবেন?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
            আমরা দিচ্ছি সেরা সেবা এবং মানসম্পন্ন পণ্য
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Card className="text-center border shadow-sm hover:shadow-md transition-all duration-200 bg-white h-full">
                <CardContent className="p-4 sm:p-5">
                  <motion.div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Search and Filter Component
const CompactSearchAndFilter = memo(function CompactSearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-16 z-30 bg-white border-b border-gray-200 py-3 px-2 sm:px-4 shadow-sm"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Search Bar */}
        <div className="flex items-center gap-2 mb-3 sm:mb-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 focus:border-primary rounded-lg bg-white shadow-sm text-sm"
              data-testid="input-search"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="w-8 h-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="w-8 h-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-300 rounded-lg px-3 h-9"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline text-sm">ফিল্টার</span>
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
              data-testid="select-category"
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
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
              data-testid="select-sort"
            >
              <option value="">সাজান</option>
              <option value="price-low">দাম: কম থেকে বেশি</option>
              <option value="price-high">দাম: বেশি থেকে কম</option>
              <option value="name">নাম অনুযায়ী</option>
            </select>
          </div>
        </div>

        {/* Mobile/Tablet Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-3 p-3 bg-gray-50 rounded-lg space-y-3"
            >
              {/* View Mode Toggle for Mobile */}
              <div className="flex sm:hidden items-center justify-center gap-1 bg-white rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="flex-1 text-xs"
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  গ্রিড
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="flex-1 text-xs"
                >
                  <List className="w-4 h-4 mr-1" />
                  তালিকা
                </Button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
              >
                <option value="">সাজান</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
                <option value="name">নাম অনুযায়ী</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Loading Skeleton
const ProductSkeleton = memo(function ProductSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden animate-pulse border shadow-sm">
        <div className="flex flex-row p-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 ml-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-pulse border shadow-sm">
      <div className="aspect-square bg-gray-200" />
      <CardContent className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </CardContent>
    </Card>
  );
});

// Main Component
export default function HomeCleanSimple() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { toast } = useToast();
  const { addToCart } = useCart();

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
      default:
        return 0;
    }
  });

  // Professional pagination
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 12;
    return viewMode === "list" ? 10 : (window.innerWidth < 640 ? 8 : window.innerWidth < 1024 ? 12 : 18);
  };
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Event handlers
  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleCustomize = useCallback((product: Product) => {
    // For now, just show a toast - later this can open a customization modal
    toast({
      title: "কাস্টমাইজেশন",
      description: `${product.name} কাস্টমাইজ করার জন্য পণ্যের পেজে যান`,
    });
  }, [toast]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, viewMode]);

  return (
    <UltraSimpleLayout>
      {/* Compact Hero Section */}
      <CompactHeroSection />

      {/* Compact Features Section */}
      <CompactFeaturesSection />

      {/* Search and Filter */}
      <CompactSearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Products Section */}
      <section className="py-4 sm:py-6 px-2 sm:px-4 min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-6"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              আমাদের পণ্য সমূহ
            </h2>
            <p className="text-gray-600 text-sm max-w-xl mx-auto">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে আপনার জন্য
            </p>
          </motion.div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div className={`${
              viewMode === "list" 
                ? "space-y-3" 
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
            }`}>
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <ProductSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <motion.div 
                className={`${
                  viewMode === "list" 
                    ? "space-y-3" 
                    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                }`}
                layout
              >
                {paginatedProducts.map((product: Product, index: number) => (
                  <CleanProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode}
                    onViewDetails={handleViewProduct}
                    onCustomize={handleCustomize}
                  />
                ))}
              </motion.div>

              {/* Professional Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center items-center gap-2 mt-8 px-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="rounded-lg h-9 w-9 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    const page = index + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="rounded-lg h-9 min-w-[36px] text-sm"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="rounded-lg h-9 w-9 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12 px-4"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-4 text-sm">অন্য কিছু খুঁজে দেখুন অথবা ফিল্টার পরিবর্তন করুন</p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSortBy("");
                }}
                className="rounded-lg"
              >
                সব পণ্য দেখুন
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Product Detail Modal - WITH CUSTOMIZE FEATURES */}
      <UltraDynamicProductModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onCustomize={handleCustomize}
      />
    </UltraSimpleLayout>
  );
}
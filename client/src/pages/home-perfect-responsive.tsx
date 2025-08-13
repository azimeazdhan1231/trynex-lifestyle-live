import { useState, useEffect, memo, useCallback, Suspense, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import UltraProfessionalCustomizeModal from "@/components/ultra-professional-customize-modal";
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
  X,
  Menu,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react";
import { formatPrice, createWhatsAppUrl, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@shared/schema";

// 3D Animated Background Component (Disabled for now)
const AnimatedBackground3D = memo(function AnimatedBackground3D() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Temporary gradient background instead of 3D */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
      {/* <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1, 64, 64]} position={[-2, 0, 0]}>
            <MeshDistortMaterial
              color="#667eea"
              attach="material"
              distort={0.3}
              speed={2}
              roughness={0.4}
            />
          </Sphere>
        </Float>
        <Float speed={2} rotationIntensity={2} floatIntensity={1}>
          <Sphere args={[0.8, 64, 64]} position={[2, 1, 0]}>
            <MeshDistortMaterial
              color="#f093fb"
              attach="material"
              distort={0.4}
              speed={3}
              roughness={0.2}
            />
          </Sphere>
        </Float>
        <Float speed={1} rotationIntensity={0.5} floatIntensity={3}>
          <Sphere args={[0.6, 64, 64]} position={[0, -2, 0]}>
            <MeshDistortMaterial
              color="#4facfe"
              attach="material"
              distort={0.2}
              speed={1.5}
              roughness={0.6}
            />
          </Sphere>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas> */}
    </div>
  );
});

// Mobile-Optimized Product Card
const MobileOptimizedProductCard = memo(function MobileOptimizedProductCard({ 
  product, 
  onViewProduct, 
  onAddToCart, 
  onCustomize,
  index,
  viewMode = "grid"
}: {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  index: number;
  viewMode?: "grid" | "list";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="w-full"
      >
        <Card 
          className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm cursor-pointer mb-3"
          onClick={() => onViewProduct(product)}
          data-testid={`card-product-${product.id}`}
        >
          <div className="flex flex-row p-3 sm:p-4">
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              )}
              <img
                src={product.image_url || "/api/placeholder/120/120"}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {product.is_featured && (
                <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5">
                  ট্রেন্ডিং
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 ml-3 sm:ml-4 flex flex-col justify-between min-h-[80px]">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 leading-tight mb-1">
                  {product.name}
                </h3>
                <Badge variant="outline" className="text-xs mb-2">
                  {product.category || 'গিফট'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(price)}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavorite(!isFavorite);
                    }}
                  >
                    <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    কার্ট
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group relative w-full"
    >
      <Card 
        className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewProduct(product)}
        data-testid={`card-product-${product.id}`}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Badges */}
          {product.is_featured && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
              className="absolute top-2 right-2 z-10"
            >
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xs shadow-lg">
                <Flame className="w-2 h-2 mr-1" />
                ট্রেন্ডিং
              </Badge>
            </motion.div>
          )}

          {/* Product Image */}
          <div className="relative w-full h-full">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            )}
            <img
              src={product.image_url || "/api/placeholder/300/300"}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-2 left-2 right-2 flex gap-1"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 shadow-md text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProduct(product);
                  }}
                  data-testid={`button-view-${product.id}`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  দেখুন
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  data-testid={`button-add-cart-${product.id}`}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  কার্ট
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
            } shadow-md`}
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Product Info */}
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Category */}
            <Badge variant="outline" className="text-xs">
              {product.category || 'গিফট'}
            </Badge>

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-primary">
                {formatPrice(price)}
              </span>
              
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">5.0</span>
              </div>
            </div>

            {/* Customize Button */}
            {onCustomize && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed border-primary text-primary hover:bg-primary/10 text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(product);
                }}
                data-testid={`button-customize-${product.id}`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                কাস্টমাইজ করুন
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Interactive Hero Section with 3D Elements
const Interactive3DHeroSection = memo(function Interactive3DHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  
  const heroSlides = [
    {
      title: "আপনার পছন্দের গিফট শপ",
      subtitle: "বিশেষ মুহূর্তগুলোকে করুন আরও মধুর",
      description: "৫০০+ পণ্য • দ্রুত ডেলিভারি • কাস্টমাইজেশন",
      cta: "কেনাকাটা শুরু করুন",
      gradient: "from-indigo-600 via-purple-600 to-pink-600"
    },
    {
      title: "কাস্টমাইজড গিফট সল্যুশন",
      subtitle: "আপনার কল্পনাকে বাস্তব করুন",
      description: "ফটো প্রিন্ট • নাম লেখা • ইউনিক ডিজাইন",
      cta: "কাস্টম অর্ডার",
      gradient: "from-cyan-500 via-blue-600 to-indigo-600"
    },
    {
      title: "সারাদেশে দ্রুত ডেলিভারি",
      subtitle: "১-৩ দিনে পৌঁছে যাবে আপনার কাছে",
      description: "নিরাপদ প্যাকেজিং • ট্র্যাকিং সুবিধা • রিটার্ন পলিসি",
      cta: "অর্ডার করুন",
      gradient: "from-emerald-500 via-teal-600 to-cyan-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      style={{ y }}
      className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] overflow-hidden rounded-2xl mx-2 sm:mx-4 lg:mx-8 my-4 sm:my-6 lg:my-8"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2 }}
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient}`}
        >
          {/* 3D Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <Canvas camera={{ position: [0, 0, 8] }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} />
              <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                <Sphere args={[0.8, 32, 32]} position={[-3, 1, 0]}>
                  <MeshDistortMaterial
                    color="white"
                    attach="material"
                    distort={0.2}
                    speed={1.5}
                  />
                </Sphere>
              </Float>
              <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <Sphere args={[0.6, 32, 32]} position={[3, -1, 0]}>
                  <MeshDistortMaterial
                    color="white"
                    attach="material"
                    distort={0.3}
                    speed={2}
                  />
                </Sphere>
              </Float>
            </Canvas>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center text-white p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h1 
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              
              <motion.h2 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 font-medium opacity-95"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {heroSlides[currentSlide].subtitle}
              </motion.h2>
              
              <motion.p 
                className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto"
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
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-base lg:text-lg shadow-2xl transform transition-all duration-300 hover:scale-105"
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {heroSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});

// Mobile-Optimized Features Section
const MobileOptimizedFeaturesSection = memo(function MobileOptimizedFeaturesSection() {
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
      title: "কাস্টমাইজেশন",
      description: "আপনার পছন্দ অনুযায়ী",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-20 px-2 sm:px-4 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent leading-tight">
            কেন আমাদের বেছে নিবেন?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-xl max-w-2xl mx-auto px-4">
            আমরা দিচ্ছি সেরা সেবা এবং মানসম্পন্ন পণ্য
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="group"
            >
              <Card className="text-center border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 bg-white h-full">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <motion.div 
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-600 group-hover:text-primary transition-colors duration-300`} />
                  </motion.div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base lg:text-lg leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
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

// Enhanced Mobile Search and Filter
const MobileSearchAndFilter = memo(function MobileSearchAndFilter({
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
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/50 py-3 sm:py-4 px-2 sm:px-4 lg:px-8 shadow-sm"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-gray-200 focus:border-primary rounded-xl bg-white shadow-sm text-sm sm:text-base"
              data-testid="input-search"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
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
            className="border-2 border-gray-200 rounded-xl px-3 sm:px-4 h-9 sm:h-10"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">ফিল্টার</span>
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none text-sm"
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
              className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none text-sm"
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
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-3 p-3 sm:p-4 bg-gray-50 rounded-xl space-y-3"
            >
              {/* View Mode Toggle for Mobile */}
              <div className="flex sm:hidden items-center justify-center gap-1 bg-white rounded-lg p-1">
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none text-sm"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none text-sm"
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
const MobileProductSkeleton = memo(function MobileProductSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden animate-pulse border-0 shadow-md mb-3">
        <div className="flex flex-row p-3 sm:p-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 ml-3 sm:ml-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-pulse border-0 shadow-md">
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
export default function HomePerfectResponsive() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [showCustomCheckout, setShowCustomCheckout] = useState(false);
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
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
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

  // Responsive pagination
  const itemsPerPage = viewMode === "list" ? 8 : (window.innerWidth < 640 ? 6 : window.innerWidth < 1024 ? 9 : 12);
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
    addToCart({ 
      ...product, 
      quantity: 1,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image_url: product.image_url || undefined
    });
    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} আপনার কার্টে যোগ হয়েছে`,
    });
  }, [addToCart, toast]);

  const handleCustomize = useCallback((product: Product) => {
    setCustomizeProduct(product);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, viewMode]);

  return (
    <UltraSimpleLayout>
      {/* 3D Background */}
      <AnimatedBackground3D />

      {/* Interactive Hero Section */}
      <Interactive3DHeroSection />

      {/* Features Section */}
      <MobileOptimizedFeaturesSection />

      {/* Search and Filter */}
      <MobileSearchAndFilter
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
      <section className="py-6 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-8 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 lg:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              আমাদের পণ্য সমূহ
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-xl max-w-2xl mx-auto px-4">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে আপনার পছন্দের জন্য
            </p>
          </motion.div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div className={`${
              viewMode === "list" 
                ? "space-y-3" 
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
            }`}>
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <MobileProductSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <motion.div 
                className={`${
                  viewMode === "list" 
                    ? "space-y-3" 
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
                }`}
                layout
              >
                {paginatedProducts.map((product: Product, index: number) => (
                  <MobileOptimizedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                    onViewProduct={handleViewProduct}
                    onAddToCart={handleAddToCart}
                    onCustomize={handleCustomize}
                  />
                ))}
              </motion.div>

              {/* Mobile-Optimized Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center items-center gap-2 mt-8 sm:mt-12 px-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="rounded-xl h-10 w-10 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Show fewer pages on mobile */}
                  {Array.from({ 
                    length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) 
                  }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="rounded-xl h-10 min-w-[40px] text-sm"
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
                    className="rounded-xl h-10 w-10 p-0"
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
              className="text-center py-12 sm:py-16 px-4"
            >
              <Package className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">অন্য কিছু খুঁজে দেখুন অথবা ফিল্টার পরিবর্তন করুন</p>
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

      {customizeProduct && (
        <UltraProfessionalCustomizeModal
          isOpen={!!customizeProduct}
          onClose={() => setCustomizeProduct(null)}
          product={customizeProduct}
        onAddToCart={async (customProduct: any, customization: any) => {
          addToCart({ 
            ...customProduct, 
            quantity: 1,
            price: typeof customProduct.price === 'string' ? parseFloat(customProduct.price) : customProduct.price,
            customization
          });
          setCustomizeProduct(null);
          toast({
            title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!",
            description: `${customProduct.name} আপনার পছন্দমতো কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
          });
        }}
        onDirectOrder={async (customProduct: any, customization: any) => {
          // Handle direct order functionality
          setCustomizeProduct(null);
          setShowCustomCheckout(true);
        }}
        />
      )}

      <CustomOrderCheckout
        isOpen={showCustomCheckout}
        onClose={() => setShowCustomCheckout(false)}
      />
    </UltraSimpleLayout>
  );
}
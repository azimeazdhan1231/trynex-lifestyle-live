import { useState, useEffect, memo, useCallback, Suspense, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
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
  X,
  Menu,
  Grid3X3,
  List,
  SlidersHorizontal,
  Layers3,
  Cpu,
  Smartphone
} from "lucide-react";
import { formatPrice, createWhatsAppUrl, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@shared/schema";

// CSS 3D Background Component
const CSS3DBackground = memo(function CSS3DBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Floating 3D Shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl transform rotate-45 animate-float shadow-2xl" 
             style={{ 
               transformStyle: 'preserve-3d',
               animation: 'float 6s ease-in-out infinite, rotate3d 20s linear infinite' 
             }} />
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-gradient-to-br from-pink-400 to-red-600 rounded-full animate-bounce shadow-xl" 
             style={{ 
               transformStyle: 'preserve-3d',
               animation: 'float 8s ease-in-out infinite reverse, pulse-glow 3s ease-in-out infinite' 
             }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400 to-teal-600 rounded-2xl transform -rotate-12 animate-pulse shadow-2xl" 
             style={{ 
               transformStyle: 'preserve-3d',
               animation: 'float 10s ease-in-out infinite, rotate3d 15s linear infinite reverse' 
             }} />
        <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full animate-ping shadow-xl" 
             style={{ 
               transformStyle: 'preserve-3d',
               animation: 'float 7s ease-in-out infinite, bounce 2s infinite' 
             }} />
      </div>
      
      {/* Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `
               linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
               linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px',
             animation: 'grid-move 20s linear infinite'
           }} />
    </div>
  );
});

// Ultra-Mobile Optimized Product Card
const UltraMobileProductCard = memo(function UltraMobileProductCard({ 
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
  const cardRef = useRef<HTMLDivElement>(null);

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-scale');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (viewMode === "list") {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.03 }}
        className="w-full mobile-optimized"
      >
        <Card 
          className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-sm cursor-pointer mb-2 card-hover"
          onClick={() => onViewProduct(product)}
          data-testid={`card-product-${product.id}`}
        >
          <div className="flex flex-row p-2 sm:p-3">
            {/* Image */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 skeleton" />
              )}
              <img
                src={product.image_url || "/api/placeholder/96/96"}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                } ${isHovered ? 'scale-105' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {product.is_featured && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full border-2 border-white">
                  <Flame className="w-2 h-2" />
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 ml-2 sm:ml-3 flex flex-col justify-between min-h-[64px] sm:min-h-[80px]">
              <div>
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-tight mb-1">
                  {product.name}
                </h3>
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  {product.category || 'গিফট'}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-primary">
                    {formatPrice(price)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">5.0</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavorite(!isFavorite);
                    }}
                  >
                    <Heart className={`w-2 h-2 sm:w-3 sm:h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 sm:h-7 px-2 sm:px-3 text-xs rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
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
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.03,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -3,
        transition: { duration: 0.2 }
      }}
      className="group relative w-full mobile-optimized gpu-accelerated"
    >
      <Card 
        className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm cursor-pointer h-full card-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewProduct(product)}
        data-testid={`card-product-${product.id}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Featured Badge */}
          {product.is_featured && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 + 0.1 }}
              className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10"
            >
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xs shadow-lg rounded-full px-1 sm:px-2 py-0.5 sm:py-1 border-2 border-white">
                <Flame className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">ট্রেন্ডিং</span>
              </Badge>
            </motion.div>
          )}

          {/* Product Image */}
          <div className="relative w-full h-full">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 skeleton" />
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
            
            {/* Image Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>

          {/* Quick Actions - Show on larger screens only */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 hidden sm:flex gap-1"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 shadow-md text-xs h-7"
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md text-xs h-7"
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
            className={`absolute top-1 sm:top-2 left-1 sm:left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isFavorite ? 'bg-red-500 text-white scale-110' : 'bg-white/80 text-gray-600'
            } shadow-md border border-white`}
          >
            <Heart className={`w-2 h-2 sm:w-3 sm:h-3 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Product Info */}
        <CardContent className="p-2 sm:p-3">
          <div className="space-y-1 sm:space-y-2">
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-xs sm:text-sm leading-tight min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Category */}
            <Badge variant="outline" className="text-xs px-1 py-0.5">
              {product.category || 'গিফট'}
            </Badge>

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-primary">
                {formatPrice(price)}
              </span>
              
              <div className="flex items-center gap-1">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">5.0</span>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden gap-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProduct(product);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                দেখুন
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                কার্ট
              </Button>
            </div>

            {/* Customize Button */}
            {onCustomize && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed border-primary text-primary hover:bg-primary/10 text-xs h-6 sm:h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(product);
                }}
                data-testid={`button-customize-${product.id}`}
              >
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                কাস্টমাইজ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Interactive Hero Section with CSS 3D Effects
const Interactive3DHeroSection = memo(function Interactive3DHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  
  const heroSlides = [
    {
      title: "আপনার পছন্দের গিফট শপ",
      subtitle: "বিশেষ মুহূর্তগুলোকে করুন আরও মধুর",
      description: "৫০০+ পণ্য • দ্রুত ডেলিভারি • কাস্টমাইজেশন",
      cta: "কেনাকাটা শুরু করুন",
      gradient: "from-indigo-600 via-purple-600 to-pink-600",
      icon: Gift
    },
    {
      title: "কাস্টমাইজড গিফট সল্যুশন",
      subtitle: "আপনার কল্পনাকে বাস্তব করুন",
      description: "ফটো প্রিন্ট • নাম লেখা • ইউনিক ডিজাইন",
      cta: "কাস্টম অর্ডার",
      gradient: "from-cyan-500 via-blue-600 to-indigo-600",
      icon: Sparkles
    },
    {
      title: "সারাদেশে দ্রুত ডেলিভারি",
      subtitle: "১-৩ দিনে পৌঁছে যাবে আপনার কাছে",
      description: "নিরাপদ প্যাকেজিং • ট্র্যাকিং সুবিধা • রিটার্ন পলিসি",
      cta: "অর্ডার করুন",
      gradient: "from-emerald-500 via-teal-600 to-cyan-600",
      icon: Truck
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      style={{ y, opacity }}
      className="relative min-h-[40vh] sm:min-h-[50vh] lg:min-h-[60vh] overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl mx-1 sm:mx-2 lg:mx-4 xl:mx-8 my-2 sm:my-4 lg:my-8"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} relative`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Floating 3D Icon */}
          <div className="absolute top-1/4 right-4 sm:right-8 lg:right-16 opacity-20">
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                rotateX: [0, 15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="text-white"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {(() => {
                const IconComponent = heroSlides[currentSlide].icon;
                return <IconComponent className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32" />;
              })()}
            </motion.div>
          </div>

          {/* Geometric Shapes */}
          <div className="absolute inset-0 opacity-10">
            <motion.div 
              className="absolute top-10 left-10 w-20 h-20 bg-white rounded-xl"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ transformStyle: 'preserve-3d' }}
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full"
              animate={{ 
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center text-white p-3 sm:p-4 lg:p-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h1 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 lg:mb-6 leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              
              <motion.h2 
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-2 sm:mb-3 lg:mb-4 font-medium opacity-95"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {heroSlides[currentSlide].subtitle}
              </motion.h2>
              
              <motion.p 
                className="text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-6 lg:mb-8 opacity-90 max-w-2xl mx-auto px-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {heroSlides[currentSlide].description}
              </motion.p>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 rounded-full text-xs sm:text-sm lg:text-base shadow-2xl transform transition-all duration-300 hover:scale-105 btn-gradient"
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-2 sm:bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
            {heroSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
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

// Ultra-Mobile Features Section
const UltraMobileFeaturesSection = memo(function UltraMobileFeaturesSection() {
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
    <section className="py-6 sm:py-8 lg:py-12 xl:py-16 px-1 sm:px-2 lg:px-4 xl:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent leading-tight px-2">
            কেন আমাদের বেছে নিবেন?
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto px-4">
            আমরা দিচ্ছি সেরা সেবা এবং মানসম্পন্ন পণ্য
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -2 }}
              className="group mobile-optimized"
            >
              <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm h-full card-hover">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <motion.div 
                    className={`w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <feature.icon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
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

// Ultra-Mobile Search and Filter
const UltraMobileSearchAndFilter = memo(function UltraMobileSearchAndFilter({
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/50 py-2 sm:py-3 px-1 sm:px-2 lg:px-4 shadow-sm mobile-optimized"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Search Bar */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <Input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-200 focus:border-primary rounded-lg sm:rounded-xl bg-white shadow-sm text-sm"
              data-testid="input-search"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="w-7 h-7 p-0 rounded-md"
            >
              <Grid3X3 className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="w-7 h-7 p-0 rounded-md"
            >
              <List className="w-3 h-3" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-200 rounded-lg px-2 sm:px-3 h-8 sm:h-9 text-xs"
          >
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline text-xs">ফিল্টার</span>
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
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
              className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
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
              className="lg:hidden mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg space-y-2"
            >
              {/* View Mode Toggle for Mobile */}
              <div className="flex sm:hidden items-center justify-center gap-0.5 bg-white rounded-lg p-0.5">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="flex-1 text-xs h-7"
                >
                  <Grid3X3 className="w-3 h-3 mr-1" />
                  গ্রিড
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="flex-1 text-xs h-7"
                >
                  <List className="w-3 h-3 mr-1" />
                  তালিকা
                </Button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
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
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-white focus:border-primary focus:outline-none text-sm"
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
const UltraMobileProductSkeleton = memo(function UltraMobileProductSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden animate-pulse border-0 shadow-sm mb-2">
        <div className="flex flex-row p-2 sm:p-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 skeleton rounded-lg flex-shrink-0" />
          <div className="flex-1 ml-2 sm:ml-3 space-y-1 sm:space-y-2">
            <div className="h-3 skeleton rounded w-3/4" />
            <div className="h-2 skeleton rounded w-1/2" />
            <div className="h-3 skeleton rounded w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-pulse border-0 shadow-sm">
      <div className="aspect-square skeleton" />
      <CardContent className="p-2 sm:p-3 space-y-1 sm:space-y-2">
        <div className="h-3 skeleton rounded w-3/4" />
        <div className="h-2 skeleton rounded w-1/2" />
        <div className="h-3 skeleton rounded w-2/3" />
      </CardContent>
    </Card>
  );
});

// Main Component
export default function HomeUltraMobileResponsive() {
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

  // Ultra-responsive pagination
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 12;
    const width = window.innerWidth;
    if (viewMode === "list") return width < 640 ? 8 : 10;
    if (width < 480) return 6;
    if (width < 768) return 8;
    if (width < 1024) return 12;
    if (width < 1440) return 18;
    return 24;
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

  const handleAddToCart = useCallback((product: Product) => {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    addToCart({ ...product, price, quantity: 1 });
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
      {/* CSS 3D Background */}
      <CSS3DBackground />

      {/* Interactive Hero Section */}
      <Interactive3DHeroSection />

      {/* Features Section */}
      <UltraMobileFeaturesSection />

      {/* Search and Filter */}
      <UltraMobileSearchAndFilter
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
      <section className="py-4 sm:py-6 lg:py-8 px-1 sm:px-2 lg:px-4 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-6 lg:mb-8"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 lg:mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent px-2">
              আমাদের পণ্য সমূহ
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto px-4">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে আপনার জন্য
            </p>
          </motion.div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div className={`${
              viewMode === "list" 
                ? "space-y-2" 
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 lg:gap-3"
            }`}>
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <UltraMobileProductSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <motion.div 
                className={`${
                  viewMode === "list" 
                    ? "space-y-2" 
                    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 lg:gap-3"
                }`}
                layout
              >
                {paginatedProducts.map((product: Product, index: number) => (
                  <UltraMobileProductCard
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
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8 px-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="rounded-lg h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  
                  {/* Dynamic page display based on screen size */}
                  {Array.from({ 
                    length: Math.min(typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5, totalPages) 
                  }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="rounded-lg h-8 min-w-[32px] text-xs"
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
                    className="rounded-lg h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8 sm:py-12 px-4"
            >
              <Package className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">কোন পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm">অন্য কিছু খুঁজে দেখুন অথবা ফিল্টার পরিবর্তন করুন</p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSortBy("");
                }}
                className="rounded-lg text-sm"
                size="sm"
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
          const price = typeof customProduct.price === 'string' ? parseFloat(customProduct.price) : customProduct.price;
          addToCart({ ...customProduct, price, quantity: 1 });
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
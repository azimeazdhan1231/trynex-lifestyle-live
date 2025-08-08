import { useState, useEffect, memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle, ShoppingCart, Gift, Star, Clock, TrendingUp, Heart, Eye, Phone, Sparkles, Palette, ChevronRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedProductLoader from "@/components/enhanced-product-loader";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import TrackingSection from "@/components/tracking-section";
import PerfectPopupOffer from "../components/perfect-popup-offer";
import ProductModal from "@/components/product-modal-fixed";
import CustomizeModal from "@/components/customize-modal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { COMPANY_NAME, COMPANY_TAGLINE, WHATSAPP_NUMBER, createWhatsAppUrl, formatPrice } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import UnifiedProductCard from "@/components/unified-product-card";
import MobileEnhancedProductCard from "@/components/mobile-enhanced-product-card";
import MobileEnhancedCarousel from "@/components/mobile-enhanced-carousel";
import DynamicProductCarousel from "@/components/dynamic-product-carousel";
// Optimized imports - removed heavy utilities
import type { Product, Offer } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  showBadge?: boolean;
}

const ProductCard = memo(function ProductCard({ product, onAddToCart, onViewProduct, onCustomize, showBadge = true }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleWhatsAppOrder = () => {
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)}`;
    window.open(createWhatsAppUrl(message), '_blank');
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleProductView = () => {
    onViewProduct(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomize) {
      onCustomize(product);
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden bg-white hover:border-primary/30 transform hover:-translate-y-1 sm:hover:-translate-y-2">
      <div className="relative">
        <div 
          className="aspect-[4/5] overflow-hidden cursor-pointer bg-gray-50"
          onClick={handleProductView}
        >
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 sm:duration-500"
            loading="lazy"
          />
        </div>

        {/* Product Badges */}
        {showBadge && (
          <div className="absolute top-3 left-3 space-y-2">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                নতুন
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                বেস্ট সেলার
              </Badge>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className="absolute top-3 right-3">
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white shadow-lg animate-pulse">
              মাত্র {product.stock}টি বাকি
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-red-500 text-white shadow-lg">
              স্টক নেই
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={handleToggleFavorite}
            size="sm"
            variant="outline"
            className={`w-9 h-9 p-0 bg-white/90 backdrop-blur-sm border-white/50 ${
              isFavorite ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Stock Out Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-white font-bold text-lg px-4 py-2">
              স্টক শেষ
            </Badge>
          </div>
        )}

        {/* Quick Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <Button
              onClick={handleProductView}
              size="sm"
              variant="outline"
              className="flex-1 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <Eye className="w-4 h-4 mr-1" />
              দেখুন
            </Button>
            <Button
              onClick={handleWhatsAppOrder}
              size="sm"
              variant="outline"
              className="flex-1 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <Phone className="w-4 h-4 mr-1" />
              অর্ডার
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <h4 
            className="font-semibold text-lg text-gray-800 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer leading-tight" 
            onClick={handleProductView}
          >
            {product.name}
          </h4>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              <span className="text-sm text-gray-500">বিনামূল্যে ডেলিভারি</span>
            </div>
            <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="px-3 py-1">
              স্টক: {product.stock}
            </Badge>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
            </Button>

            <div className="flex gap-2">
              <Button 
                onClick={handleWhatsAppOrder}
                variant="outline"
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50 font-medium py-3 rounded-lg transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                অর্ডার
              </Button>

              {onCustomize && (
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="flex-1 bg-purple-500 text-white hover:bg-purple-600 border-purple-500 font-medium py-3 rounded-lg transition-all duration-300"
                >
                  <Palette className="w-4 h-4 mr-1" />
                  কাস্টমাইজ
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

function ProductSection({ 
  title, 
  subtitle, 
  icon: Icon, 
  products, 
  isLoading, 
  onAddToCart, 
  onViewProduct,
  onCustomize,
  bgColor = "bg-white",
  titleColor = "text-gray-800"
}: {
  title: string;
  subtitle: string;
  icon: any;
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  bgColor?: string;
  titleColor?: string;
}) {
  if (isLoading) {
    return (
      <section className={`py-20 ${bgColor} relative overflow-hidden`}>
        {/* Premium Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Premium Loading Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-full animate-premium-pulse flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full animate-float" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-56 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-lg animate-shimmer-wave shadow-sm" />
                <div className="h-4 w-40 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-shimmer-wave" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-6 w-96 max-w-full mx-auto bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-md animate-shimmer-wave shadow-sm" style={{ animationDelay: '0.8s' }} />
              <div className="h-4 w-80 max-w-full mx-auto bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-shimmer-wave" style={{ animationDelay: '1.2s' }} />
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 mx-auto mt-8 rounded-full animate-premium-pulse" />
          </div>

          {/* Enhanced Product Grid Loading */}
          <EnhancedProductLoader count={8} />

          {/* Premium Loading Footer */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-100 via-white to-gray-100 px-8 py-4 rounded-full shadow-lg animate-shimmer-wave">
              <div className="w-5 h-5 bg-gradient-to-r from-primary/40 to-primary/60 rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
            </div>
          </div>
        </div>
        
        {/* Premium Loading Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent pointer-events-none animate-shine" />
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Icon className="w-10 h-10 text-primary" />
            <h2 className={`text-4xl font-bold ${titleColor}`}>{title}</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Dynamic Product Carousel with swipe functionality */}
        <DynamicProductCarousel
          products={products}
          title={title}
          onAddToCart={onAddToCart}
          onViewProduct={onViewProduct}
          onCustomize={onCustomize}
          className="mb-8"
        />

        {/* Additional Grid View for more products */}
        {products.length > 8 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">আরও পণ্য</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.slice(8).map((product, index) => (
                <div 
                  key={product.id} 
                  className="h-full transform transition-all duration-500 opacity-0"
                  style={{
                    animation: `fadeInUp 0.8s ease-out ${(index + 8) * 100}ms forwards`
                  }}
                >
                  <UnifiedProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onViewProduct={onViewProduct}
                    onCustomize={onCustomize || (() => {})}
                    showBadge={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="group bg-white hover:bg-primary hover:text-white border-2 border-primary/20 hover:border-primary shadow-lg hover:shadow-xl btn-professional hover-lift px-8 py-4"
            onClick={() => window.location.href = '/products'}
          >
            <span className="font-medium text-lg">সব পণ্য দেখুন</span>
            <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
  const [productsReady, setProductsReady] = useState(false);
  const [aiChatbotLoaded, setAiChatbotLoaded] = useState(false);
  const [smartSearchLoaded, setSmartSearchLoaded] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Simple initialization - run only once
  useEffect(() => {
    console.log('🚀 Home page initialized');
  }, []); // Empty dependency array to run only once

  // Load active offers - disabled to prevent popup issues
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers", "active=true"],
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    enabled: false, // Disabled to prevent excessive popup blocking
  });

  // Initialize products with empty array for fast loading
  const [cachedProducts, setCachedProducts] = useState<Product[]>([]);

  // Load products for homepage sections with instant display
  const { data: products = [], isLoading: productsLoading, isSuccess } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10, // 10 minutes stale time
    gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    initialData: cachedProducts.length > 0 ? cachedProducts : undefined,
    placeholderData: cachedProducts, // Use cached data as placeholder
    networkMode: 'always', // Always try to fetch fresh data
  });

  // Show products immediately when loaded - no artificial delays

  // Optimize loading state management
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (productsLoading) {
      setShowLoadingSkeleton(true);
      setProductsReady(false);
    } else if (isSuccess && products.length > 0) {
      // Reduce loading animation time for better performance
      timeoutId = setTimeout(() => {
        setShowLoadingSkeleton(false);
        setProductsReady(true);
      }, 600); // Reduced from 1200ms to 600ms
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [productsLoading, isSuccess, products.length]);

  // Always show loading when products are being fetched for premium UX
  const shouldShowLoading = showLoadingSkeleton;

  // Cache products when successfully loaded - optimize dependency array
  useEffect(() => {
    if (products && products.length > 0 && !productsLoading) {
      setCachedProducts(products);
    }
  }, [products, productsLoading]); // Keep dependencies minimal

  // Use current products or cached products for instant display
  const currentProducts = products?.length > 0 ? products : cachedProducts;

  // Memoized product filtering for better performance
  const featuredProducts = useMemo(() => 
    currentProducts.filter(p => p.is_featured), [currentProducts]
  );

  const latestProducts = useMemo(() =>
    currentProducts.filter(p => p.is_latest), [currentProducts]
  );

  const bestSellingProducts = useMemo(() =>
    currentProducts.filter(p => p.is_best_selling), [currentProducts]
  );

  // If no products are marked, use defaults
  const defaultFeatured = featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : currentProducts.slice(0, 4);
  const defaultLatest = latestProducts.length > 0 ? latestProducts.slice(0, 4) : currentProducts.slice(4, 8);
  const defaultBestSelling = bestSellingProducts.length > 0 ? bestSellingProducts.slice(0, 4) : currentProducts.slice(8, 12);

  // Optimized scroll handler with proper cleanup
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isScrolling = false;
    
    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setShowScrollTop(window.scrollY > 300);
          isScrolling = false;
        }, 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isScrolling = false;
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
    });

    trackAddToCart(product.id, product.name, Number(product.price));

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleProductView = (product: Product) => {
    console.log("🚀 Home: handleProductView called, opening product modal:", product.name);
    setSelectedProduct(product);
    setIsModalOpen(true);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleCustomizeProduct = (product: Product) => {
    setCustomizeProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleCustomizeAddToCart = async (product: Product, customization: any): Promise<void> => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      customization: customization,
    });

    toast({
      title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!",
      description: `${product.name} আপনার পছন্দমতো কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
    });
  };

  const scrollToProducts = () => {
    const element = document.getElementById('featured-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MobileOptimizedLayout>
      <PerfectPopupOffer />

      {/* Premium Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-primary via-primary/95 to-emerald-700 text-white py-16 sm:py-20 lg:py-24 overflow-hidden"
      >
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3Ccircle cx='80' cy='80' r='2'/%3E%3Ccircle cx='50' cy='10' r='1.5'/%3E%3Ccircle cx='10' cy='70' r='2.5'/%3E%3Ccircle cx='90' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-emerald-600/20 animate-shimmer-wave" style={{ animationDuration: '8s' }} />

        <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight animate-fade-in-up">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white animate-shimmer-wave" style={{ animationDuration: '4s' }}>
                বিশেষ গিফট কালেকশন
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 lg:mb-12 text-emerald-100 leading-relaxed px-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <span className="drop-shadow-lg">আপনার প্রিয়জনের জন্য সেরা উপহার এবং লাইফস্টাইল পণ্য</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Button 
                onClick={scrollToProducts}
                size="lg"
                className="bg-white text-primary hover:bg-gray-50 text-lg sm:text-xl px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500 w-full sm:w-auto font-bold relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  এখনই কিনুন 
                  <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>

              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white/80 text-white hover:bg-white hover:text-primary text-lg sm:text-xl px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500 w-full sm:w-auto font-bold backdrop-blur-sm bg-white/10 relative overflow-hidden group"
                onClick={() => window.open(createWhatsAppUrl("আসসালামু আলাইকুম। আমি Trynex Lifestyle সম্পর্কে জানতে চাই।"), '_blank')}
              >
                <div className="flex items-center relative z-10">
                  <MessageCircle className="mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
                  হোয়াটসঅ্যাপে যোগাযোগ
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Floating Elements */}
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 animate-float">
          <Gift className="w-8 h-8 sm:w-12 sm:h-12 text-white/40 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 animate-float" style={{ animationDelay: '1s' }}>
          <Star className="w-10 h-10 sm:w-16 sm:h-16 text-white/30 drop-shadow-lg" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-2 h-2 bg-white/20 rounded-full" />
        </div>
        <div className="absolute top-1/4 right-1/4 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="w-1 h-1 bg-emerald-200/40 rounded-full" />
        </div>
      </section>

      {/* Special Offers Banner */}
      {offers.length > 0 && (
        <section className="bg-gradient-to-r from-accent via-accent/90 to-accent text-white py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-6 text-center">
              <Gift className="w-8 h-8 animate-bounce" />
              <div>
                <p className="text-2xl font-bold mb-1">🎉 {offers[0].title}</p>
                <p className="text-lg opacity-90">{offers[0].description}</p>
              </div>
              <Gift className="w-8 h-8 animate-bounce delay-500" />
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <div id="featured-products">
        <ProductSection
          title="ফিচার্ড পণ্য"
          subtitle="আমাদের বিশেষভাবে নির্বাচিত এবং জনপ্রিয় পণ্যসমূহ"
          icon={Star}
          products={defaultFeatured}
          isLoading={shouldShowLoading}
          onAddToCart={handleAddToCart}
          onViewProduct={handleProductView}
          onCustomize={handleCustomizeProduct}
          bgColor="bg-white"
          titleColor="text-gray-800"
        />
      </div>

      {/* Latest Products Section */}
      <ProductSection
        title="নতুন পণ্য"
        subtitle="সদ্য এসেছে আমাদের লেটেস্ট কালেকশন"
        icon={Clock}
        products={defaultLatest}
        isLoading={shouldShowLoading}
        onAddToCart={handleAddToCart}
        onViewProduct={handleProductView}
        onCustomize={handleCustomizeProduct}
        bgColor="bg-gradient-to-br from-gray-50 to-blue-50"
        titleColor="text-gray-800"
      />

      {/* Best Selling Products Section */}
      <ProductSection
        title="বেস্ট সেলিং"
        subtitle="গ্রাহকদের পছন্দের টপ রেটেড পণ্যসমূহ"
        icon={TrendingUp}
        products={defaultBestSelling}
        isLoading={shouldShowLoading}
        onAddToCart={handleAddToCart}
        onViewProduct={handleProductView}
        onCustomize={handleCustomizeProduct}
        bgColor="bg-white"
        titleColor="text-gray-800"
      />

      {/* Order Tracking */}
      <TrackingSection />

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700">
        <div className="container mx-auto px-4">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <MessageCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                <h3 className="text-4xl font-bold mb-4 text-gray-800">সরাসরি অর্ডার করুন</h3>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  হোয়াটসঅ্যাপে যোগাযোগ করে তাৎক্ষণিক অর্ডার করুন এবং বিশেষ ছাড় পান
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => window.open(createWhatsAppUrl("আসসালামু আলাইকুম। আমি Trynex Lifestyle থেকে পণ্য কিনতে চাই।"), '_blank')}
                >
                  <MessageCircle className="mr-3 w-6 h-6" />
                  হোয়াটসঅ্যাপে অর্ডার করুন
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => window.open(`tel:${WHATSAPP_NUMBER}`)}
                >
                  <Phone className="mr-3 w-6 h-6" />
                  ফোন করুন
                </Button>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-2xl">
                <p className="text-green-800 font-semibold">
                  📞 {WHATSAPP_NUMBER} | 🕐 সার্ভিস টাইম: সকাল ৯টা - রাত ১০টা
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>



      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomizeProduct}
        />
      )}

      {/* Customize Modal */}
      {customizeProduct && (
        <CustomizeModal
          product={customizeProduct}
          isOpen={isCustomizeModalOpen}
          onClose={() => {
            setIsCustomizeModalOpen(false);
            setCustomizeProduct(null);
          }}
          onAddToCart={handleCustomizeAddToCart}
        />
      )}
      {/* Enhanced AI Chatbot - Component temporarily disabled */}
    </MobileOptimizedLayout>
  );
}
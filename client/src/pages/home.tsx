import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { setLocation } from "wouter";
import { Star, ShoppingCart, Heart, TrendingUp, Award, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import Header from "@/components/header";
import ProductModal from "@/components/product-modal-fixed";
import CustomizeModal from "@/components/customize-modal";
import PremiumLoadingSkeleton from "@/components/premium-product-loader";
import UnifiedProductCard from "@/components/unified-product-card";
import PopupOffer from "@/components/popup-offer";
import { formatPrice } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@shared/schema";

// Cache for instant loading
let cachedProducts: Product[] = [];
let lastCacheTime = 0;

export default function HomePage() {
  const { toast } = useToast();
  const { cart, addToCart } = useCart();

  // Loading states
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false);
  const [productsReady, setProductsReady] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  console.log('🚀 Home page initialized');

  // Instant product loading with robust fallback
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error,
    isSuccess 
  } = useQuery<Product[]>({
    queryKey: ["products-home-instant"],
    queryFn: async () => {
      const CACHE_KEY = 'home-products-instant';

      // Try instant cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 3 minutes old
          if (Date.now() - timestamp < 3 * 60 * 1000) {
            console.log('⚡ Home products loaded instantly from cache');
            // Fetch fresh data in background
            fetchFreshProducts(CACHE_KEY);
            return data;
          }
        }
      } catch (e) {
        console.warn('Cache failed, fetching fresh data');
      }

      // Fetch fresh data
      return await fetchFreshProducts(CACHE_KEY);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnMount: cachedProducts.length === 0, // Skip if we have cached data
    initialData: cachedProducts.length > 0 ? cachedProducts : undefined,
    placeholderData: cachedProducts.length > 0 ? cachedProducts : undefined,
    networkMode: 'always',
  });

  // Background fetch function
  async function fetchFreshProducts(cacheKey: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const response = await fetch('/api/products', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }

      const data = await response.json();

      // Cache for instant loading next time
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        cachedProducts = data;
        lastCacheTime = Date.now();
      } catch (e) {
        console.warn('Failed to cache products');
      }

      console.log('🚀 Fresh home products fetched');
      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('❌ Home products fetch timeout');
        // Return cached data if available
        if (cachedProducts.length > 0) {
          console.log('🔄 Using cached products due to timeout');
          return cachedProducts;
        }
        throw new Error('Connection timeout - please refresh the page');
      }

      console.error('❌ Home products fetch failed:', error);

      // Return cached data if available
      if (cachedProducts.length > 0) {
        console.log('🔄 Using cached products due to error');
        return cachedProducts;
      }

      throw error;
    }
  }

  // Optimize loading state management
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (productsLoading && !products.length) {
      setShowLoadingSkeleton(true);
      setProductsReady(false);
    } else if (products.length > 0) {
      // Show products immediately if we have data
      if (cachedProducts.length > 0) {
        setShowLoadingSkeleton(false);
        setProductsReady(true);
      } else {
        // Brief loading animation for first load
        timeoutId = setTimeout(() => {
          setShowLoadingSkeleton(false);
          setProductsReady(true);
        }, 300);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [productsLoading, products.length]);

  // Cache products when successfully loaded
  useEffect(() => {
    if (products && products.length > 0 && !productsLoading) {
      cachedProducts = products;
      lastCacheTime = Date.now();
    }
  }, [products, productsLoading]);

  // Use current products or cached products for instant display
  const currentProducts = products?.length > 0 ? products : cachedProducts;

  // Categorized products with better error handling
  const { featuredProducts, latestProducts, bestSellingProducts, allCategories } = useMemo(() => {
    if (!currentProducts || currentProducts.length === 0) {
      return {
        featuredProducts: [],
        latestProducts: [],
        bestSellingProducts: [],
        allCategories: []
      };
    }

    const featured = currentProducts.filter(p => p.is_featured).slice(0, 8);
    const latest = currentProducts
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8);
    const bestSelling = currentProducts.filter(p => p.is_best_selling).slice(0, 8);

    const categories = [...new Set(currentProducts.map(p => p.category))].filter(Boolean);

    return {
      featuredProducts: featured,
      latestProducts: latest,
      bestSellingProducts: bestSelling,
      allCategories: categories
    };
  }, [currentProducts]);

  // Handle product view
  const handleProductView = (product: Product) => {
    console.log('🚀 Home: handleProductView called, opening product modal:', product.name);
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    trackEvent('product_view', { product_name: product.name });
  };

  // Handle customize
  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
    trackEvent('customize_click', { product_name: product.name });
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "স্টক শেষ",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url
      });

      toast({
        title: "কার্টে যোগ করা হয়েছে",
        description: `${product.name} কার্টে যোগ করা হয়েছে`,
      });

      trackEvent('add_to_cart', { 
        product_name: product.name, 
        product_price: product.price 
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  // Handle add to cart with customization
  const handleAddToCartWithCustomization = async (product: Product, customization: any) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url
      }, customization);

      toast({
        title: "কাস্টম অর্ডার যোগ করা হয়েছে",
        description: `${product.name} কাস্টমাইজেশন সহ কার্টে যোগ করা হয়েছে`,
      });

      trackEvent('add_to_cart_custom', { 
        product_name: product.name, 
        product_price: product.price 
      });
    } catch (error) {
      console.error('Error adding customized product to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কাস্টম পণ্য কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  // Error state
  if (error && !currentProducts.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={cart.length} onCartOpen={() => {}} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">পণ্য লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-4">দয়া করে পেজ রিফ্রেশ করুন বা কিছুক্ষণ পর আবার চেষ্টা করুন</p>
            <Button onClick={() => window.location.reload()}>
              পেজ রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading only when needed
  const shouldShowLoading = showLoadingSkeleton && !currentProducts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cart.length} onCartOpen={() => {}} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              <span className="text-yellow-300 font-semibold text-lg">ট্রাইনেক্স লাইফস্টাইল</span>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              আপনার স্বপ্নের
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                কাস্টম গিফট
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              সেরা মানের পণ্য, সাশ্রয়ী দাম এবং দ্রুত ডেলিভারি। 
              আপনার পছন্দমতো ডিজাইন করুন।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                onClick={() => setLocation('/products')}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                এখনই কিনুন
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
                onClick={() => setLocation('/custom-order')}
              >
                <Zap className="w-5 h-5 mr-2" />
                কাস্টম অর্ডার
              </Button>
            </div>

            <div className="flex justify-center items-center gap-8 mt-12 text-blue-100">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                <span>সেরা মান</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>দ্রুত ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6" />
                <span>১০০% সন্তুষ্টি</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Products */}
        {shouldShowLoading ? (
          <PremiumLoadingSkeleton />
        ) : (
          <>
            {featuredProducts.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500 fill-current" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">ফিচার্ড পণ্য</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/products')}
                    className="hidden sm:flex items-center gap-2"
                  >
                    সব দেখুন
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                  {featuredProducts.map((product) => (
                    <UnifiedProductCard
                      key={product.id}
                      product={product}
                      onViewProduct={handleProductView}
                      onCustomize={handleCustomize}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Products */}
            {latestProducts.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-blue-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">নতুন পণ্য</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/products')}
                    className="hidden sm:flex items-center gap-2"
                  >
                    সব দেখুন
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                  {latestProducts.map((product) => (
                    <UnifiedProductCard
                      key={product.id}
                      product={product}
                      onViewProduct={handleProductView}
                      onCustomize={handleCustomize}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Best Selling Products */}
            {bestSellingProducts.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">বেস্ট সেলিং</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/products')}
                    className="hidden sm:flex items-center gap-2"
                  >
                    সব দেখুন
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                  {bestSellingProducts.map((product) => (
                    <UnifiedProductCard
                      key={product.id}
                      product={product}
                      onViewProduct={handleProductView}
                      onCustomize={handleCustomize}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Categories Section */}
            {allCategories.length > 0 && (
              <section className="mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">বিভাগ সমূহ</h2>
                  <p className="text-gray-600">আপনার পছন্দের বিভাগ থেকে পণ্য বেছে নিন</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allCategories.slice(0, 10).map((category) => (
                    <Card 
                      key={category} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={() => setLocation(`/products?category=${category}`)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-white font-bold text-lg">
                            {category.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {category === 'mugs' ? 'মগ' : 
                           category === 'frames' ? 'ফ্রেম' : 
                           category === 'clothing' ? 'পোশাক' : 
                           category === 't-shirts' ? 'টি-শার্ট' : 
                           category}
                        </h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomize}
        />
      )}

      {/* Customize Modal */}
      <CustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCartWithCustomization}
      />

      {/* Popup Offer */}
      <PopupOffer />
    </div>
  );
}
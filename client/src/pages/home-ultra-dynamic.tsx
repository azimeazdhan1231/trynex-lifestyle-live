import { useState, useEffect, memo, useCallback, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import PerfectResponsiveCustomizeModal from "@/components/perfect-responsive-customize-modal";
import UltraResponsiveProductCard from "@/components/ultra-responsive-product-card";
import PerfectHeroSection from "@/components/perfect-hero-section";
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
  Mail
} from "lucide-react";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import type { Product, Offer } from "@shared/schema";

// Loading skeleton components
const ProductCardSkeleton = memo(function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
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

const HeroSkeleton = memo(function HeroSkeleton() {
  return (
    <div className="relative h-[500px] lg:h-[600px] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-64 bg-white/30 rounded-lg mx-auto" />
          <div className="h-6 w-48 bg-white/30 rounded mx-auto" />
          <div className="h-10 w-32 bg-white/30 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
});

// Hero section is now handled by PerfectHeroSection component

// Features Section
const FeaturesSection = memo(function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "১০০% অরিজিনাল",
      description: "সকল পণ্যের মান নিশ্চয়তা"
    },
    {
      icon: Truck,
      title: "দ্রুত ডেলিভারি",
      description: "১-৩ দিনে সারাদেশে পৌঁছে দেওয়া"
    },
    {
      icon: PhoneCall,
      title: "২৪/৭ সাপোর্ট",
      description: "যেকোনো সময় যোগাযোগ করুন"
    },
    {
      icon: Heart,
      title: "কাস্টমাইজেশন",
      description: "আপনার পছন্দ অনুযায়ী ডিজাইন"
    }
  ];

  return (
    <section className="py-16 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">কেন আমাদের বেছে নিবেন?</h2>
          <p className="text-gray-600 text-lg">আমরা দিচ্ছি সেরা সেবা এবং মানসম্পন্ন পণ্য</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-b from-white to-gray-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

// Product Section Component  
const ProductSection = memo(function ProductSection({ 
  title, 
  subtitle, 
  icon: Icon, 
  products, 
  isLoading,
  onViewProduct,
  onAddToCart,
  onCustomize,
  bgColor = "bg-white"
}: {
  title: string;
  subtitle: string;
  icon: any;
  products: Product[];
  isLoading: boolean;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
  bgColor?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + itemsPerView, maxIndex));
  }, [itemsPerView, maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - itemsPerView, 0));
  }, [itemsPerView]);

  if (isLoading) {
    return (
      <section className={`py-20 ${bgColor}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 ${bgColor} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-primary/20 to-orange-500/20 p-4 rounded-2xl">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            {/* Products Carousel */}
            <div className="relative">
              {/* Navigation Buttons */}
              {products.length > itemsPerView && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextSlide}
                    disabled={currentIndex >= maxIndex}
                    className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* Products Grid */}
              <div className="overflow-hidden">
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                    width: `${Math.ceil(products.length / itemsPerView) * 100}%`
                  }}
                >
                  {products.map((product) => (
                    <div key={product.id} className="w-full">
                      <UltraResponsiveProductCard
                        product={product}
                        onViewProduct={onViewProduct}
                        onAddToCart={onAddToCart}
                        onCustomize={onCustomize}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl">
                  সব পণ্য দেখুন
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
});

// Main Home Component
export default function HomeUltraDynamic() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Load products with optimized caching
  const { data: products = [], isLoading: productsLoading, isSuccess } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    networkMode: 'always',
  });

  // Load offers (disabled to prevent popups)
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers", "active=true"],
    staleTime: 1000 * 60 * 10,
    enabled: false, // Disabled to prevent popup issues
  });

  // Filter products by category
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 8);
  const latestProducts = products.filter(p => p.is_latest).slice(0, 8);
  const bestSellingProducts = products.filter(p => p.is_best_selling).slice(0, 8);

  // Default products if categories are empty
  const defaultFeatured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);
  const defaultLatest = latestProducts.length > 0 ? latestProducts : products.slice(8, 16);
  const defaultBestSelling = bestSellingProducts.length > 0 ? bestSellingProducts : products.slice(16, 24);

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleAddToCart = useCallback((product: Product, quantity: number = 1) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url || undefined,
      quantity: quantity,
    });
    
    toast({
      title: "কার্টে যোগ হয়েছে!",
      description: `${quantity > 1 ? quantity + ' টি ' : ''}${product.name} কার্টে যোগ করা হয়েছে`,
      duration: 2000,
    });
  }, [addToCart, toast]);

  const handleCustomizeProduct = useCallback((product: Product) => {
    setCustomizeProduct(product);
    setIsCustomizeModalOpen(true);
  }, []);

  const handleCustomizeAddToCart = useCallback(async (product: Product, customization: any) => {
    // Add customized product to cart
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url || undefined,
      quantity: customization.quantity || 1,
      customization: customization,
    });
    
    toast({
      title: "কাস্টম পণ্য যোগ হয়েছে!",
      description: `কাস্টমাইজড ${product.name} কার্টে যোগ করা হয়েছে`,
      duration: 3000,
    });
  }, [addToCart, toast]);

  return (
    <UltraSimpleLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <Suspense fallback={<HeroSkeleton />}>
          <PerfectHeroSection />
        </Suspense>

        {/* Features Section */}
        <FeaturesSection />

        {/* Featured Products */}
        <ProductSection
          title="ফিচার্ড পণ্য"
          subtitle="আমাদের সেরা এবং জনপ্রিয় পণ্যগুলো দেখুন"
          icon={Star}
          products={defaultFeatured}
          isLoading={productsLoading}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomizeProduct}
          bgColor="bg-white"
        />

        {/* Latest Products */}
        <ProductSection
          title="নতুন পণ্য"
          subtitle="সদ্য যোগ হওয়া পণ্যগুলো এখনই দেখুন"
          icon={Zap}
          products={defaultLatest}
          isLoading={productsLoading}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomizeProduct}
          bgColor="bg-gray-50"
        />

        {/* Best Selling Products */}
        <ProductSection
          title="বেস্ট সেলার"
          subtitle="সবচেয়ে বেশি বিক্রি হওয়া পণ্যগুলো"
          icon={Award}
          products={defaultBestSelling}
          isLoading={productsLoading}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomizeProduct}
          bgColor="bg-white"
        />

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-orange-50 to-primary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">যোগাযোগ করুন</h2>
              <p className="text-lg text-gray-600">কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center group hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <p className="text-sm text-gray-600 mb-4">দ্রুত উত্তরের জন্য</p>
                  <Button 
                    onClick={() => window.open(createWhatsAppUrl("আসসালামু আলাইকুম! আমি আপনাদের পণ্য সম্পর্কে জানতে চাই।"), '_blank')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    WhatsApp করুন
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center group hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PhoneCall className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">ফোন করুন</h3>
                  <p className="text-sm text-gray-600 mb-4">সরাসরি কথা বলুন</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('tel:+8801XXXXXXXXX')}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    ফোন করুন
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center group hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">ইমেইল</h3>
                  <p className="text-sm text-gray-600 mb-4">বিস্তারিত জানতে</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('mailto:info@trynexlifestyle.com')}
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    ইমেইল করুন
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      {/* Product Detail Modal */}
      <UltraDynamicProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onCustomize={handleCustomizeProduct}
      />

      {/* Customize Modal */}
      {customizeProduct && (
        <PerfectResponsiveCustomizeModal
          product={customizeProduct}
          isOpen={isCustomizeModalOpen}
          onClose={() => {
            setIsCustomizeModalOpen(false);
            setCustomizeProduct(null);
          }}
          onAddToCart={handleCustomizeAddToCart}
        />
      )}
    </UltraSimpleLayout>
  );
}
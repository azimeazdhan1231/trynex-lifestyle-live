import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import {
  ArrowRight,
  Star,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Heart,
  TrendingUp,
  Award,
  Zap,
  Users,
  Gift,
  Palette,
  Sparkles
} from "lucide-react";
import UltraResponsiveProductCard from "@/components/ultra-responsive-product-card";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ProductGridSkeleton, HeroSkeleton, FeatureSkeleton } from "@/components/EnhancedLoadingSkeleton";
import type { Product } from "@shared/schema";

interface SettingsData {
  site_title: string;
  site_description: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
}

export default function UltraModernHome() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Fetch settings and products with better error handling
  const { data: settings, isLoading: settingsLoading } = useQuery<SettingsData>({
    queryKey: ['/api/settings'],
    retry: 3,
    retryDelay: 1000,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter products for different sections
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 8);
  const latestProducts = products.filter(p => p.is_latest).slice(0, 8);
  const bestSellingProducts = products.filter(p => p.is_best_selling).slice(0, 8);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCustomize = (product: Product) => {
    // Customization is now handled by the UltraResponsiveProductCard internally
    console.log('Customizing product:', product.name);
  };

  const handleAddToCart = (product: Product | any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url,
      quantity: 1,
    });
    
    toast({
      title: "পণ্য যোগ করা হয়েছে!",
      description: `${product.name} কার্টে যোগ করা হয়েছে।`,
    });
  };

  // Show loading states
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <HeroSkeleton />
        <div className="container mx-auto px-4 py-20">
          <FeatureSkeleton />
        </div>
        <div className="container mx-auto px-4 py-20">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Show error state
  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">পণ্য লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-4">অনুগ্রহ করে পৃষ্ঠাটি পুনরায় লোড করুন</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              পুনরায় লোড করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Ultra Modern Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-semibold animate-pulse-scale">
                🎁 বাংলাদেশের #১ গিফট শপ
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {settings?.hero_title || "TryneX Lifestyle"}
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                {settings?.hero_subtitle || "আপনার প্রিয়জনের জন্য বিশেষ উপহার খুঁজে নিন আমাদের অনন্য কালেকশন থেকে"}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl touch-manipulation"
                >
                  <ShoppingBag className="w-6 h-6 mr-3" />
                  এখনই কিনুন
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation"
              >
                <Gift className="w-6 h-6 mr-3" />
                গিফট গাইড
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="font-medium">১০,০০০+ খুশি কাস্টমার</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-500" />
                <span className="font-medium">সারাদেশে ডেলিভারি</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="font-medium">১০০% নিরাপদ পেমেন্ট</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              কেন TryneX Lifestyle?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              আমরা শুধু পণ্য বিক্রি করি না, আমরা খুশির মুহূর্ত তৈরি করি
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck className="w-8 h-8" />,
                title: "দ্রুত ডেলিভারি",
                description: "ঢাকায় ২৪ ঘন্টা, সারাদেশে ৭২ ঘন্টা",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "নিরাপদ কেনাকাটা",
                description: "SSL এনক্রিপটেড পেমেন্ট সিস্টেম",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <RefreshCw className="w-8 h-8" />,
                title: "সহজ রিটার্ন",
                description: "৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই রিটার্ন",
                color: "from-purple-500 to-violet-500"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "প্রিমিয়াম কোয়ালিটি",
                description: "শুধুমাত্র সেরা ব্র্যান্ড ও মানসম্পন্ন পণ্য",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} p-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 mb-4">
                <Star className="w-4 h-4 mr-2" />
                ফিচার্ড প্রোডাক্ট
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                আমাদের সেরা পছন্দ
              </h2>
              <p className="text-xl text-gray-600">
                বিশেষভাবে নির্বাচিত পণ্য যা আপনার পছন্দ হবেই
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <UltraResponsiveProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  variant="featured"
                  priority={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                নতুন আগমন
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                সর্বশেষ কালেকশন
              </h2>
              <p className="text-xl text-gray-600">
                সবার আগে পেতে চান? আমাদের নতুন পণ্যগুলো দেখুন
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <UltraResponsiveProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  variant="default"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Selling Products */}
      {bestSellingProducts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                বেস্ট সেলার
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                সবচেয়ে জনপ্রিয়
              </h2>
              <p className="text-xl text-gray-600">
                অন্যরা যা পছন্দ করছেন, আপনিও দেখুন
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellingProducts.map((product) => (
                <UltraResponsiveProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  variant="default"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              আজই শুরু করুন আপনার গিফটিং জার্নি
            </h2>
            <p className="text-xl text-white/90">
              প্রিয়জনের মুখে হাসি ফোটান আমাদের অনন্য গিফট কালেকশন দিয়ে
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white text-orange-600 hover:bg-gray-50 border-2 border-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation"
                >
                  সব পণ্য দেখুন
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent text-white hover:bg-white/10 border-2 border-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation"
              >
                <Heart className="w-6 h-6 mr-3" />
                কাস্টম অর্ডার
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <UltraDynamicProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
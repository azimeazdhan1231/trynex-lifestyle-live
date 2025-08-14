import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import UltraModernProductCard from "@/components/ultra-modern-product-card";
import SimpleCustomizeModal from "@/components/simple-customize-modal";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
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
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fetch settings and products
  const { data: settings } = useQuery<SettingsData>({
    queryKey: ['/api/settings'],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
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
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      quantity: 1,
      image_url: product.image_url || '',
    });
    toast({
      title: "পণ্য যোগ করা হয়েছে!",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  // Auto-slide for hero section
  useEffect(() => {
    if (featuredProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  // Auto-slide for testimonials
  const testimonials = [
    {
      name: "আয়েশা খান",
      location: "ঢাকা",
      rating: 5,
      comment: "অসাধারণ পণ্য আর চমৎকার সেবা! আমার অর্ডারটি সময়মতো এসেছে এবং কোয়ালিটি দুর্দান্ত।",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "মোহাম্মদ রহিম",
      location: "চট্টগ্রাম", 
      rating: 5,
      comment: "বউয়ের জন্য একটি সুন্দর গহনা অর্ডার করেছিলাম। প্যাকেজিং খুবই সুন্দর ছিল।",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "ফাতিমা আক্তার",
      location: "সিলেট",
      rating: 5,
      comment: "কাস্টমাইজেশন সার্ভিস অসাধারণ! ঠিক আমার মতো করে পণ্যটি বানিয়ে দিয়েছে।",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const stats = [
    { number: "50K+", label: "সন্তুষ্ট গ্রাহক", icon: Users },
    { number: "100K+", label: "সফল অর্ডার", icon: ShoppingBag },
    { number: "4.9/5", label: "কাস্টমার রেটিং", icon: Star },
    { number: "24/7", label: "কাস্টমার সাপোর্ট", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f97316" fill-opacity="0.03"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative container mx-auto px-4 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  বাংলাদেশের #১ গিফট প্ল্যাটফর্ম
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {settings?.hero_title || "আপনার পছন্দের"}
                  </span>
                  <br />
                  <span className="text-gray-900">গিফট খুঁজে নিন</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  {settings?.hero_subtitle || "হাজারো সুন্দর পণ্য, কাস্টমাইজেশন সুবিধা এবং সারাদেশে ফ্রি হোম ডেলিভারি। আজই অর্ডার করুন!"}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  asChild
                >
                  <Link href="/products">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    শপিং শুরু করুন
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300"
                  asChild
                >
                  <Link href="/custom-order">
                    <Palette className="w-5 h-5 mr-2" />
                    কাস্টমাইজ করুন
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-8">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{i}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">50,000+ সন্তুষ্ট গ্রাহক</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">4.9/5 রেটিং</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Carousel */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                {featuredProducts.length > 0 && (
                  <div className="relative h-96 lg:h-[500px]">
                    {featuredProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={product.image_url || ''}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                          <p className="text-lg mb-4">৳{product.price}</p>
                          <Button
                            onClick={() => handleViewProduct(product)}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            দেখুন
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Carousel Controls */}
                    {featuredProducts.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all duration-200"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all duration-200"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Dots Indicator */}
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {featuredProducts.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentSlide ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Floating Features */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.number}</h3>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              কেন আমাদের বেছে নেবেন?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              আমরা আপনাকে সেরা শপিং অভিজ্ঞতা প্রদান করতে প্রতিশ্রুতিবদ্ধ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "ফ্রি হোম ডেলিভারি",
                description: "১৫০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি",
                color: "from-green-400 to-green-600"
              },
              {
                icon: Shield,
                title: "নিরাপদ পেমেন্ট",
                description: "bKash, Nagad এবং ক্যাশ অন ডেলিভারি",
                color: "from-blue-400 to-blue-600"
              },
              {
                icon: RefreshCw,
                title: "সহজ রিটার্ন",
                description: "৭ দিনের মধ্যে সহজ রিটার্ন পলিসি",
                color: "from-purple-400 to-purple-600"
              },
              {
                icon: Palette,
                title: "কাস্টমাইজেশন",
                description: "আপনার পছন্দ মতো পণ্য কাস্টমাইজ করুন",
                color: "from-orange-400 to-red-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 mb-4">
                <Award className="w-4 h-4 mr-2" />
                ফিচার্ড পণ্য
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                বিশেষভাবে নির্বাচিত পণ্য
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                আমাদের সবচেয়ে জনপ্রিয় এবং উচ্চ মানের পণ্যগুলি দেখুন
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <UltraModernProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  variant="featured"
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full font-semibold" asChild>
                <Link href="/products">
                  সব ফিচার্ড পণ্য দেখুন
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Latest Products Section */}
      {latestProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <Badge className="bg-green-500 text-white px-4 py-2 mb-4">
                  <Zap className="w-4 h-4 mr-2" />
                  সর্বশেষ পণ্য
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  নতুন আসা পণ্য
                </h2>
                <p className="text-gray-600 text-lg max-w-xl">
                  আমাদের সর্বশেষ কালেকশন দেখুন
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex border-green-500 text-green-500 hover:bg-green-500 hover:text-white" asChild>
                <Link href="/products?filter=latest">
                  সব দেখুন
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.slice(0, 8).map((product) => (
                <UltraModernProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              গ্রাহকরা কী বলছেন
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              আমাদের সন্তুষ্ট গ্রাহকদের পর্যালোচনা দেখুন
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentTestimonial 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-full absolute inset-0'
                  }`}
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-white text-lg mb-6 italic">
                        "{testimonial.comment}"
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        />
                        <div className="text-left">
                          <h4 className="text-white font-semibold">{testimonial.name}</h4>
                          <p className="text-gray-300 text-sm">{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Testimonial Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              আজই শপিং শুরু করুন!
            </h2>
            <p className="text-orange-100 text-lg mb-8">
              হাজারো সুন্দর পণ্য, সেরা দাম এবং ফ্রি হোম ডেলিভারি - সবকিছু এক জায়গায়
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg" asChild>
                <Link href="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  শপিং শুরু করুন
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-500 px-8 py-3 rounded-full font-semibold text-lg" asChild>
                <Link href="/contact">
                  যোগাযোগ করুন
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedProduct && (
        <>
          <SimpleCustomizeModal
            isOpen={showCustomizeModal}
            onClose={() => setShowCustomizeModal(false)}
            product={selectedProduct}
            onAddToCart={(customizedProduct) => {
              addToCart(customizedProduct);
              toast({
                title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!",
                description: `${selectedProduct.name} কার্টে যোগ করা হয়েছে`,
              });
              setShowCustomizeModal(false);
            }}
          />

          <UltraDynamicProductModal
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
            product={selectedProduct}
            onCustomize={(product) => {
              setShowProductModal(false);
              handleCustomize(product);
            }}
          />
        </>
      )}
    </div>
  );
}
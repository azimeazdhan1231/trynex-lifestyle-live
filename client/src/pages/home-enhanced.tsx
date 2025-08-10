import { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  ShoppingCart, 
  Gift, 
  Star, 
  TrendingUp, 
  Heart, 
  Eye, 
  ChevronRight, 
  ArrowUp,
  Shield,
  Truck,
  Users,
  Award,
  Grid3X3,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import UltraSimpleLayout from "@/components/ultra-simple-layout";
import PerfectProductModal from "@/components/perfect-product-modal";
import PerfectCustomizeModal from "@/components/perfect-customize-modal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { createWhatsAppUrl, formatPrice } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface ModernProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  layout?: "grid" | "list";
}

const ModernProductCard = memo(function ModernProductCard({ 
  product, 
  onAddToCart, 
  onViewProduct, 
  onCustomize, 
  layout = "grid" 
}: ModernProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);


  const handleWhatsAppOrder = () => {
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)}`;
    window.open(createWhatsAppUrl(message), '_blank');
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  if (layout === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-black text-xs">
                ফিচার্ড
              </Badge>
            )}
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
              <Button
                onClick={() => setIsFavorite(!isFavorite)}
                size="sm"
                variant="ghost"
                className="p-1"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </div>
            {product.category && (
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-lg font-bold text-green-600">
                {formatPrice(product.price)}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => onViewProduct(product)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  বিস্তারিত
                </Button>
                <Button
                  onClick={() => onAddToCart(product)}
                  size="sm"
                  className="text-xs"
                >
                  কার্টে যোগ করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white">
      <div className="relative">
        <div 
          className="aspect-[3/4] overflow-hidden cursor-pointer bg-gray-50"
          onClick={() => onViewProduct(product)}
        >
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProduct(product);
                }}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Button>
            </div>

            {/* Quick Add to Cart */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'স্টক নেই' : 'কার্টে যোগ করুন'}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-yellow-500 text-black text-xs font-semibold px-2 py-1">
              ফিচার্ড
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="bg-blue-500 text-white text-xs font-semibold px-2 py-1">
              নতুন
            </Badge>
          )}
          {product.is_best_selling && (
            <Badge className="bg-green-500 text-white text-xs font-semibold px-2 py-1">
              বেস্ট সেলার
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 animate-pulse">
              মাত্র {product.stock}টি বাকি
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-black">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>৪.৮</span>
              <span className="text-gray-300">•</span>
              <span>{Math.floor(Math.random() * 50) + 10} রিভিউ</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const HeroSection = memo(function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: "নতুন কালেকশন ২০২৫",
      subtitle: "স্টাইলিশ এবং আকর্ষণীয় ডিজাইনের পোশাক",
      description: "সর্বোচ্চ মানের ফেব্রিক এবং ট্রেন্ডি ডিজাইন",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      cta: "কালেকশন দেখুন",
      discount: "৫০% পর্যন্ত ছাড়"
    },
    {
      id: 2,
      title: "প্রিমিয়াম গিফট আইটেম",
      subtitle: "বিশেষ উপহারের জন্য সেরা পণ্য",
      description: "প্রিয়জনদের জন্য অসাধারণ গিফট কালেকশন",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      cta: "গিফট দেখুন",
      discount: "বিশেষ অফার"
    },
    {
      id: 3,
      title: "দ্রুত ডেলিভারি",
      subtitle: "সারাদেশে ২৪ ঘন্টায় ডেলিভারি",
      description: "ঢাকার ভিতরে একই দিনে ডেলিভারি",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      cta: "অর্ডার করুন",
      discount: "ফ্রি ডেলিভারি"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative w-full h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-xl">
                  <Badge className="mb-4 bg-primary text-white px-4 py-2 text-sm font-semibold">
                    {slide.discount}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 mb-2 font-medium">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg text-gray-300 mb-8">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                      {slide.cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg">
                      আরও জানুন
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

const FeaturesSection = memo(function FeaturesSection() {
  const features = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "ফ্রি ডেলিভারি",
      description: "৫০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি"
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "নিরাপদ পেমেন্ট",
      description: "১০০% নিরাপদ এবং সুরক্ষিত পেমেন্ট সিস্টেম"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "২৪/৭ সাপোর্ট",
      description: "যেকোনো সময় কাস্টমার সাপোর্ট পেতে যোগাযোগ করুন"
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "মান গ্যারান্টি",
      description: "সর্বোচ্চ মানের পণ্য এবং সন্তোষজনক সেবা"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const CategoriesSection = memo(function CategoriesSection() {
  const categories = [
    {
      name: "ফ্যাশন কালেকশন",
      count: 25,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "গিফট আইটেম",
      count: 18,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "ইলেকট্রনিক্স",
      count: 12,
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "হোম ডেকোর",
      count: 15,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    }
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            পণ্যের ক্যাটেগরি
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            বিভিন্ন ধরনের পণ্য থেকে আপনার পছন্দের আইটেম খুঁজে নিন
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} to="/products" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <div className="relative aspect-square">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-white font-semibold text-sm md:text-base mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-xs">
                      {category.count}টি পণ্য
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

export default function EnhancedHomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // Global add to cart function with customization support
  const globalAddToCart = async (item: any) => {
    await addToCart(item);
    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${item.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [productLayout, setProductLayout] = useState<"grid" | "list">("grid");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: offers = [] } = useQuery({
    queryKey: ["/api/offers", { active: true }],
  });

  // Filter products based on search query
  const filteredProducts = (products as Product[]).filter((product: Product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredProducts = filteredProducts.filter((p: Product) => p.is_featured);
  const latestProducts = filteredProducts.filter((p: Product) => p.is_latest);
  const bestSellingProducts = filteredProducts.filter((p: Product) => p.is_best_selling);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url,
      quantity: 1
    };
    addToCart(cartItem);
    toast({
      title: "কার্টে যোগ হয়েছে!",
      description: `${product.name} আপনার কার্টে যোগ করা হয়েছে।`,
    });
    trackAddToCart(product.id, product.name, product.category || 'uncategorized');
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleCustomizeProduct = (product: Product) => {
    setCustomizeProduct(product);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ProductSection = ({ title, products, showViewAll = true, sectionId }: {
    title: string;
    products: Product[];
    showViewAll?: boolean;
    sectionId: string;
  }) => (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">সেরা পণ্য সংগ্রহ</p>
          </div>
          <div className="flex items-center gap-4">
            {sectionId === 'all' && (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    onClick={() => setProductLayout("grid")}
                    variant={productLayout === "grid" ? "default" : "outline"}
                    size="sm"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setProductLayout("list")}
                    variant={productLayout === "list" ? "default" : "outline"}
                    size="sm"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 hidden md:block"
                />
              </>
            )}
            {showViewAll && (
              <Link to="/products">
                <Button variant="outline" size="sm">
                  সবগুলো দেখুন
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Gift className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">এই মুহূর্তে কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            productLayout === "list" 
              ? "grid-cols-1"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          }`}>
            {products.slice(0, productLayout === "list" ? 6 : 10).map((product) => (
              <ModernProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewProduct={handleViewProduct}
                onCustomize={handleCustomizeProduct}
                layout={productLayout}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <UltraSimpleLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <ProductSection
            title="ফিচার্ড পণ্য"
            products={featuredProducts}
            sectionId="featured"
          />
        )}

        {/* Latest Products */}
        {latestProducts.length > 0 && (
          <ProductSection
            title="নতুন পণ্য"
            products={latestProducts}
            sectionId="latest"
          />
        )}

        {/* Best Selling Products */}
        {bestSellingProducts.length > 0 && (
          <ProductSection
            title="বেস্ট সেলিং পণ্য"
            products={bestSellingProducts}
            sectionId="bestselling"
          />
        )}

        {/* All Products */}
        <div className="bg-gray-50">
          <ProductSection
            title="সকল পণ্য"
            products={filteredProducts}
            showViewAll={false}
            sectionId="all"
          />
        </div>

        {/* Newsletter Section */}
        <div className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              নতুন অফার এবং আপডেট পেতে সাবস্ক্রাইব করুন
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              বিশেষ ছাড় এবং নতুন পণ্যের খবর সবার আগে পান
            </p>
            <div className="flex max-w-md mx-auto gap-4">
              <Input
                placeholder="আপনার ইমেইল ঠিকানা"
                className="bg-white text-black"
              />
              <Button variant="secondary">
                সাবস্ক্রাইব করুন
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg"
            size="sm"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}

        {/* Modals */}
        {selectedProduct && (
          <PerfectProductModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onCustomize={(product) => setCustomizeProduct(product)}
          />
        )}

        {customizeProduct && (
          <PerfectCustomizeModal
            product={customizeProduct}
            isOpen={!!customizeProduct}
            onClose={() => setCustomizeProduct(null)}
            onAddToCart={async (product: Product, customization: any) => {
              // Add customization data to cart
              await globalAddToCart({
                id: product.id,
                name: product.name,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                image: product.image_url || '',
                quantity: customization.quantity || 1,
                customization // Include all customization data
              });
              setCustomizeProduct(null);
            }}
          />
        )}
      </div>
    </UltraSimpleLayout>
  );
}
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Gift, MessageCircle, ArrowUp, Star, Clock, TrendingUp, ShoppingCart, Eye, Heart, Share2, Phone, ChevronRight, Sparkles, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import TrackingSection from "@/components/tracking-section";
import PopupOffer from "../components/popup-offer";
import ProductModal from "@/components/product-modal";
import CustomizeModal from "@/components/customize-modal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { COMPANY_NAME, COMPANY_TAGLINE, WHATSAPP_NUMBER, createWhatsAppUrl, formatPrice } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product, Offer } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  showBadge?: boolean;
}

function ProductCard({ product, onAddToCart, onViewProduct, onCustomize, showBadge = true }: ProductCardProps) {
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
    <Card className="group hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden bg-white hover:border-primary/30 transform hover:-translate-y-2">
      <div className="relative">
        <div 
          className="aspect-square overflow-hidden cursor-pointer bg-gray-50"
          onClick={handleProductView}
        >
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
}

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
      <section className={`py-20 ${bgColor}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              onCustomize={onCustomize}
            />
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/products">
              সব পণ্য দেখুন
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
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
  const [location] = useLocation();
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Load active offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers", "active=true"],
  });

  // Load products for homepage sections
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products for different sections with fallbacks
  const featuredProducts = products.filter(p => p.is_featured);
  const latestProducts = products.filter(p => p.is_latest);
  const bestSellingProducts = products.filter(p => p.is_best_selling);

  // If no products are marked, use defaults
  const defaultFeatured = featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : products.slice(0, 4);
  const defaultLatest = latestProducts.length > 0 ? latestProducts.slice(0, 4) : products.slice(4, 8);
  const defaultBestSelling = bestSellingProducts.length > 0 ? bestSellingProducts.slice(0, 4) : products.slice(8, 12);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    setSelectedProduct(product);
    setIsModalOpen(true);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleCustomizeProduct = (product: Product) => {
    setCustomizeProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleCustomizeAddToCart = (product: Product, customization: any) => {
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
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />
      <PopupOffer />

      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-primary via-primary/90 to-emerald-700 text-white py-24 overflow-hidden"
        style={{ marginTop: (location === "/" || location === "/products") ? "120px" : "64px" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              বিশেষ গিফট কালেকশন
            </h1>
            <p className="text-xl md:text-3xl mb-12 text-emerald-100 leading-relaxed">
              আপনার প্রিয়জনের জন্য সেরা উপহার এবং লাইফস্টাইল পণ্য
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={scrollToProducts}
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                এখনই কিনুন 
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>

              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <a
                  href={createWhatsAppUrl("আসসালামু আলাইকুম। আমি Trynex Lifestyle সম্পর্কে জানতে চাই।")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-3 w-6 h-6" />
                  হোয়াটসঅ্যাপে যোগাযোগ
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <Gift className="w-12 h-12 text-white/30" />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce delay-700">
          <Star className="w-16 h-16 text-white/20" />
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
          isLoading={productsLoading}
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
        isLoading={productsLoading}
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
        isLoading={productsLoading}
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
                  asChild
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <a
                    href={createWhatsAppUrl("আসসালামু আলাইকুম। আমি Trynex Lifestyle থেকে পণ্য কিনতে চাই।")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-3 w-6 h-6" />
                    হোয়াটসঅ্যাপে অর্ডার করুন
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <a
                    href={`tel:${WHATSAPP_NUMBER}`}
                  >
                    <Phone className="mr-3 w-6 h-6" />
                    ফোন করুন
                  </a>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{COMPANY_NAME}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {COMPANY_TAGLINE}। আমরা গুণগত মানের পণ্য এবং সেবা প্রদানে প্রতিশ্রুতিবদ্ধ।
              </p>
              <div className="flex space-x-4">
                <Button 
                  asChild
                  variant="outline" 
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 font-medium"
                >
                  <a 
                    href="https://www.facebook.com/people/TryNex-Lifestyle/61576151563336/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white hover:text-white"
                  >
                    <span className="text-lg">📘</span>
                    <span className="text-white font-medium">Facebook Page</span>
                  </a>
                </Button>
                <Button 
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600 font-medium"
                >
                  <a 
                    href="https://wa.me/8801747292277" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white hover:text-white"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-white font-medium">WhatsApp</span>
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">দ্রুত লিংক</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">হোম</Link></li>
                <li><Link href="/products" className="text-gray-300 hover:text-white transition-colors">পণ্য</Link></li>
                <li><Link href="/offers" className="text-gray-300 hover:text-white transition-colors">অফার</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">যোগাযোগ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">যোগাযোগ</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📱 {WHATSAPP_NUMBER}</li>
                <li>🕐 সকাল ৯টা - রাত ১০টা</li>
                <li>🚚 সারা বাংলাদেশে ডেলিভারি</li>
                <li>💳 ক্যাশ অন ডেলিভারি</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 {COMPANY_NAME}. সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full w-14 h-14 shadow-2xl bg-primary hover:bg-primary/80 transform hover:scale-110 transition-all duration-300"
          size="lg"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}

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
    </div>
  );
}
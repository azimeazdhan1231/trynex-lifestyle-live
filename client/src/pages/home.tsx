import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Gift, MessageCircle, ArrowUp, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import ProductModal from "@/components/product-modal";
import TrackingSection from "@/components/tracking-section";
import PopupOfferModal from "@/components/popup-offer-modal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { COMPANY_NAME, COMPANY_TAGLINE, WHATSAPP_NUMBER, createWhatsAppUrl, formatPrice } from "@/lib/constants";
import type { Product, Offer } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Load active offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers", "active=true"],
  });

  // Load products
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Product loading error:", error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Filter products for different sections
  const featuredProducts = allProducts.filter(p => p.is_featured && p.stock > 0).slice(0, 8);
  const latestProducts = allProducts
    .filter(p => p.is_latest && p.stock > 0)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 8);
  const bestSellingProducts = allProducts.filter(p => p.is_best_selling && p.stock > 0).slice(0, 8);

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

    // Track add to cart event
    if (typeof window !== 'undefined') {
      import('@/lib/analytics').then(({ trackAddToCart }) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        trackAddToCart(product.id, product.name, price);
      });
    }

    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleWhatsAppOrder = (product: Product) => {
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div 
        className="aspect-square overflow-hidden relative"
        onClick={() => handleProductClick(product)}
      >
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      <CardContent className="p-4">
        <h4 
          className="font-semibold text-lg mb-2 text-gray-800 hover:text-primary transition-colors cursor-pointer line-clamp-2"
          onClick={() => handleProductClick(product)}
        >
          {product.name}
        </h4>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
          <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
            স্টক: {product.stock}
          </Badge>
        </div>
        <div className="space-y-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={product.stock === 0}
            className="w-full"
            variant={product.stock === 0 ? "secondary" : "default"}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(product);
              }}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              দেখুন
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsAppOrder(product);
              }}
              variant="outline"
              className="bg-green-500 text-white hover:bg-green-600 border-green-500"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProductSection = ({ title, products, sectionId }: { title: string; products: Product[]; sectionId: string }) => {
    if (products.length === 0) return null;

    return (
      <section id={sectionId} className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h3>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4"
            >
              <Link href="/products">
                আরো পণ্য দেখুন <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />

      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-r from-primary to-emerald-700 text-white py-20 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">বিশেষ গিফট কালেকশন</h2>
          <p className="text-xl md:text-2xl mb-8 text-emerald-100">আপনার প্রিয়জনের জন্য সেরা উপহার</p>
          <Button 
            onClick={scrollToProducts}
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
          >
            এখনই কিনুন <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Special Offers Banner */}
      {offers.length > 0 && (
        <section className="bg-accent text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-4 text-center">
              <Gift className="w-6 h-6 animate-bounce" />
              <p className="text-lg font-semibold">
                🎉 {offers[0].title} - {offers[0].description}
              </p>
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <ProductSection 
        title="বিশেষ পণ্যসমূহ" 
        products={featuredProducts} 
        sectionId="featured-products" 
      />

      {/* Latest Products */}
      <ProductSection 
        title="সর্বশেষ পণ্যসমূহ" 
        products={latestProducts} 
        sectionId="latest-products" 
      />

      {/* Best Selling Products */}
      <ProductSection 
        title="সর্বাধিক বিক্রিত পণ্যসমূহ" 
        products={bestSellingProducts} 
        sectionId="best-selling-products" 
      />

      {/* Order Tracking */}
      <TrackingSection />

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-3xl font-bold mb-4">সরাসরি অর্ডার করুন</h3>
              <p className="text-xl mb-6">হোয়াটসঅ্যাপে যোগাযোগ করে তাৎক্ষণিক অর্ডার করুন</p>
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4"
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="text-xl font-bold mb-4">{COMPANY_NAME}</h5>
              <p className="text-gray-300">বাংলাদেশের সেরা কাস্টম গিফট এবং লাইফস্টাইল পণ্যের দোকান।</p>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">যোগাযোগ</h5>
              <div className="space-y-2 text-gray-300">
                <p>📞 {WHATSAPP_NUMBER}</p>
                <p>✉️ trynexlifestyle@gmail.com</p>
                <p>📍 ঢাকা, বাংলাদেশ</p>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">সোশ্যাল মিডিয়া</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white text-2xl">📘</a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl">📷</a>
                <a href={createWhatsAppUrl("হ্যালো")} target="_blank" className="text-gray-300 hover:text-white text-2xl">💬</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; ২০২৫ {COMPANY_NAME}. সকল অধিকার সংরক্ষিত।</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <Button
          asChild
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg"
          title="হোয়াটসঅ্যাপে যোগাযোগ"
        >
          <a
            href={createWhatsAppUrl("আসসালামু আলাইকুম। আমি সাহায্য চাই।")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        </Button>

        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="sm"
            className="p-4 rounded-full shadow-lg"
            title="উপরে যান"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAddToCart={handleAddToCart}
      />

      {/* Popup Offer Modal */}
      <PopupOfferModal />
    </div>
  );
}
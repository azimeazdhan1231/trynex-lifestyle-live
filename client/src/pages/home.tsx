import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Gift, MessageCircle, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import TrackingSection from "@/components/tracking-section";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { COMPANY_NAME, COMPANY_TAGLINE, WHATSAPP_NUMBER, createWhatsAppUrl } from "@/lib/constants";
import type { Product, Offer } from "@shared/schema";

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Load active offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers", "active=true"],
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
    });
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
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

      {/* Product Grid */}
      <ProductGrid onAddToCart={handleAddToCart} />

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
    </div>
  );
}
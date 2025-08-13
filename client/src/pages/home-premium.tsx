import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Star, 
  ShoppingCart, 
  Gift, 
  Truck, 
  Shield, 
  MessageCircle,
  Phone,
  Award,
  Users,
  Package,
  Zap
} from "lucide-react";
import PremiumLayout from "@/components/premium-layout";
import PremiumProductCard from "@/components/premium-unified-product-card";
import PremiumProductDetailModal from "@/components/premium-product-detail-modal";
import PremiumLoadingSkeleton, { PremiumHeroSkeleton, PremiumCategorySkeleton, PremiumStatsSkeleton } from "@/components/premium-loading-system";
import PerfectCustomizeModal from "@/components/perfect-customize-modal";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { COMPANY_NAME, COMPANY_TAGLINE, WHATSAPP_NUMBER } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product, Category, Offer } from "@shared/schema";

export default function PremiumHomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000,
  });

  // Fetch offers
  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['/api/offers'],
    staleTime: 5 * 60 * 1000,
  });

  // Filter products by type
  const featuredProducts = Array.isArray(products) ? products.filter((p: Product) => p.is_featured).slice(0, 8) : [];
  const latestProducts = Array.isArray(products) ? products.filter((p: Product) => p.is_latest).slice(0, 8) : [];
  const bestSellingProducts = Array.isArray(products) ? products.filter((p: Product) => p.is_best_selling).slice(0, 8) : [];

  // Handle product interactions
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleCustomizeProduct = (product: Product) => {
    setCustomizeProduct(product);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
  };

  const handleAddToCart = async (product: Product, customization?: any) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image: product.image_url || '',
        quantity: customization?.quantity || 1,
        customization
      });

      trackAddToCart(
        product.id, 
        product.name, 
        typeof product.price === 'string' ? parseFloat(product.price) : product.price
      );

      toast({
        title: "কার্টে যোগ করা হয়েছে!",
        description: product.name,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppContact = () => {
    const message = "আসসালামু আলাইকুম! আমি আপনাদের পণ্য সম্পর্কে জানতে চাই।";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <PremiumLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-8">
          {offersLoading ? (
            <PremiumHeroSkeleton />
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/10 premium-card-interactive">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
              
              <div className="relative px-8 py-16 md:py-24 text-center">
                <div className="mx-auto max-w-4xl space-y-8">
                  <Badge className="premium-badge premium-badge-featured mb-4">
                    <Star className="w-4 h-4 mr-2" />
                    বাংলাদেশের #১ গিফট শপ
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl font-bold premium-heading leading-tight">
                    স্বাগতম 
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block md:inline md:ml-4">
                      {COMPANY_NAME}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl premium-text-muted max-w-2xl mx-auto">
                    {COMPANY_TAGLINE}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Link href="/products">
                      <Button size="lg" className="premium-button-primary px-8 py-6 text-lg">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        কেনাকাটা শুরু করুন
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleWhatsAppContact}
                      className="premium-button-secondary px-8 py-6 text-lg"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp এ যোগাযোগ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4">
          {productsLoading ? (
            <PremiumStatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="premium-card text-center p-6">
                <div className="premium-button-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold premium-price mb-2">৫০০+</div>
                <div className="text-sm premium-text-muted">সন্তুষ্ট গ্রাহক</div>
              </Card>
              
              <Card className="premium-card text-center p-6">
                <div className="premium-button-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold premium-price mb-2">{Array.isArray(products) ? products.length : 0}+</div>
                <div className="text-sm premium-text-muted">পণ্য সংগ্রহ</div>
              </Card>
              
              <Card className="premium-card text-center p-6">
                <div className="premium-button-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold premium-price mb-2">৯৮%</div>
                <div className="text-sm premium-text-muted">পজিটিভ রিভিউ</div>
              </Card>
              
              <Card className="premium-card text-center p-6">
                <div className="premium-button-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold premium-price mb-2">২৪/৭</div>
                <div className="text-sm premium-text-muted">সাপোর্ট</div>
              </Card>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4">
          {categoriesLoading ? (
            <PremiumCategorySkeleton />
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold premium-heading">
                  আমাদের ক্যাটেগরি
                </h2>
                <p className="text-lg premium-text-muted max-w-2xl mx-auto">
                  বিভিন্ন ধরনের পণ্য থেকে আপনার পছন্দের পণ্য বেছে নিন
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Array.isArray(categories) ? categories.slice(0, 6).map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.name}`}
                    className="premium-card premium-card-interactive p-6 text-center group"
                  >
                    <div className="premium-button-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold premium-text mb-1">
                      {category.name_bengali || category.name}
                    </h3>
                    <p className="text-sm premium-text-muted">
                      বিশেষ সংগ্রহ
                    </p>
                  </Link>
                )) : null}
              </div>
            </div>
          )}
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="container mx-auto px-4">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold premium-heading mb-2">
                    ফিচার্ড পণ্য
                  </h2>
                  <p className="premium-text-muted">বিশেষভাবে নির্বাচিত পণ্যসমূহ</p>
                </div>
                <Link href="/products?featured=true">
                  <Button variant="outline" className="premium-button-secondary">
                    আরো দেখুন
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {productsLoading ? (
                <PremiumLoadingSkeleton count={8} />
              ) : (
                <div className="premium-grid premium-grid-responsive">
                  {featuredProducts.map((product: Product) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewProduct}
                      onCustomize={handleCustomizeProduct}
                      className="premium-fade-in"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Trust Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold premium-heading">
                কেন আমাদের বেছে নিবেন?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="premium-card p-8 text-center">
                  <div className="premium-button-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold premium-heading mb-4">
                    দ্রুত ডেলিভারি
                  </h3>
                  <p className="premium-text-muted">
                    ঢাকার মধ্যে ২ৄ ঘন্টা এবং ঢাকার বাইরে ৪৮ ঘন্টার মধ্যে পণ্য পৌঁছে দেওয়া হয়
                  </p>
                </div>
                
                <div className="premium-card p-8 text-center">
                  <div className="premium-button-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold premium-heading mb-4">
                    নিরাপদ পেমেন্ট
                  </h3>
                  <p className="premium-text-muted">
                    ক্যাশ অন ডেলিভারি এবং বিকাশ/নগদ/রকেটের মাধ্যমে সহজ ও নিরাপদ পেমেন্ট
                  </p>
                </div>
                
                <div className="premium-card p-8 text-center">
                  <div className="premium-button-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold premium-heading mb-4">
                    ২৪/৭ সাপোর্ট
                  </h3>
                  <p className="premium-text-muted">
                    যে কোনো সমস্যায় আমাদের কাস্টমার সাপোর্ট টিম সবসময় আপনার পাশে আছে
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Products */}
        {latestProducts.length > 0 && (
          <section className="container mx-auto px-4">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold premium-heading mb-2">
                    নতুন পণ্য
                  </h2>
                  <p className="premium-text-muted">সদ্য এসেছে আমাদের সংগ্রহে</p>
                </div>
                <Link href="/products?latest=true">
                  <Button variant="outline" className="premium-button-secondary">
                    আরো দেখুন
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {productsLoading ? (
                <PremiumLoadingSkeleton count={8} />
              ) : (
                <div className="premium-grid premium-grid-responsive">
                  {latestProducts.map((product: Product) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewProduct}
                      onCustomize={handleCustomizeProduct}
                      className="premium-bounce-in"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Best Selling Products */}
        {bestSellingProducts.length > 0 && (
          <section className="container mx-auto px-4">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold premium-heading mb-2">
                    বেস্ট সেলার
                  </h2>
                  <p className="premium-text-muted">সবচেয়ে জনপ্রিয় পণ্যসমূহ</p>
                </div>
                <Link href="/products?bestselling=true">
                  <Button variant="outline" className="premium-button-secondary">
                    আরো দেখুন
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {productsLoading ? (
                <PremiumLoadingSkeleton count={8} />
              ) : (
                <div className="premium-grid premium-grid-responsive">
                  {bestSellingProducts.map((product: Product) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewProduct}
                      onCustomize={handleCustomizeProduct}
                      className="premium-slide-up"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Product Detail Modal */}
      <PremiumProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onCustomize={handleCustomizeProduct}
      />

      {/* Customize Modal */}
      {customizeProduct && (
        <PerfectCustomizeModal
          product={customizeProduct}
          isOpen={!!customizeProduct}
          onClose={() => setCustomizeProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </PremiumLayout>
  );
}
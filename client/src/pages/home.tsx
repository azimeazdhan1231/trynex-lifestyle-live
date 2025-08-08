
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, Truck, Shield, HeadphonesIcon, Zap } from 'lucide-react';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import OptimizedProductCard from '@/components/OptimizedProductCard';
import UltraFastLoading from '@/components/ultra-fast-loading';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import type { Product } from '@shared/schema';

// Lazy-loaded components
const ProductModal = React.lazy(() => import('@/components/product-modal'));
const CartModal = React.lazy(() => import('@/components/cart-modal'));

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  
  const { products, isLoading } = useOptimizedProducts({ pageSize: 8 });
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  // Track page view
  useEffect(() => {
    console.log('🚀 Home page initialized');
    trackEvent('page_view', { page: 'home' });
  }, [trackEvent]);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart(product);
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
    trackEvent('add_to_cart', { 
      product_id: product.id, 
      product_name: product.name,
      price: product.price 
    });
  }, [addToCart, toast, trackEvent]);

  const handleProductView = useCallback((product: Product) => {
    console.log('🚀 Home: handleProductView called, opening product modal:', product.name);
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    trackEvent('product_view', { 
      product_id: product.id, 
      product_name: product.name 
    });
  }, [trackEvent]);

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);
  const latestProducts = products.filter(p => p.is_latest).slice(0, 4);
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Zap className="w-4 h-4 mr-2" />
              দ্রুত ডেলিভারি সারাদেশে
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                TryneX
              </span>
              <br />
              Lifestyle Shop
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              আপনার পছন্দের সব পণ্য এক জায়গায়। সেরা দাম, দ্রুত ডেলিভারি এবং ১০০% নির্ভরযোগ্য সেবা।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
                এখনই কিনুন
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                সব পণ্য দেখুন
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">দ্রুত ডেলিভারি</h3>
                <p className="text-gray-600">সারাদেশে ২৪-৪৮ ঘন্টায় পৌঁছে যাবে</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">নিরাপদ কেনাকাটা</h3>
                <p className="text-gray-600">১০০% অরিজিনাল পণ্যের গ্যারান্টি</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <HeadphonesIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">২৪/৭ সাপোর্ট</h3>
                <p className="text-gray-600">যেকোনো সময় আমাদের সাথে যোগাযোগ করুন</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">বিশেষ সংগ্রহ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ফিচার্ড পণ্যসমূহ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              আমাদের সবচেয়ে জনপ্রিয় এবং বেস্ট সেলিং পণ্যগুলো দেখুন
            </p>
          </div>

          <UltraFastLoading isLoading={isLoading} hasData={hasProducts}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewProduct={handleProductView}
                />
              ))}
            </div>
          </UltraFastLoading>

          {featuredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">কোন ফিচার্ড পণ্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">নতুন এসেছে</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              সর্বশেষ পণ্যসমূহ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              আমাদের সবচেয়ে নতুন কালেকশন এখানে দেখুন
            </p>
          </div>

          <UltraFastLoading isLoading={isLoading} hasData={hasProducts}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewProduct={handleProductView}
                />
              ))}
            </div>
          </UltraFastLoading>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              সব পণ্য দেখুন
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <React.Suspense fallback={<div>Loading...</div>}>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isOpen={isProductModalOpen}
            onClose={() => {
              setIsProductModalOpen(false);
              setSelectedProduct(null);
            }}
            onAddToCart={handleAddToCart}
          />
        )}
        
        <CartModal
          isOpen={isCartModalOpen}
          onClose={() => setIsCartModalOpen(false)}
        />
      </React.Suspense>
    </div>
  );
}

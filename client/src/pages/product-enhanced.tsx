import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, MessageCircle, Plus, Minus, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import CustomizeModalDynamic from "@/components/customize-modal-dynamic";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface ProductPageProps {
  params?: { id?: string };
}

export default function EnhancedProductPage({ params }: ProductPageProps) {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Get product ID from URL parameters - support both /product/:id and /product?id=xxx
  const urlParams = new URLSearchParams(window.location.search);
  const productId = params?.id || urlParams.get('id');

  const { data: product, isLoading, error, refetch } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "related", product?.category],
    enabled: !!product?.category,
    select: (data) => data?.filter((p) => p.id !== productId)?.slice(0, 6) || []
  });

  // Track product view
  useEffect(() => {
    if (product && productId) {
      trackProductView(productId, product.name || 'Unknown Product', product.category || 'uncategorized');
      document.title = `${product.name || 'Product'} - Trynex Lifestyle`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `${product.description || product.name || 'Product'} - সেরা দামে কিনুন Trynex Lifestyle থেকে। ফ্রি ডেলিভারি এবং ১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি।`
        );
      }
    }
  }, [product, productId]);

  // Auto-retry on error
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);

  const handleAddToCart = () => {
    if (!product) return;

    const stock = Number(product.stock) || 0;
    if (stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name || 'Unknown Product',
        price: Number(product.price) || 0,
      });
    }

    trackAddToCart(product.id, product.name || 'Unknown Product', Number(product.price) || 0);

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} (${quantity}টি) সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    
    const totalPrice = Number(product.price) * quantity;
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(Number(product.price))} x ${quantity} = ${formatPrice(totalPrice)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.name || 'Product',
      text: `${product.name} - ${formatPrice(Number(product.price))}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share was cancelled, copy to clipboard instead
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিংক কপি হয়েছে",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি হয়েছে",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "লিংক কপি হয়েছে",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি হয়েছে",
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "পছন্দের তালিকা থেকে সরানো হয়েছে" : "পছন্দের তালিকায় যোগ করা হয়েছে",
      description: product?.name || "পণ্য"
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            {/* Back button skeleton */}
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-200 rounded border"></div>
                  ))}
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <MobileOptimizedLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">পণ্য পাওয়া যায়নি</h1>
            <p className="text-gray-600 mb-6">দুঃখিত, আপনার খোঁজা পণ্যটি পাওয়া যায়নি। এটি সরানো হয়ে থাকতে পারে বা লিংকটি ভুল হতে পারে।</p>
            
            <div className="space-y-3">
              <Button onClick={() => refetch()} className="w-full">
                আবার চেষ্টা করুন
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/products")}
                className="w-full"
              >
                পণ্যের তালিকায় ফিরুন
              </Button>
            </div>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  // Get product images
  const productImages = product.image_url 
    ? [product.image_url] 
    : ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"];

  const currentImage = productImages[selectedImageIndex] || productImages[0];
  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;

  return (
    <MobileOptimizedLayout>
      <div className="pb-safe-area-bottom">
        <div className="container mx-auto px-4 py-4">
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/products")}
              className="flex items-center gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleFavorite}
                className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                data-testid="button-favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="p-2"
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                onClick={() => setIsImageOverlayOpen(true)}
                data-testid="img-product-main"
              >
                <img
                  src={currentImage}
                  alt={product.name || 'Product'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                />
                
                {/* View Full Image Button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
                    <Eye className="w-6 h-6 text-gray-800" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_featured && (
                    <Badge className="bg-red-500 text-white">ফিচার্ড</Badge>
                  )}
                  {stock === 0 && (
                    <Badge variant="destructive">স্টক নেই</Badge>
                  )}
                  {stock > 0 && stock < 5 && (
                    <Badge className="bg-orange-500 text-white">সীমিত স্টক</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`img-thumbnail-${index}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Title & Rating */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" data-testid="text-product-name">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(৪.৮)</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <span className="text-sm text-gray-600">
                    {stock > 0 ? `${stock}টি স্টকে আছে` : 'স্টক নেই'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600" data-testid="text-price">
                    {formatPrice(price)}
                  </span>
                  {/* Optional: Original price for comparison */}
                  {price > 0 && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(price * 1.2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-700 mt-1">
                  ✓ ফ্রি ডেলিভারি ঢাকার মধ্যে
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">পরিমাণ</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <span className="font-semibold text-lg min-w-[3ch] text-center" data-testid="text-quantity">
                    {quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={stock > 0 && quantity >= stock}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600 ml-2">
                    মোট: {formatPrice(price * quantity)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {stock === 0 ? 'স্টক নেই' : 'কার্টে যোগ করুন'}
                </Button>

                {/* Customize Button */}
                <Button
                  onClick={() => setIsCustomizeModalOpen(true)}
                  variant="outline"
                  className="w-full py-3 text-lg font-semibold border-blue-600 text-blue-600 hover:bg-blue-50"
                  data-testid="button-customize"
                >
                  কাস্টমাইজ করুন
                </Button>

                {/* WhatsApp Order */}
                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  data-testid="button-whatsapp-order"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp এ অর্ডার করুন
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">১০০% অরিজিনাল</p>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">ফ্রি ডেলিভারি</p>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">সিকিউর প্যাকেজিং</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information Tabs */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">বিবরণ</TabsTrigger>
                  <TabsTrigger value="specs">স্পেসিফিকেশন</TabsTrigger>
                  <TabsTrigger value="reviews">রিভিউ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed" data-testid="text-description">
                      {product.description || 'এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যোগ করা হবে।'}
                    </p>
                    
                    {/* Additional product features */}
                    <div className="mt-6 space-y-2">
                      <h4 className="font-semibold text-gray-900">বৈশিষ্ট্য:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>উচ্চমানের ম্যাটেরিয়াল</li>
                        <li>টেকসই এবং দীর্ঘস্থায়ী</li>
                        <li>আকর্ষণীয় ডিজাইন</li>
                        <li>সহজ ব্যবহার</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">প্রোডাক্ট স্পেসিফিকেশন:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="font-medium text-gray-600">ব্র্যান্ড:</dt>
                        <dd className="text-gray-900">Trynex Lifestyle</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-600">ক্যাটেগরি:</dt>
                        <dd className="text-gray-900">{product.category || 'সাধারণ'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-600">স্টক:</dt>
                        <dd className="text-gray-900">{stock > 0 ? `${stock}টি` : 'স্টক নেই'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-600">ওয়ারেন্টি:</dt>
                        <dd className="text-gray-900">৭ দিন রিটার্ন পলিসি</dd>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">কাস্টমার রিভিউ</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">(৪.৮/৫)</span>
                      </div>
                    </div>

                    {/* Sample Reviews */}
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">রহিম উদ্দিন</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          খুবই ভালো প্রোডাক্ট। কোয়ালিটি অসাধারণ এবং দাম ও রিজনেবল।
                        </p>
                      </div>

                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">ফাতেমা খাতুন</span>
                          <div className="flex items-center">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-yellow-400 fill-current"
                              />
                            ))}
                            <Star className="w-3 h-3 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          প্রোডাক্ট ভালো কিন্তু ডেলিভারি একটু দেরি হয়েছিল।
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      সব রিভিউ দেখুন
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">সংশ্লিষ্ট পণ্য</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card 
                    key={relatedProduct.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setLocation(`/product/${relatedProduct.id}`)}
                    data-testid={`card-related-product-${relatedProduct.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={relatedProduct.image_url || '/placeholder.jpg'}
                          alt={relatedProduct.name || 'Product'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {relatedProduct.name}
                      </h4>
                      <p className="text-green-600 font-bold text-sm">
                        {formatPrice(Number(relatedProduct.price))}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customize Modal */}
        {product && (
          <CustomizeModalDynamic
            product={product}
            isOpen={isCustomizeModalOpen}
            onClose={() => setIsCustomizeModalOpen(false)}
            onAddToCart={async (customProduct, customization) => {
              addToCart({
                id: customProduct.id,
                name: customProduct.name,
                price: Number(customProduct.price),
                customization: customization,
              });
              toast({
                title: "কার্টে যোগ করা হয়েছে!",
                description: `${customProduct.name} কাস্টমাইজেশন সহ কার্টে যোগ করা হয়েছে`,
              });
              setIsCustomizeModalOpen(false);
            }}
          />
        )}

        {/* Image Overlay Modal */}
        {isImageOverlayOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setIsImageOverlayOpen(false)}
          >
            <div className="max-w-4xl w-full">
              <img
                src={currentImage}
                alt={product.name || 'Product'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <p className="text-white text-center mt-4 text-sm opacity-75">
                ছবির বাইরে ক্লিক করুন অথবা ESC চাপুন বন্ধ করতে
              </p>
            </div>
          </div>
        )}
      </div>
    </MobileOptimizedLayout>
  );
}
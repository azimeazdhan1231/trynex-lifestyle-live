import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, MessageCircle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import Header from "@/components/header";
import CustomizeModal from "@/components/customize-modal";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

export default function ProductPage(props: any) {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Get product ID from URL parameters - support both /product/:id and /product?id=xxx
  const urlParams = new URLSearchParams(window.location.search);
  const productId = props.params?.id || urlParams.get('id');

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "related", product?.category],
    enabled: !!product?.category
  });

  useEffect(() => {
    if (product) {
      trackProductView(product.id, product.name, product.category || 'uncategorized');
      document.title = `${product.name} - Trynex Lifestyle`;
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={totalItems} onCartOpen={() => {}} />
        <div className="pt-20 container mx-auto px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={totalItems} onCartOpen={() => {}} />
        <div className="pt-20 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">পণ্য পাওয়া যায়নি</h1>
          <Button onClick={() => setLocation("/products")}>
            পণ্যের তালিকায় ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
      });
    }

    trackAddToCart(product.id, product.name, Number(product.price));

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} (${quantity}টি) সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleWhatsAppOrder = () => {
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)} x ${quantity} = ${formatPrice(Number(product.price) * quantity)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatPrice(product.price)}`,
          url: window.location.href
        });
      } catch (err) {
        // Share was cancelled
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিংক কপি হয়েছে",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি হয়েছে",
      });
    }
  };

  const images = product.image_url ? [product.image_url] : ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/products")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            পণ্যের তালিকায় ফিরে যান
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* Product Images */}
            <div className="space-y-2 lg:space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {product.is_featured && (
                    <Badge className="bg-yellow-500 text-white">ফিচার্ড</Badge>
                  )}
                  {product.is_latest && (
                    <Badge className="bg-blue-500 text-white">নতুন</Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge className="bg-green-500 text-white">বেস্ট সেলার</Badge>
                  )}
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-4">
                  {formatPrice(product.price)}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                    স্টক: {product.stock}টি
                  </Badge>
                  {product.stock <= 5 && product.stock > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      মাত্র {product.stock}টি বাকি!
                    </Badge>
                  )}
                </div>
                
                {product.description && (
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                )}
              </div>

              <Separator />

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">পরিমাণ:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    কার্টে যোগ করুন
                  </Button>
                  
                  <Button
                    onClick={handleWhatsAppOrder}
                    variant="outline"
                    size="lg"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp অর্ডার
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`${isFavorite ? "text-red-500 border-red-500" : ""} flex-1 sm:flex-none`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">{isFavorite ? "পছন্দের তালিকায়" : "পছন্দের তালিকায় যোগ করুন"}</span>
                    <span className="sm:hidden">{isFavorite ? "পছন্দের" : "পছন্দ"}</span>
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
                    <Share2 className="w-4 h-4 mr-2" />
                    শেয়ার করুন
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    কাস্টমাইজ করুন
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>ফ্রি ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>৭ দিন রিটার্ন</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span>প্রিমিয়াম প্যাকেজিং</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">সংশ্লিষ্ট পণ্য</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/product?id=${relatedProduct.id}`)}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{relatedProduct.name}</h3>
                      <p className="text-primary font-bold">{formatPrice(relatedProduct.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customize Modal */}
      <CustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        product={product}
        onAddToCart={async (product, customization) => {
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

          setIsCustomizeModalOpen(false);
        }}
      />
    </div>
  );
}
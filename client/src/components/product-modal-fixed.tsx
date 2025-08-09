
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, ShoppingCart, Star, Plus, Minus, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: string | number;
  image_url?: string;
  category?: string;
  description?: string;
  stock?: number;
  is_featured?: boolean;
  is_latest?: boolean;
  is_best_selling?: boolean;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomize?: (product: Product) => void;
}

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `৳${numPrice.toFixed(0)}`;
};

export default function ProductModal({ product, isOpen, onClose, onCustomize }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      console.log('🔍 ProductModal: Received props:', { product: product.name, isOpen });
      console.log('✅ ProductModal: Rendering with product:', product.name, 'isOpen:', isOpen);
      console.log('✅ ProductModal: Product details:', product);
      
      // Track product view
      console.log('📈 Tracking product view:', product.name);
    }
  }, [isOpen, product]);

  if (!product) {
    return null;
  }

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image_url: product.image_url || '/placeholder.jpg',
        quantity: quantity
      };

      console.log('🛒 Adding to cart:', cartItem);
      addToCart(cartItem);
      
      // Close modal after adding to cart
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize(product);
    }
    onClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing product: ${product.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `আমি এই পণ্যটি অর্ডার করতে চাই:\n\nপণ্যের নাম: ${product.name}\nদাম: ${formatPrice(product.price)}\nপরিমাণ: ${quantity}\n\nদয়া করে অর্ডারটি কনফার্ম করুন।`;
    const phoneNumber = '8801521334956';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden",
        // Perfect responsive sizing
        "w-[95vw] max-h-[90vh]",
        "sm:w-[90vw] sm:max-w-[600px]",
        "md:w-[85vw] md:max-w-[700px]", 
        "lg:w-[80vw] lg:max-w-[800px]",
        "xl:w-[70vw] xl:max-w-[900px]",
        "2xl:max-w-[1000px]",
        // Perfect styling
        "border-0 shadow-2xl rounded-xl bg-white dark:bg-gray-900"
      )}>
        <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-8">
                {product.name}
              </DialogTitle>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {product.is_featured && (
                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                  বৈশিষ্ট্যযুক্ত
                </Badge>
              )}
              {product.is_latest && (
                <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                  নতুন
                </Badge>
              )}
              {product.is_best_selling && (
                <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                  সবচেয়ে বেশি বিক্রিত
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                  <img
                    src={product.image_url || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                  />
                  
                  {/* Action buttons on image */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border-white/50",
                        isLiked ? "text-red-500" : "text-gray-600"
                      )}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border-white/50 text-gray-600"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stock status */}
                  {product.stock !== undefined && (
                    <div className="absolute bottom-4 left-4">
                      <Badge 
                        variant={product.stock > 0 ? "default" : "destructive"}
                        className="bg-white/90 backdrop-blur-sm text-gray-900"
                      >
                        {product.stock > 0 ? `স্টকে আছে (${product.stock})` : 'স্টক নেই'}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Rating (placeholder) */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(৪.৮ রেটিং)</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-orange-600">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">বিনামূল্যে ডেলিভারি সহ</p>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">বিবরণ</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Default description if none provided */}
                {!product.description && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">বিবরণ</h3>
                    <p className="text-gray-600 leading-relaxed">
                      উচ্চ মানের উপাদান দিয়ে তৈরি এই পণ্যটি আপনার প্রয়োজন পূরণ করবে। 
                      আমাদের বিশেষজ্ঞ দল দ্বারা যত্ন সহকারে নির্বাচিত এবং পরীক্ষিত। 
                      দীর্ঘস্থায়িত্ব এবং সুন্দর ডিজাইনের নিশ্চয়তা।
                    </p>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <h3 className="font-semibold">পরিমাণ</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.stock !== undefined && quantity >= product.stock}
                      className="w-10 h-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isLoading || (product.stock !== undefined && product.stock <= 0)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    কার্টে যোগ করুন
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleCustomize}
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    কাস্টমাইজ করুন
                  </Button>
                </div>

                {/* WhatsApp Order Button */}
                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                >
                  WhatsApp এ অর্ডার করুন
                </Button>

                {/* Features */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>১০০% গুণমান নিশ্চিত</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>দ্রুত ডেলিভারি</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>৭ দিনের গ্যারান্টি</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>২৪/৭ কাস্টমার সাপোর্ট</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

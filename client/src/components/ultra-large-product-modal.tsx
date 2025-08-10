import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Palette, 
  Package, 
  Star,
  Truck,
  Shield,
  Plus,
  Minus,
  MessageCircle,
  Zap,
  Award,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface UltraLargeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}

export default function UltraLargeProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onCustomize
}: UltraLargeProductModalProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    if (product?.image_url) {
      setSelectedImage(product.image_url);
    }
  }, [product]);

  if (!product) return null;

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalPrice = price * quantity;

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    // Add to cart with quantity
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${quantity} টি ${product.name} কার্টে যোগ করা হয়েছে`,
    });
    onClose();
  };

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize(product);
      onClose();
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `আসসালামু আলাইকুম! আমি ${product.name} সম্পর্কে জানতে চাই।

পণ্যের তথ্য:
নাম: ${product.name}
দাম: ${formatPrice(price)}
পরিমাণ: ${quantity}
মোট: ${formatPrice(totalPrice)}

দয়া করে আরও তথ্য দিন।`;

    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatPrice(price)}`,
          url: window.location.href
        });
      } catch (error) {
        // Share cancelled
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${product.name} - ${formatPrice(price)} | ${window.location.href}`);
        toast({
          title: "লিংক কপি করা হয়েছে!",
          description: "পণ্যের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে",
        });
      } catch (error) {
        toast({
          title: "শেয়ার করতে পারিনি",
          description: "দুঃখিত, শেয়ার করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      }
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] min-h-[90vh] p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {product.description || `${product.name} পণ্যের বিস্তারিত তথ্য`}
        </DialogDescription>
        
        <div className="h-[98vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-full">
            {/* Left: Product Image */}
            <div className="relative bg-gray-50 dark:bg-gray-800 min-h-[50vh] lg:min-h-full">
              <div className="aspect-square lg:h-full relative overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isImageZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                    }`}
                    onClick={() => setIsImageZoomed(!isImageZoomed)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Package className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                
                {/* Product Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  {product.is_featured && (
                    <Badge className="bg-yellow-500 text-white text-base px-3 py-2">
                      <Star className="w-4 h-4 mr-2" />
                      ফিচার্ড
                    </Badge>
                  )}
                  {product.is_latest && (
                    <Badge className="bg-green-500 text-white text-base px-3 py-2">
                      <Zap className="w-4 h-4 mr-2" />
                      নতুন
                    </Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge className="bg-purple-500 text-white text-base px-3 py-2">
                      <Award className="w-4 h-4 mr-2" />
                      বেস্ট সেলার
                    </Badge>
                  )}
                </div>

                {/* Share Button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="absolute top-6 right-6 w-12 h-12 p-0 bg-white/90 backdrop-blur-sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="p-8 lg:p-12 space-y-8 min-h-full flex flex-col justify-center">
              {/* Header */}
              <div className="space-y-6">
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                
                {product.category && (
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {product.category}
                  </Badge>
                )}

                <div className="flex items-center gap-6">
                  <div className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(price)}
                  </div>
                  {product.stock !== undefined && (
                    <div className={`text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `স্টকে আছে (${product.stock})` : 'স্টকে নেই'}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-8" />

              {/* Description */}
              {product.description && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">পণ্যের বিবরণ</h3>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">পরিমাণ</h3>
                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="w-16 h-16 p-0 text-xl"
                  >
                    <Minus className="w-7 h-7" />
                  </Button>
                  <span className="w-20 text-center font-bold text-3xl">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= (product.stock || 99)}
                    className="w-16 h-16 p-0 text-xl"
                  >
                    <Plus className="w-7 h-7" />
                  </Button>
                </div>
                
                {quantity > 1 && (
                  <div className="text-lg text-gray-600 dark:text-gray-300">
                    মোট দাম: <span className="font-semibold text-2xl text-blue-600 dark:text-blue-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-8" />

              {/* Features */}
              <div className="grid grid-cols-2 gap-8">
                <Card className="p-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-4 text-blue-700 dark:text-blue-300">
                    <Truck className="w-8 h-8" />
                    <span className="text-xl font-medium">দ্রুত ডেলিভারি</span>
                  </div>
                </Card>
                
                <Card className="p-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-4 text-green-700 dark:text-green-300">
                    <Shield className="w-8 h-8" />
                    <span className="text-xl font-medium">মান নিশ্চয়তা</span>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full h-20 text-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <ShoppingCart className="w-7 h-7 mr-4" />
                    {product.stock === 0 ? 'স্টকে নেই' : 'কার্টে যোগ করুন'}
                  </Button>

                  {onCustomize && (
                    <Button
                      variant="outline"
                      onClick={handleCustomize}
                      className="w-full h-20 text-xl border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
                    >
                      <Palette className="w-7 h-7 mr-4" />
                      কাস্টমাইজ করুন
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={handleWhatsAppOrder}
                  className="w-full h-20 text-xl border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
                >
                  <MessageCircle className="w-7 h-7 mr-4" />
                  WhatsApp এ অর্ডার করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
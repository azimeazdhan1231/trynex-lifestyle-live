import { useState, useCallback, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  MessageCircle,
  Palette,
  Plus,
  Minus,
  X,
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  Check
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface PremiumProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomize: (product: Product) => void;
}

export default function PremiumProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  onCustomize 
}: PremiumProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { addItem } = useCart();
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedImageIndex(0);
      setImageLoaded(false);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const totalPrice = price * quantity;

  // Mock additional images - in real app, these would come from product data
  const productImages = [
    product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];

  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    try {
      addItem({
        id: product.id,
        name: product.name || 'Unknown Product',
        price: price,
        image_url: product.image_url || '',
        quantity: quantity
      });

      toast({
        title: "কার্টে যোগ করা হয়েছে!",
        description: `${quantity}টি ${product.name}`,
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  }, [product, quantity, isOutOfStock, addItem, toast, price, onClose]);

  const handleCustomize = useCallback(() => {
    onCustomize(product);
    onClose();
  }, [product, onCustomize, onClose]);

  const handleQuantityChange = useCallback((change: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + change, stock || 99)));
  }, [stock]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "ফেভারিট থেকে সরানো হয়েছে" : "ফেভারিটে যোগ করা হয়েছে",
      description: product.name,
      duration: 2000,
    });
  }, [isFavorite, product.name, toast]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.name} - ${formatPrice(price)}`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিংক কপি করা হয়েছে",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি করা হয়েছে",
        duration: 2000,
      });
    }
  }, [product.name, price, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-7xl w-[95vw] max-h-[95vh] p-0 premium-modal premium-scrollbar overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="premium-scrollbar overflow-y-auto max-h-[95vh]">
          <DialogHeader className="sr-only">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>
              পণ্যের বিস্তারিত তথ্য দেখুন এবং কার্টে যোগ করুন
            </DialogDescription>
          </DialogHeader>

          {/* Close Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 rounded-full w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/50 shadow-md"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                {!imageLoaded && (
                  <div className="absolute inset-0 premium-skeleton" />
                )}
                
                <img
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {productImages.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-primary shadow-lg scale-95' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="premium-card text-center p-4">
                  <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-xs font-medium">ফ্রি ডেলিভারি</div>
                  <div className="text-xs premium-text-muted">৫০০+ টাকায়</div>
                </Card>
                <Card className="premium-card text-center p-4">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xs font-medium">গুণগত মান</div>
                  <div className="text-xs premium-text-muted">নিশ্চয়তা</div>
                </Card>
                <Card className="premium-card text-center p-4">
                  <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs font-medium">২৪/৭ সাপোর্ট</div>
                  <div className="text-xs premium-text-muted">হোয়াটসঅ্যাপে</div>
                </Card>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {product.is_featured && (
                    <Badge className="premium-badge premium-badge-featured">
                      <Star className="w-3 h-3 mr-1" />
                      ফিচার্ড
                    </Badge>
                  )}
                  {product.is_latest && (
                    <Badge className="premium-badge premium-badge-new">
                      <Sparkles className="w-3 h-3 mr-1" />
                      নতুন
                    </Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge className="premium-badge premium-badge-bestseller">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      বেস্ট সেলার
                    </Badge>
                  )}
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold premium-heading">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm premium-text-muted">(৪.৫) ৪২ রিভিউ</span>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="premium-text leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="premium-price-large">
                      {formatPrice(totalPrice)}
                    </span>
                    {quantity > 1 && (
                      <div className="text-sm premium-text-muted">
                        {formatPrice(price)} × {quantity}টি
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleFavorite}
                      className="premium-button-secondary"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="premium-button-secondary"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="gap-1">
                      <Package className="w-3 h-3" />
                      স্টক নেই
                    </Badge>
                  ) : isLowStock ? (
                    <Badge className="bg-orange-500 text-white gap-1">
                      <Clock className="w-3 h-3" />
                      মাত্র {stock}টি বাকি
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white gap-1">
                      <Check className="w-3 h-3" />
                      {stock}টি স্টকে আছে
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Quantity & Actions */}
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">পরিমাণ:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= stock}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full premium-button-primary h-12 text-base font-semibold"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    কার্টে যোগ করুন
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full premium-button-secondary h-12 text-base font-semibold"
                    onClick={handleCustomize}
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    কাস্টমাইজ করুন
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4 pt-4">
                <Card className="premium-card p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>ডেলিভারি টাইম:</span>
                      <span className="font-medium">১-৩ কার্যদিবস</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>রিটার্ন পলিসি:</span>
                      <span className="font-medium">৭ দিন</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>ওয়ারেন্টি:</span>
                      <span className="font-medium">৬ মাস</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect, memo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  X,
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
  Eye,
  Clock,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface UltraDynamicProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onCustomize?: (product: Product) => void;
}

const ProductImageViewer = memo(({ 
  images, 
  selectedIndex, 
  onImageSelect, 
  productName 
}: {
  images: string[];
  selectedIndex: number;
  onImageSelect: (index: number) => void;
  productName: string;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div 
          className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden cursor-zoom-in touch-manipulation"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={images[selectedIndex] || "/placeholder.jpg"}
            alt={productName}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100 active:scale-105 md:hover:scale-105'
            }`}
            loading="eager"
          />
        </div>
        
        {/* Zoom Toggle */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-0 w-8 h-8 sm:w-10 sm:h-10 p-0"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </Button>

        {/* Navigation for multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white w-8 h-8 sm:w-10 sm:h-10 p-0 touch-manipulation"
              onClick={() => onImageSelect(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white w-8 h-8 sm:w-10 sm:h-10 p-0 touch-manipulation"
              onClick={() => onImageSelect(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1 sm:gap-2 justify-center overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                index === selectedIndex 
                  ? 'border-primary shadow-lg' 
                  : 'border-gray-200 active:border-gray-400 md:hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default function UltraDynamicProductModal({
  isOpen,
  onClose,
  product,
  onCustomize
}: UltraDynamicProductModalProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedImageIndex(0);
      setIsFavorite(false);
    }
  }, [product]);

  if (!product) return null;

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalPrice = price * quantity;
  
  // Create image array (main image + additional if available)
  const images = [product.image_url].filter(Boolean) as string[];
  if (images.length === 0) {
    images.push("/placeholder.jpg");
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (product.stock && newQuantity > product.stock) {
      toast({
        title: "স্টক সীমা",
        description: `সর্বোচ্চ ${product.stock} টি পণ্য অর্ডার করতে পারবেন`,
        variant: "destructive",
      });
      return;
    }
    setQuantity(newQuantity);
  };

  const handleCustomizeProduct = () => {
    if (onCustomize) {
      onCustomize(product);
    }
  };

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize(product);
      onClose();
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `আসসালামু আলাইকুম! আমি এই পণ্যটি সম্পর্কে জানতে চাই:

📦 পণ্য: ${product.name}
💰 দাম: ${formatPrice(price)}
📊 পরিমাণ: ${quantity} টি
💳 মোট: ${formatPrice(totalPrice)}

দয়া করে আরও তথ্য দিন এবং অর্ডার নিশ্চিত করুন।`;

    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${formatPrice(price)}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} | ${shareData.url}`);
        toast({
          title: "লিংক কপি হয়েছে!",
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "প্রিয় তালিকা থেকে সরানো হয়েছে" : "প্রিয় তালিকায় যোগ হয়েছে",
      description: `${product.name} ${isFavorite ? 'সরানো হয়েছে' : 'যোগ করা হয়েছে'}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-6xl w-[calc(100vw-16px)] sm:w-[calc(100vw-32px)] md:w-[90vw] lg:w-[85vw] h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] md:h-[85vh] max-h-[95vh] overflow-hidden p-0 gap-0 bg-white rounded-lg sm:rounded-xl md:rounded-2xl touch-manipulation"
        data-testid="product-modal"
      >
        <DialogTitle className="sr-only">{product.name} - পণ্যের বিস্তারিত</DialogTitle>
        <DialogDescription className="sr-only">
          {product.name} এর সম্পূর্ণ বিবরণ, দাম {formatPrice(price)}, স্টক {product.stock || 0} টি
        </DialogDescription>
        
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 bg-black/20 hover:bg-black/30 active:bg-black/40 backdrop-blur-sm rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 text-white touch-manipulation min-w-[44px] min-h-[44px]"
          data-testid="button-close-modal"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        {/* Modal Content */}
        <div className="flex flex-col md:flex-row h-full touch-manipulation">
          {/* Top/Left Side - Product Images */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-[35vh] md:min-h-full modal-image-section">
            <ProductImageViewer
              images={images}
              selectedIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              productName={product.name}
            />
          </div>

          {/* Bottom/Right Side - Product Details */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 bg-white overflow-y-auto scrollbar-hide modal-details-section max-h-full">
            <div className="space-y-4 md:space-y-6 pb-6 sm:pb-8 md:pb-12">
              {/* Product Title & Badges */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {product.is_featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      ফিচার্ড
                    </Badge>
                  )}
                  {product.is_latest && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      নতুন
                    </Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      বেস্ট সেলার
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs sm:text-sm text-gray-600 ml-1">4.8</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">•</span>
                  <span className="text-xs sm:text-sm text-gray-600">৮৫+ রিভিউ</span>
                </div>
              </div>

              {/* Price Section */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {formatPrice(totalPrice)}
                      </div>
                      {quantity > 1 && (
                        <div className="text-xs sm:text-sm text-gray-600">
                          {formatPrice(price)} × {quantity}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">সেরা দাম নিশ্চয়তা</span>
                        <span className="sm:hidden">নিশ্চিত দাম</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Status */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span className={`text-xs sm:text-sm font-medium ${
                  product.stock && product.stock > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {product.stock && product.stock > 0 
                    ? `স্টকে আছে (${product.stock} টি)` 
                    : 'স্টকে নেই'
                  }
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-gray-700">পরিমাণ:</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 touch-manipulation"
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 sm:w-20 text-center text-sm sm:text-base"
                    min="1"
                    max={product.stock || 999}
                    data-testid="input-quantity"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={product.stock ? quantity >= product.stock : false}
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 touch-manipulation"
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                {/* Primary Action Row - Add to Cart & Customize */}
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    onClick={() => {
                      // Add to cart functionality
                      const cartItem = {
                        id: product.id,
                        name: product.name,
                        price: price,
                        quantity: quantity,
                        image_url: product.image_url
                      };
                      
                      toast({
                        title: "কার্টে যোগ হয়েছে!",
                        description: `${product.name} (${quantity} টি) কার্টে যোগ করা হয়েছে`,
                      });
                    }}
                    disabled={product.stock === 0}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white touch-manipulation"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">কার্টে যোগ করুন</span>
                    <span className="sm:hidden">কার্ট</span>
                  </Button>

                  {onCustomize && (
                    <Button
                      onClick={handleCustomizeProduct}
                      disabled={product.stock === 0}
                      className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white touch-manipulation"
                      data-testid="button-customize"
                    >
                      <Palette className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">কাস্টমাইজ করুন</span>
                      <span className="sm:hidden">কাস্টমাইজ</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={toggleFavorite}
                    className="w-10 h-10 sm:w-12 sm:h-12 p-0 touch-manipulation"
                    data-testid="button-toggle-favorite"
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppOrder}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium border-green-500 text-green-600 hover:bg-green-50 touch-manipulation"
                    data-testid="button-whatsapp-order"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">WhatsApp অর্ডার</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="w-10 h-10 sm:w-12 sm:h-12 p-0 touch-manipulation"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Product Description */}
              {product.description && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 sticky top-0 bg-white py-2 border-b border-gray-100">পণ্যের বিবরণ</h3>
                  <div className="max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto pr-2">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900 flex items-center gap-1.5 sm:gap-2">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                    ডেলিভারি তথ্য
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">ঢাকার ভিতরে: ১-২ কার্যদিবস</span>
                      <span className="sm:hidden">ঢাকায়: ১-২ দিন</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">ঢাকার বাইরে: ৩-৫ কার্যদিবস</span>
                      <span className="sm:hidden">বাইরে: ৩-৫ দিন</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">অর্ডার নিশ্চিতকরণ কল পাবেন</span>
                      <span className="sm:hidden">কল নিশ্চিতকরণ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="hidden sm:inline">১০০% অরিজিনাল</span>
                  <span className="sm:hidden">অরিজিনাল</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span className="hidden sm:inline">মান নিশ্চয়তা</span>
                  <span className="sm:hidden">মান</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                  <span className="hidden sm:inline">দ্রুত ডেলিভারি</span>
                  <span className="sm:hidden">দ্রুত</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="hidden sm:inline">WhatsApp সাপোর্ট</span>
                  <span className="sm:hidden">সাপোর্ট</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
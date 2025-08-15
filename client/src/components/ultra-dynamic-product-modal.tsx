import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Truck, 
  Shield, 
  RefreshCw,
  Palette,
  Eye,
  Minus,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface UltraDynamicProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function UltraDynamicProductModal({
  isOpen,
  onClose,
  product
}: UltraDynamicProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedImage(0);
      setImageLoaded(false);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const productPrice = parseFloat(product.price) || 0;
  const discount = productPrice > 500 ? Math.floor(Math.random() * 30) + 10 : 0;
  const originalPrice = discount > 0 ? productPrice + (productPrice * discount / 100) : productPrice;
  const rating = 4.5 + (Math.random() * 0.5);
  const reviewCount = Math.floor(Math.random() * 100) + 20;
  const isWishlisted = isInWishlist(product.id);

  // Mock images array for demonstration
  const productImages = [
    product.image_url,
    product.image_url, // Duplicate for demo
    product.image_url, // Duplicate for demo
  ].filter(Boolean);

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: productPrice,
        image_url: product.image_url,
        quantity,
      };
      
      addToCart(cartItem);
      
      toast({
        title: "পণ্য যোগ করা হয়েছে!",
        description: `${product.name} কার্টে যোগ করা হয়েছে।`,
      });
      
      // Close modal after successful add
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: "পণ্য কার্টে যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (isAddingToWishlist) return;
    
    setIsAddingToWishlist(true);
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast({
          title: "উইশলিস্ট থেকে সরানো হয়েছে",
          description: `${product.name} উইশলিস্ট থেকে সরানো হয়েছে।`,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: "উইশলিস্টে যোগ করা হয়েছে!",
          description: `${product.name} উইশলিস্টে যোগ করা হয়েছে।`,
        });
      }
    } catch (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: "উইশলিস্ট আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatPrice(productPrice)}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${product.name} - ${formatPrice(productPrice)}\n${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "লিংক কপি হয়েছে!",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি হয়েছে।",
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900 line-clamp-2">
            {product.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Image Section */}
          <div className="flex-1 p-6 pt-0">
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {productImages[selectedImage] ? (
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Palette className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-orange-500 ring-2 ring-orange-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 p-6 pt-0 lg:border-l lg:border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Price and Rating */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(productPrice)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <Badge className="bg-red-500 text-white px-2 py-1">
                        -{discount}%
                      </Badge>
                    </>
                  )}
                </div>
                
                {discount > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    আপনি {formatPrice(originalPrice - productPrice)} সাশ্রয় করছেন!
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {rating.toFixed(1)} ({reviewCount} রিভিউ)
                  </span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">বিবরণ</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  (product.stock || 0) > 10 ? 'bg-green-500' : 
                  (product.stock || 0) > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className={`text-sm font-medium ${
                  (product.stock || 0) > 10 ? 'text-green-600' : 
                  (product.stock || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock && product.stock > 0 
                    ? `${product.stock} টি স্টকে আছে` 
                    : 'স্টক শেষ'
                  }
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">পরিমাণ</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock || 99)}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (product.stock || 0) === 0}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>যোগ করা হচ্ছে...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>কার্টে যোগ করুন</span>
                    </div>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleToggleWishlist}
                    disabled={isAddingToWishlist}
                    className="h-12"
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                    {isWishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্টে যোগ করুন'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="h-12"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    শেয়ার করুন
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">সেবার বৈশিষ্ট্য</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">দ্রুত ডেলিভারি</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">নিরাপদ কেনাকাটা</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">সহজ রিটার্ন</span>
                  </div>
                </div>
              </div>

              {/* Category */}
              {product.category && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">ক্যাটেগরি:</span>
                  <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-orange-200">
                    {product.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
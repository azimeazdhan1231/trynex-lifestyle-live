import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  Eye, 
  ShoppingCart, 
  Palette, 
  Zap, 
  Award, 
  TrendingUp,
  Share2,
  Info
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";
import ImprovedCustomizeModal from './improved-customize-modal';
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

interface UltraResponsiveProductCardProps {
  product: Product;
  className?: string;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showBadge?: boolean;
  variant?: 'default' | 'featured' | 'compact' | 'list';
  priority?: boolean;
}

export default function UltraResponsiveProductCard({ 
  product, 
  className = "", 
  onViewProduct, 
  onCustomize,
  onAddToCart,
  showBadge = true,
  variant = 'default',
  priority = false
}: UltraResponsiveProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Memoized handlers for better performance
  const handleViewProduct = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewProduct(product);
  }, [onViewProduct, product]);

  const handleCustomize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCustomizeModal(true);
  }, []);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image_url: product.image_url,
        quantity: 1,
      };
      
      addToCart(cartItem);
      
      toast({
        title: "পণ্য যোগ করা হয়েছে!",
        description: `${product.name} কার্টে যোগ করা হয়েছে।`,
      });
      
      onAddToCart?.(product);
    } catch (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: "পণ্য কার্টে যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, isAddingToCart, onAddToCart, product, toast]);

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isInWishlist(product.id)) {
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
    }
  }, [addToWishlist, isInWishlist, product, removeFromWishlist, toast]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatPrice(parseFloat(product.price))}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${product.name} - ${formatPrice(parseFloat(product.price))}\n${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "লিংক কপি হয়েছে!",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি হয়েছে।",
      });
    }
  }, [product, toast]);

  // Product data calculations
  const productPrice = parseFloat(product.price) || 0;
  const discount = productPrice > 500 ? Math.floor(Math.random() * 30) + 10 : 0;
  const originalPrice = discount > 0 ? productPrice + (productPrice * discount / 100) : productPrice;
  const rating = 4.5 + (Math.random() * 0.5);
  const reviewCount = Math.floor(Math.random() * 100) + 20;
  const isWishlisted = isInWishlist(product.id);

  // Responsive card variants
  const cardVariants = {
    default: "w-full",
    featured: "w-full border-2 border-orange-200 shadow-lg",
    compact: "w-full max-w-xs",
    list: "w-full flex flex-col sm:flex-row"
  };

  const imageVariants = {
    default: "aspect-square",
    featured: "aspect-square",
    compact: "aspect-square",
    list: "aspect-square sm:aspect-[4/3] sm:w-48"
  };

  const contentVariants = {
    default: "p-4",
    featured: "p-4",
    compact: "p-3",
    list: "p-4 flex-1"
  };

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  return (
    <>
      <Card 
        className={`ultra-responsive-product-card group cursor-pointer transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 overflow-hidden bg-white border border-gray-200 hover:border-orange-300 relative ${cardVariants[variant]} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewProduct}
        data-testid={`card-product-${product.id}`}
      >
        {/* Product Image Container */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${imageVariants[variant]}`}>
          {product.image_url && !imageError ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading={priority ? "eager" : "lazy"}
                onLoad={handleImageLoad}
                onError={handleImageError}
                decoding="async"
                fetchPriority={priority ? "high" : "auto"}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <Palette className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Palette className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/20 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {showBadge && discount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1 animate-pulse">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1">
                <Award className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                নতুন
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isWishlisted 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              } backdrop-blur-sm ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              data-testid={`button-wishlist-${product.id}`}
              aria-label={isWishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`w-10 h-10 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500 backdrop-blur-sm transition-all duration-300 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              data-testid={`button-share-${product.id}`}
              aria-label="শেয়ার করুন"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Buttons - Mobile Optimized */}
          <div className={`absolute bottom-3 left-3 right-3 flex space-x-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleViewProduct}
              className="flex-1 bg-white/90 hover:bg-white text-gray-700 font-medium backdrop-blur-sm touch-manipulation"
              data-testid={`button-view-${product.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">দেখুন</span>
              <span className="sm:hidden">👁️</span>
            </Button>
            <Button
              size="sm"
              onClick={handleCustomize}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium touch-manipulation"
              data-testid={`button-customize-${product.id}`}
            >
              <Palette className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">কাস্টমাইজ</span>
              <span className="sm:hidden">🎨</span>
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <CardContent className={`space-y-3 ${contentVariants[variant]}`}>
          
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-orange-200">
              {product.category || 'পণ্য'}
            </Badge>
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-xs hidden sm:inline">({reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-2 hidden sm:block">
              {product.description}
            </p>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(productPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-sm text-gray-500 line-through hidden sm:inline">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  {formatPrice(originalPrice - productPrice)} সাশ্রয়!
                </div>
              )}
            </div>
            
            {/* Trending Indicator */}
            {rating > 4.7 && (
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="font-medium hidden sm:inline">জনপ্রিয়</span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : 
                product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`${
                product.stock > 10 ? 'text-green-600' : 
                product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {product.stock > 10 ? 'স্টকে আছে' : 
                 product.stock > 0 ? `${product.stock} টি বাকি` : 'স্টক শেষ'}
              </span>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium transition-all duration-300 group-hover:shadow-lg touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            size="sm"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            {product.stock === 0 ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
          </Button>

          {/* Mobile Quick Actions */}
          <div className="flex space-x-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProduct}
              className="flex-1 text-xs"
            >
              <Info className="w-3 h-3 mr-1" />
              বিস্তারিত
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomize}
              className="flex-1 text-xs"
            >
              <Palette className="w-3 h-3 mr-1" />
              কাস্টমাইজ
            </Button>
          </div>
        </CardContent>

        {/* Loading Overlay */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </Card>

      {/* Customization Modal */}
      <ImprovedCustomizeModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        product={product}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
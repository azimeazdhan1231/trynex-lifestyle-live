import React, { useState, useCallback } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import {
  Heart,
  Eye,
  ShoppingCart,
  Palette,
  Star,
  Zap,
  Award,
  TrendingUp,
  Share2,
  Info,
  Sparkles,
  Gift,
  Crown,
  Flame
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import PerfectCustomizeModal from './PerfectCustomizeModal';

interface PerfectProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'premium' | 'trending';
  priority?: boolean;
  className?: string;
}

export default function PerfectProductCard({ 
  product, 
  variant = 'default',
  priority = false,
  className = '' 
}: PerfectProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const isWishlisted = isInWishlist(product.id);
  const productPrice = parseFloat(product.price) || 0;
  
  // Dynamic pricing and badges based on product type
  const getProductType = () => {
    const name = product.name.toLowerCase();
    if (name.includes('mug') || name.includes('tumbler')) return 'drinkware';
    if (name.includes('shirt') || name.includes('hoodie') || name.includes('jacket')) return 'clothing';
    if (name.includes('canvas') || name.includes('photo') || name.includes('print')) return 'artwork';
    if (name.includes('phone') || name.includes('case')) return 'accessories';
    return 'custom';
  };

  const productType = getProductType();
  
  // Dynamic badges and features
  const getProductBadges = () => {
    const badges = [];
    if (productType === 'clothing') {
      badges.push({ text: 'Customizable', color: 'bg-blue-500', icon: Palette });
      badges.push({ text: 'Premium Fabric', color: 'bg-emerald-500', icon: Crown });
    } else if (productType === 'drinkware') {
      badges.push({ text: 'Heat Resistant', color: 'bg-orange-500', icon: Flame });
      badges.push({ text: 'Eco-Friendly', color: 'bg-green-500', icon: Gift });
    } else if (productType === 'artwork') {
      badges.push({ text: 'High Quality', color: 'bg-purple-500', icon: Award });
      badges.push({ text: 'Custom Design', color: 'bg-pink-500', icon: Sparkles });
    }
    return badges;
  };

  const badges = getProductBadges();

  // Dynamic pricing display
  const getPricingDisplay = () => {
    if (productType === 'clothing') {
      return {
        basePrice: productPrice,
        customizationFee: 15,
        totalPrice: productPrice + 15,
        savings: productPrice > 100 ? Math.floor(productPrice * 0.15) : 0
      };
    } else if (productType === 'drinkware') {
      return {
        basePrice: productPrice,
        customizationFee: 8,
        totalPrice: productPrice + 8,
        savings: productPrice > 50 ? Math.floor(productPrice * 0.10) : 0
      };
    } else {
      return {
        basePrice: productPrice,
        customizationFee: 12,
        totalPrice: productPrice + 12,
        savings: productPrice > 80 ? Math.floor(productPrice * 0.12) : 0
      };
    }
  };

  const pricing = getPricingDisplay();

  const handleAddToCart = useCallback(async () => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: pricing.totalPrice,
        image_url: product.image_url,
        quantity: 1,
        customization: {
          type: productType,
          basePrice: pricing.basePrice,
          customizationFee: pricing.customizationFee
        }
      };

      addToCart(cartItem);
      toast({
        title: "Added to Cart! 🛒",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  }, [addToCart, product, pricing, productType, toast]);

  const handleToggleWishlist = useCallback(async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} removed from wishlist.`,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: "Added to Wishlist! ❤️",
          description: `${product.name} added to wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    }
  }, [isWishlisted, removeFromWishlist, addToWishlist, product, toast]);

  const handleCustomize = useCallback(() => {
    setIsCustomizeOpen(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-200/50';
      case 'premium':
        return 'ring-2 ring-purple-400 shadow-lg shadow-purple-200/50';
      case 'trending':
        return 'ring-2 ring-red-400 shadow-lg shadow-red-200/50';
      default:
        return 'shadow-md hover:shadow-xl';
    }
  };

  const getVariantBadge = () => {
    switch (variant) {
      case 'featured':
        return { text: 'Featured', color: 'bg-yellow-500', icon: Star };
      case 'premium':
        return { text: 'Premium', color: 'bg-purple-500', icon: Crown };
      case 'trending':
        return { text: 'Trending', color: 'bg-red-500', icon: TrendingUp };
      default:
        return null;
    }
  };

  const variantBadge = getVariantBadge();

  return (
    <>
      <Card 
        className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 ${getVariantStyles()} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {/* Loading State */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              <div className="text-center">
                <Palette className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Image not available</p>
              </div>
            </div>
          ) : (
            <img
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading={priority ? 'eager' : 'lazy'}
            />
          )}

          {/* Overlay with badges and actions */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {variantBadge && (
                <Badge className={`${variantBadge.color} text-white border-0 shadow-lg`}>
                  <variantBadge.icon className="h-3 w-3 mr-1" />
                  {variantBadge.text}
                </Badge>
              )}
              {badges.slice(0, 2).map((badge, index) => (
                <Badge key={index} className={`${badge.color} text-white border-0 shadow-lg text-xs`}>
                  <badge.icon className="h-3 w-3 mr-1" />
                  {badge.text}
                </Badge>
              ))}
            </div>

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleWishlist}
                className={`h-9 w-9 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 ${
                  isWishlisted ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 text-gray-600"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Bottom action buttons */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <Button
                onClick={handleCustomize}
                className="flex-1 bg-white/90 hover:bg-white text-gray-800 font-semibold shadow-lg transition-all duration-200"
                size="sm"
              >
                <Palette className="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg transition-all duration-200"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Stock indicator */}
          {product.stock && product.stock < 10 && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-red-500 text-white border-0 shadow-lg">
                Only {product.stock} left!
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-3">
          {/* Product Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {productType}
            </Badge>
            {product.stock && product.stock > 50 && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                In Stock
              </Badge>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              (4.8 • 127 reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(pricing.totalPrice)}
              </span>
              {pricing.savings > 0 && (
                <Badge className="bg-green-100 text-green-800 border-0">
                  Save {formatPrice(pricing.savings)}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Base: {formatPrice(pricing.basePrice)} + Customization: {formatPrice(pricing.customizationFee)}
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Fast Delivery
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Quality Guarantee
            </div>
          </div>
        </CardContent>

        {/* Hover effect border */}
        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
          isHovered ? 'ring-2 ring-primary/50' : 'ring-0'
        }`} />
      </Card>

      {/* Customization Modal */}
      <PerfectCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        product={product}
        productType={productType}
        pricing={pricing}
      />
    </>
  );
} 
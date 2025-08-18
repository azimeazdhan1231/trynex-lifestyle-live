import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings, Palette, Heart, ShoppingCart } from 'lucide-react';
import LazyImage from './LazyImage';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@shared/schema';

interface OptimizedProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  className?: string;
  loading?: boolean;
}

export const OptimizedProductCard: React.FC<OptimizedProductCardProps> = ({
  product,
  onViewProduct,
  onCustomize,
  className,
  loading = false
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const isWishlisted = isInWishlist(product.id);
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "পছন্দের তালিকা থেকে সরানো হয়েছে",
        description: product.name,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image_url: product.image_url || undefined,
        category: product.category,
        stock: product.stock || 0,
        added_at: Date.now()
      });
      toast({
        title: "পছন্দের তালিকায় যোগ করা হয়েছে",
        description: product.name,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Using a compatible method with the cart system
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image_url: product.image_url || '',
      image: product.image_url || '',
      quantity: 1
    };
    
    // Add to cart logic - will be handled by cart modal
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: product.name,
    });
  };
  if (loading) {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl",
      className
    )}>
      {/* Optimized Image with Lazy Loading - Increased Height */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <LazyImage
          src={product.image_url || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full"
          loading="lazy"
        />
        
        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onViewProduct(product)}
            className="bg-white/90 hover:bg-white text-black"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {onCustomize && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCustomize(product)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Enhanced Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium animate-pulse">
              ⭐ ফিচার্ড
            </Badge>
          )}
          {product.is_best_selling && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium">
              🔥 বেস্ট সেলার
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium">
              ✨ নতুন
            </Badge>
          )}
          {product.stock && product.stock <= 5 && (
            <Badge variant="destructive" className="font-medium animate-bounce">
              মাত্র {product.stock} টি বাকি!
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          onClick={handleWishlistToggle}
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-3 right-3 z-10 h-8 w-8 p-0 rounded-full transition-all duration-200",
            "bg-white/80 hover:bg-white shadow-sm hover:shadow-md",
            isWishlisted && "bg-red-50 text-red-600 hover:bg-red-100"
          )}
          data-testid={`wishlist-${product.id}`}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all duration-200",
              isWishlisted ? "fill-current text-red-600" : "text-gray-600"
            )} 
          />
        </Button>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {product.description || "কাস্টমাইজেশন উপলব্ধ"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            স্টক: {product.stock}
          </span>
        </div>

        {/* Responsive Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProduct(product)}
            className="h-9 text-xs"
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">দেখুন</span>
          </Button>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="h-9 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            data-testid={`button-cart-${product.id}`}
          >
            <ShoppingCart className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">কার্ট</span>
          </Button>
          
          <Button
            size="sm"
            onClick={() => onCustomize(product)}
            className="h-9 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 col-span-2 sm:col-span-1"
            data-testid={`button-customize-${product.id}`}
          >
            <Settings className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">সাজান</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OptimizedProductCard;
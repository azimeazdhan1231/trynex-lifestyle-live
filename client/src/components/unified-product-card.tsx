import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Eye, Palette, ShoppingCart, Settings } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface UnifiedProductCardProps {
  product: Product;
  className?: string;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showBadge?: boolean;
}

export default function UnifiedProductCard({ 
  product, 
  className = "", 
  onViewProduct, 
  onCustomize,
  onAddToCart
}: UnifiedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [, setLocation] = useLocation();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewProduct(product);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCustomize(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast({
        title: "দুঃখিত, এই পণ্যটি স্টকে নেই",
        description: product.name,
        variant: "destructive",
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
    }

    toast({
      title: "পণ্য কার্টে যোগ করা হয়েছে",
      description: product.name,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "পছন্দের তালিকা থেকে সরানো হয়েছে",
        description: product.name,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image_url: product.image_url || undefined,
        category: product.category || undefined,
        stock: product.stock,
        added_at: Date.now()
      });
      toast({
        title: "পছন্দের তালিকায় যোগ করা হয়েছে",
        description: product.name,
      });
    }
  };

  const rating = 4.5; // Mock rating - replace with actual rating
  const reviewCount = 42; // Mock review count
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <Card 
      className={`uniform-product-card group cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-white border border-gray-200 hover:border-gray-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
      data-testid={`card-product-${product.id}`}
    >
        <div className="relative flex-shrink-0">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden bg-gray-50 relative">
            {product.image_url ? (
              <>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <Palette className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                <Palette className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_featured && (
              <Badge variant="destructive" className="text-xs">
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge variant="secondary" className="text-xs">
                নতুন
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                বেস্ট সেলার
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              size="sm"
              variant="secondary"
              className={`w-8 h-8 p-0 bg-white/95 hover:bg-white border border-gray-200 shadow-sm ${
                isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={handleToggleWishlist}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-white/95 hover:bg-white border border-gray-200 shadow-sm"
              onClick={handleViewProduct}
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </Button>
          </div>

          {/* Stock Status */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">স্টক নেই</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
          {/* Product Category */}
          <div className="min-h-[16px] mb-1">
            {product.category && (
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category}
              </p>
            )}
          </div>

          {/* Product Name - Fixed height */}
          <h3 
            className="font-medium text-gray-900 line-clamp-2 mb-2 hover:text-primary cursor-pointer responsive-text"
            onClick={handleViewProduct}
            style={{ minHeight: '40px', maxHeight: '40px', lineHeight: '1.25rem' }}
          >
            {product.name}
          </h3>

          {/* Rating - Fixed height */}
          <div className="flex items-center gap-1 mb-2" style={{ minHeight: '20px' }}>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {rating} ({reviewCount})
            </span>
          </div>

          {/* Price - Fixed height */}
          <div className="flex items-center justify-between mb-3" style={{ minHeight: '24px' }}>
            <div>
              <span className="text-base sm:text-lg font-bold text-gray-900 responsive-price">
                {formatPrice(parseFloat(product.price))}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              স্টক: {product.stock}
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1"></div>

          {/* Action Buttons - Fixed at bottom with responsive sizing */}
          <div className="p-2 sm:p-3 pt-0 product-card-actions">
            <div className="flex flex-col gap-1.5 w-full">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-1.5 sm:py-2 rounded-md transition-all duration-300 disabled:opacity-50 text-xs min-h-[28px] sm:min-h-[32px]"
                data-testid={`button-cart-${product.id}`}
              >
                <ShoppingCart className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{isOutOfStock ? 'স্টক নেই' : 'কার্টে যোগ করুন'}</span>
              </Button>

              <div className="flex gap-1.5 w-full">
                <Button
                  variant="outline"
                  onClick={handleCustomize}
                  className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 py-1.5 sm:py-2 rounded-md text-xs min-h-[28px] sm:min-h-[32px]"
                  data-testid={`button-customize-${product.id}`}
                >
                  <Palette className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">কাস্টমাইজ</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className={`px-2 py-1.5 sm:py-2 rounded-md transition-all duration-300 flex-shrink-0 min-h-[28px] sm:min-h-[32px] ${
                    isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : ''
                  }`}
                  data-testid={`button-wishlist-${product.id}`}
                >
                  <Heart 
                    className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
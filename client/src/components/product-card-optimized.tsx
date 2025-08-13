import { memo, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Eye, Zap, Palette } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

// Optimized lazy loading image component
const LazyImage = memo(({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`${className} bg-gray-100 relative overflow-hidden`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={hasError ? "/placeholder.jpg" : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
});

const ProductCard = memo(({ 
  product, 
  onQuickView, 
  onCustomize, 
  onToggleWishlist, 
  isInWishlist 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [, setLocation] = useLocation();

  const handleQuickView = useCallback(() => {
    onQuickView(product);
  }, [product, onQuickView]);

  const handleCustomize = useCallback(() => {
    onCustomize(product);
  }, [product, onCustomize]);

  const handleToggleWishlist = useCallback(() => {
    onToggleWishlist(product.id);
  }, [product.id, onToggleWishlist]);

  const handleViewDetails = useCallback(() => {
    setLocation(`/product/${product.id}`);
  }, [product.id, setLocation]);

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 border-0 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <LazyImage
            src={product.image_url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-red-500 text-white text-xs">ফিচার্ড</Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-green-500 text-white text-xs">নতুন</Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-blue-500 text-white text-xs">জনপ্রিয়</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-2 right-2 w-8 h-8 p-0 transition-all duration-200 ${
              isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>

          {/* Hover Actions */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-black hover:bg-gray-100"
                  onClick={handleViewDetails}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  দেখুন
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={handleCustomize}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  কাস্টমাইজ
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 cursor-pointer hover:text-primary transition-colors"
              onClick={handleViewDetails}
            >
              {product.name}
            </h3>
            <div className="flex items-center ml-2">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">4.8</span>
            </div>
          </div>

          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-gray-500">
                স্টক: {product.stock}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={handleCustomize}
            >
              <Palette className="w-4 h-4 mr-1" />
              কাস্টমাইজ করুন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = "ProductCard";
LazyImage.displayName = "LazyImage";

export default ProductCard;
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingCart, Star, TrendingUp, Sparkles, Settings, Palette } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface MobileEnhancedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  showBadge?: boolean;
}

const MobileEnhancedProductCard = memo(function MobileEnhancedProductCard({
  product,
  onAddToCart,
  onViewProduct,
  onCustomize,
  showBadge = true
}: MobileEnhancedProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleProductView = () => {
    onViewProduct(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomize) {
      onCustomize(product);
    }
  };

  // Placeholder for isOutOfStock and isWishlisted, assuming these would be derived from product or state
  const isOutOfStock = product.stock === 0;
  const isWishlisted = isFavorite; // Assuming isFavorite maps to isWishlisted for this example

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card
      className="group touch-button zoom-enabled bg-white border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 transform overflow-hidden"
      onClick={handleProductView}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        {/* Image Container with Perfect Aspect Ratio */}
        <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
          {!imageLoaded && (
            <div className="absolute inset-0 mobile-skeleton animate-pulse"></div>
          )}
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            data-testid={`img-product-${product.id}`}
          />
        </div>

        {/* Product Badges - Mobile Optimized */}
        {showBadge && (
          <div className="absolute top-2 left-2 space-y-1">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg text-xs px-2 py-1">
                <Star className="w-2.5 h-2.5 mr-1" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg text-xs px-2 py-1">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                নতুন
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg text-xs px-2 py-1">
                <TrendingUp className="w-2.5 h-2.5 mr-1" />
                বেস্ট সেলার
              </Badge>
            )}
          </div>
        )}

        {/* Stock Status - Mobile Optimized */}
        <div className="absolute top-2 right-2">
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white shadow-lg animate-pulse text-xs px-2 py-1">
              মাত্র {product.stock}টি
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-red-500 text-white shadow-lg text-xs px-2 py-1">
              স্টক নেই
            </Badge>
          )}
        </div>

        {/* Quick Action Button - Mobile Optimized */}
        <div className="absolute bottom-3 right-3">
          <Button
            onClick={handleToggleFavorite}
            size="sm"
            variant="outline"
            className={`w-10 h-10 p-0 bg-white/95 backdrop-blur-sm border-white/50 shadow-lg touch-button ${
              isFavorite ? 'text-red-500 border-red-200' : 'text-gray-600'
            }`}
            data-testid={`button-favorite-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="space-y-3">
          <h3
            className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight responsive-text-base"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>

          {/* Price Section - Enhanced for Mobile */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold text-green-600 responsive-text-lg"
                  data-testid={`text-price-${product.id}`}
                >
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Quick View Button */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-primary/10 touch-button"
              onClick={(e) => {
                e.stopPropagation();
                handleProductView();
              }}
              data-testid={`button-quick-view-${product.id}`}
            >
              <Eye className="w-4 h-4 text-primary" />
            </Button>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="p-2 sm:p-3 pt-0 product-card-actions">
            <div className="flex flex-col gap-1.5 w-full">
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium text-xs h-7 sm:h-8 touch-button"
                data-testid={`button-cart-${product.id}`}
              >
                <ShoppingCart className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{isOutOfStock ? 'স্টক নেই' : 'কার্টে যোগ করুন'}</span>
              </Button>

              <div className="flex gap-1.5 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCustomize}
                  className="flex-1 text-xs border-purple-500 text-purple-600 hover:bg-purple-50 touch-button h-7 sm:h-8"
                  data-testid={`button-customize-${product.id}`}
                >
                  <Settings className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">কাস্টমাইজ</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleToggleWishlist}
                  className={`px-2 h-7 sm:h-8 touch-button flex-shrink-0 ${isWishlisted ? 'text-red-500' : 'text-gray-500'}`}
                  data-testid={`button-wishlist-${product.id}`}
                >
                  <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>


          {/* Additional Product Info for Mobile */}
          {(product.category || product.description) && (
            <div className="pt-2 border-t border-gray-100">
              {product.category && (
                <p className="text-xs text-gray-500 mb-1">
                  ক্যাটেগরি: {product.category}
                </p>
              )}
              {product.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default MobileEnhancedProductCard;
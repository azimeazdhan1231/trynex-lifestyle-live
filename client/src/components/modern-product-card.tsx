import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Palette, Eye, Star, Zap, Settings } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface ModernProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

const ModernProductCard = memo(function ModernProductCard({
  product,
  onAddToCart,
  onCustomize,
  onViewDetails,
  onToggleWishlist,
  isInWishlist = false
}: ModernProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;
  const isOutOfStock = stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onCustomize(product);
    }
  };

  const handleViewDetails = () => {
    onViewDetails(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  return (
    <Card
      className="group overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg hover:shadow-orange-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
          )}

          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            data-testid={`img-product-${product.id}`}
          />

          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg px-2 py-1">
                <Star className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                বেস্ট সেলার
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="font-bold shadow-lg">
                স্টক শেষ
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <div className="absolute top-3 right-3">
            <Button
              variant="secondary"
              size="sm"
              className={`w-9 h-9 p-0 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border-0 transition-all duration-300 ${
                isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
              onClick={handleToggleWishlist}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Hover actions */}
          <div className={`absolute inset-x-4 bottom-4 transition-all duration-300 transform ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium h-10 shadow-lg"
                onClick={handleCustomize}
                disabled={isOutOfStock}
                data-testid={`button-customize-${product.id}`}
              >
                <Palette className="w-4 h-4 mr-2" />
                কাস্টমাইজ
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white font-medium h-10 shadow-lg"
                onClick={handleViewDetails}
                data-testid={`button-view-${product.id}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product details */}
        <CardContent className="p-4 space-y-3">
          {/* Product name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-5 min-h-[2.5rem]" data-testid={`text-name-${product.id}`}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">(4.8)</span>
          </div>

          {/* Price and stock */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-gray-900" data-testid={`text-price-${product.id}`}>
                {formatPrice(price)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              স্টক: <span className={stock < 5 ? 'text-orange-500 font-medium' : ''}>{stock}</span>
            </div>
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium h-10 shadow-lg"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            data-testid={`button-add-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'স্টক নেই' : 'কার্টে যোগ করুন'}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
});

ModernProductCard.displayName = "ModernProductCard";

export default ModernProductCard;
import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Zap,
  Award,
  Package,
  Clock
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface UltraResponsiveProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  className?: string;
}

const UltraResponsiveProductCard = memo(function UltraResponsiveProductCard({ 
  product, 
  onViewProduct, 
  onAddToCart, 
  onCustomize,
  className = "" 
}: UltraResponsiveProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  
  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCustomize) {
      onCustomize(product);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card 
      className={`group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white border-0 shadow-lg hover:shadow-primary/20 transform hover:-translate-y-2 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <img
            src={product.image_url || "/placeholder.jpg"}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>

        {/* Product Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg text-xs">
              <Star className="w-3 h-3 mr-1" />
              ফিচার্ড
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg text-xs">
              <Zap className="w-3 h-3 mr-1" />
              নতুন
            </Badge>
          )}
          {product.is_best_selling && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg text-xs">
              <Award className="w-3 h-3 mr-1" />
              বেস্ট সেলার
            </Badge>
          )}
        </div>

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center z-10">
            <Badge variant="destructive" className="text-sm font-bold">
              স্টক নেই
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 p-0 rounded-full transition-all duration-300 z-20 ${
            isHovered || isFavorite 
              ? 'bg-white/90 hover:bg-white shadow-lg' 
              : 'bg-white/60 hover:bg-white/80'
          }`}
          data-testid={`button-favorite-${product.id}`}
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`} 
          />
        </Button>

        {/* Quick Action Buttons - Shown on Hover */}
        <div className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewProduct}
            className="flex-1 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-0 font-medium"
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            দেখুন
          </Button>
          
          {onCustomize && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCustomize}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-lg font-medium"
              data-testid={`button-customize-${product.id}`}
            >
              কাস্টমাইজ
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight text-sm sm:text-base group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.8)</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">৮৫+ রিভিউ</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold text-primary">
              {formatPrice(price)}
            </div>
            {/* Original price (if on sale) */}
            {/* <div className="text-sm text-gray-400 line-through">
              {formatPrice(price * 1.2)}
            </div> */}
          </div>
          
          {/* Stock indicator */}
          <div className="text-right">
            <div className={`text-xs font-medium ${
              product.stock && product.stock > 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {product.stock && product.stock > 0 
                ? `স্টক: ${product.stock}` 
                : 'স্টক নেই'
              }
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium shadow-md"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            কার্টে যোগ করুন
          </Button>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            দ্রুত ডেলিভারি
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            ফ্রি শিপিং
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default UltraResponsiveProductCard;
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Plus, Eye, Sparkles, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface UnifiedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  showBadge?: boolean;
}

export default function UnifiedProductCard({ 
  product, 
  onAddToCart, 
  onViewProduct, 
  onCustomize, 
  showBadge = true 
}: UnifiedProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCardClick = () => {
    console.log("🔍 UnifiedProductCard: Card clicked, calling onViewProduct with:", product.name);
    console.log("🔍 UnifiedProductCard: Product data:", product);
    console.log("🔍 UnifiedProductCard: onViewProduct function:", onViewProduct);
    if (onViewProduct && typeof onViewProduct === 'function') {
      onViewProduct(product);
    } else {
      console.error("❌ onViewProduct function is not available or not a function");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCustomize(product);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("👁️ UnifiedProductCard: View details clicked for:", product.name);
    console.log("👁️ UnifiedProductCard: Product data:", product);
    console.log("👁️ UnifiedProductCard: onViewProduct function:", onViewProduct);
    if (onViewProduct && typeof onViewProduct === 'function') {
      onViewProduct(product);
    } else {
      console.error("❌ onViewProduct function is not available or not a function");
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden bg-white hover:border-primary/30 transform hover:-translate-y-1 cursor-pointer">
      <div className="relative" onClick={handleCardClick}>
        {/* Product Image - Mobile Optimized */}
        <div className="aspect-[4/5] overflow-hidden bg-gray-50">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500";
            }}
          />
        </div>

        {/* Product Badges */}
        {showBadge && (
          <div className="absolute top-3 left-3 space-y-2">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                নতুন
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                বেস্ট সেলার
              </Badge>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className="absolute top-3 right-3">
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white shadow-lg animate-pulse">
              মাত্র {product.stock}টি বাকি
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-red-500 text-white shadow-lg">
              স্টক নেই
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-3 right-3 w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Action Buttons Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/95 text-black hover:bg-white shadow-md font-medium"
              onClick={handleCustomize}
            >
              <Plus className="w-4 h-4 mr-1" />
              কাস্টমাইজ
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-md font-medium"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              অর্ডার
            </Button>
          </div>
          
          {/* View Details Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 bg-white/95 text-black hover:bg-white border-white/50 shadow-md font-medium"
            onClick={handleViewDetails}
          >
            <Eye className="w-4 h-4 mr-1" />
            বিস্তারিত দেখুন
          </Button>
        </div>
      </div>

      {/* Product Information */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">
                ৳{formatPrice(Number(product.price))}
              </span>
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-200 text-xs w-fit">
                  স্টকে আছে
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200 text-xs w-fit">
                  স্টক শেষ
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 font-medium">4.8</span>
              <span className="text-xs text-gray-400">(১২৩)</span>
            </div>
          </div>

          {/* Quick Action Buttons (Mobile) */}
          <div className="flex gap-2 sm:hidden">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleCustomize}
            >
              <Plus className="w-4 h-4 mr-1" />
              কাস্টমাইজ
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              অর্ডার
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:hidden"
            onClick={handleViewDetails}
          >
            <Eye className="w-4 h-4 mr-1" />
            বিস্তারিত দেখুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
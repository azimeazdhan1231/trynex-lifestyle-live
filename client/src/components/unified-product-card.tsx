import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye, Palette } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

interface UnifiedProductCardProps {
  product: Product;
  className?: string;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
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
  const [, setLocation] = useLocation();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      onAddToCart(product);
      console.log('Product added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewProduct(product);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCustomize) {
      onCustomize(product);
    }
  };

  const rating = 4.5; // Mock rating - replace with actual rating
  const reviewCount = 42; // Mock review count

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] mobile-transition overflow-hidden product-card premium-card border-0 shadow-lg hover:shadow-xl transform-gpu ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
      data-testid={`card-product-${product.id}`}
      style={{ 
        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      }}
    >
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingCart className="w-12 h-12" />
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
              className="w-8 h-8 p-0 bg-white/95 hover:bg-white border border-gray-200 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle wishlist
              }}
            >
              <Heart className="w-4 h-4 text-red-500" />
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
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">স্টক নেই</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4">
          {/* Product Category */}
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <h3 
            className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] hover:text-primary cursor-pointer responsive-text"
            onClick={handleViewProduct}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
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

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-base sm:text-lg font-bold text-gray-900 responsive-price">
                {formatPrice(parseFloat(product.price))}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              স্টক: {product.stock}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full transition-all duration-300 text-sm mobile-transition"
              size="sm"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              কার্টে যোগ করুন
            </Button>
            
            {/* View Details Button */}
            <div className="mobile-button-group grid grid-cols-2 gap-2">
              <Button
                onClick={handleViewProduct}
                variant="outline"
                size="sm"
                className="w-full mobile-transition"
                data-testid={`button-view-${product.id}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                দেখুন
              </Button>
              
              {onCustomize && (
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  size="sm"
                  className="w-full bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100"
                >
                  <Palette className="w-4 h-4 mr-1" />
                  কাস্টম
                </Button>
              )}
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
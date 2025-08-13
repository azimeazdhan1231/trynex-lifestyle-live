import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Eye, Palette } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

interface UnifiedProductCardProps {
  product: Product;
  className?: string;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  showBadge?: boolean;
}

export default function UnifiedProductCard({ 
  product, 
  className = "", 
  onViewProduct, 
  onCustomize 
}: UnifiedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [, setLocation] = useLocation();

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

  const rating = 4.5; // Mock rating - replace with actual rating
  const reviewCount = 42; // Mock review count

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-white border border-gray-200 hover:border-gray-300 h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
      data-testid={`card-product-${product.id}`}
      style={{ minHeight: '420px', height: '100%' }}
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

          {/* Action Buttons - Fixed at bottom */}
          <div className="space-y-2 mt-auto">
            <Button
              onClick={handleCustomize}
              className="w-full h-9 transition-all duration-300 text-sm mobile-transition bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              size="sm"
              data-testid={`button-customize-${product.id}`}
            >
              <Palette className="w-4 h-4 mr-2" />
              কাস্টমাইজ করুন
            </Button>
            
            {/* View Details Button */}
            <Button
              onClick={handleViewProduct}
              variant="outline"
              size="sm"
              className="w-full h-9 mobile-transition"
              data-testid={`button-view-${product.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              বিস্তারিত দেখুন
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}
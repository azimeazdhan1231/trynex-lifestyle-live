import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Eye, ShoppingCart, Palette, Zap, Award, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";
import ImprovedCustomizeModal from './improved-customize-modal';

interface UltraModernProductCardProps {
  product: Product;
  className?: string;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showBadge?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

export default function UltraModernProductCard({ 
  product, 
  className = "", 
  onViewProduct, 
  onCustomize,
  onAddToCart,
  showBadge = true,
  variant = 'default'
}: UltraModernProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewProduct(product);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCustomizeModal(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const rating = 4.5 + (Math.random() * 0.5); // Mock rating with slight variation
  const reviewCount = Math.floor(Math.random() * 100) + 20; // Mock review count
  const productPrice = parseFloat(product.price) || 0;
  const discount = productPrice > 500 ? Math.floor(Math.random() * 30) + 10 : 0;
  const originalPrice = discount > 0 ? productPrice + (productPrice * discount / 100) : productPrice;

  const cardVariants = {
    default: "w-full max-w-sm",
    featured: "w-full max-w-sm border-2 border-orange-200",
    compact: "w-full max-w-xs"
  };

  return (
    <>
    <Card 
      className={`ultra-modern-product-card group cursor-pointer transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 overflow-hidden bg-white border border-gray-200 hover:border-orange-300 relative ${cardVariants[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
      data-testid={`card-product-${product.id}`}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="aspect-square relative">
          {product.image_url ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <Palette className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Palette className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/20 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {showBadge && discount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1">
                <Award className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                নতুন
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            } backdrop-blur-sm ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            data-testid={`button-favorite-${product.id}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Action Buttons */}
          <div className={`absolute bottom-3 left-3 right-3 flex space-x-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleViewProduct}
              className="flex-1 bg-white/90 hover:bg-white text-gray-700 font-medium backdrop-blur-sm"
              data-testid={`button-view-${product.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              দেখুন
            </Button>
            <Button
              size="sm"
              onClick={handleCustomize}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
              data-testid={`button-customize-${product.id}`}
            >
              <Palette className="w-4 h-4 mr-1" />
              কাস্টমাইজ
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <CardContent className="p-4 space-y-3">

        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-orange-200">
            {product.category || 'পণ্য'}
          </Badge>
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 text-xs">({reviewCount})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(productPrice)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="text-xs text-green-600 font-medium">
                {formatPrice(originalPrice - productPrice)} সাশ্রয়!
              </div>
            )}
          </div>

          {/* Trending Indicator */}
          {rating > 4.7 && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">জনপ্রিয়</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium transition-all duration-300 group-hover:shadow-lg"
          size="sm"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          কার্টে যোগ করুন
        </Button>
      </CardContent>

      {/* Loading Overlay */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </Card>

    {/* Customization Modal */}
    <ImprovedCustomizeModal
      isOpen={showCustomizeModal}
      onClose={() => setShowCustomizeModal(false)}
      product={product}
      onAddToCart={onAddToCart}
    />
    </>
  );
}
import { useState, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Palette, 
  Sparkles, 
  TrendingUp,
  Clock,
  Package
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface PremiumProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onCustomize: (product: Product) => void;
  className?: string;
  showQuickActions?: boolean;
  variant?: "grid" | "list";
}

const PremiumProductCard = memo(function PremiumProductCard({ 
  product, 
  onViewDetails,
  onCustomize,
  className = "", 
  showQuickActions = true,
  variant = "grid"
}: PremiumProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    try {
      addToCart({
        id: product.id,
        name: product.name || 'Unknown Product',
        price: price,
        image: product.image_url || '',
        quantity: 1
      });

      toast({
        title: "কার্টে যোগ করা হয়েছে!",
        description: `${product.name}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  }, [product, isOutOfStock, addToCart, toast, price]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewDetails(product);
  }, [product, onViewDetails]);

  const handleCustomize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCustomize(product);
  }, [product, onCustomize]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "ফেভারিট থেকে সরানো হয়েছে" : "ফেভারিটে যোগ করা হয়েছে",
      description: product.name,
      duration: 2000,
    });
  }, [isFavorite, product.name, toast]);

  const productImage = product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";

  if (variant === "list") {
    return (
      <Card 
        className={`premium-card group cursor-pointer overflow-hidden ${className}`}
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-32 sm:h-40">
          {/* Image Section */}
          <div className="relative w-32 sm:w-40 flex-shrink-0">
            <div className="premium-product-card-image h-full">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 premium-skeleton" />
              )}
              <img
                src={imageError ? "/placeholder-product.jpg" : productImage}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-2 left-2 space-y-1">
              {product.is_featured && (
                <Badge className="premium-badge premium-badge-featured text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচার্ড
                </Badge>
              )}
              {product.is_latest && (
                <Badge className="premium-badge premium-badge-new text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  নতুন
                </Badge>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 premium-text">
                  {product.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 ml-2"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
              
              {product.category && (
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="premium-price text-lg">
                  {formatPrice(price)}
                </span>
                {isLowStock && (
                  <Badge variant="outline" className="text-xs text-orange-500 w-fit">
                    মাত্র {stock}টি
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCustomize}
                  className="premium-button-secondary"
                >
                  <Palette className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="premium-button-primary"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card 
      className={`premium-product-card group cursor-pointer ${className}`}
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className="premium-product-card-image relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 premium-skeleton" />
        )}
        
        <img
          src={imageError ? "/placeholder-product.jpg" : productImage}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Image Overlay */}
        <div className={`absolute inset-0 bg-black/0 transition-all duration-300 ${
          isHovered ? 'bg-black/10' : ''
        }`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {product.is_featured && (
            <Badge className="premium-badge premium-badge-featured">
              <Star className="w-3 h-3 mr-1" />
              ফিচার্ড
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="premium-badge premium-badge-new">
              <Sparkles className="w-3 h-3 mr-1" />
              নতুন
            </Badge>
          )}
          {product.is_best_selling && (
            <Badge className="premium-badge premium-badge-bestseller">
              <TrendingUp className="w-3 h-3 mr-1" />
              বেস্ট সেলার
            </Badge>
          )}
        </div>

        {/* Stock Status */}
        <div className="absolute top-3 right-3">
          {isOutOfStock && (
            <Badge variant="destructive" className="shadow-lg">
              স্টক নেই
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-orange-500 text-white shadow-lg animate-pulse">
              মাত্র {stock}টি
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          } ${isOutOfStock || isLowStock ? 'top-12' : ''}`}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleFavorite}
              className="w-9 h-9 p-0 bg-white/90 backdrop-blur-sm border-white/50 shadow-md"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              className="w-9 h-9 p-0 bg-white/90 backdrop-blur-sm border-white/50 shadow-md"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        )}

        {/* Hover Overlay Actions */}
        <div className={`absolute inset-x-3 bottom-3 transition-all duration-300 transform ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="flex gap-2">
            <Button
              className="flex-1 premium-button-primary h-9 text-sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              কার্টে যোগ করুন
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCustomize}
              className="h-9 px-3 bg-white/90 backdrop-blur-sm border-white/50 shadow-md"
            >
              <Palette className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Category */}
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-base leading-tight premium-text line-clamp-2">
            {product.name}
          </h3>
          
          {/* Description */}
          {product.description && (
            <p className="text-sm premium-text-muted line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Rating & Reviews (Placeholder) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs premium-text-muted">(৪.৫) ৪২ রিভিউ</span>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="premium-price-large">
                {formatPrice(price)}
              </span>
              {stock > 0 && (
                <span className="text-xs premium-text-muted">
                  {stock}টি স্টকে
                </span>
              )}
            </div>
            
            {!isHovered && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCustomize}
                  className="premium-button-secondary"
                >
                  <Palette className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="premium-button-primary"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PremiumProductCard;
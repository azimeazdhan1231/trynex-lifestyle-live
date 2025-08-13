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

interface PerfectResponsiveProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onCustomize: (product: Product) => void;
  className?: string;
}

const PerfectResponsiveProductCard = memo(function PerfectResponsiveProductCard({ 
  product, 
  onViewDetails,
  onCustomize,
  className = ""
}: PerfectResponsiveProductCardProps) {
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

  return (
    <Card 
      className={`
        perfect-product-card group cursor-pointer
        h-full flex flex-col
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1
        overflow-hidden bg-white
        border border-gray-200 hover:border-gray-300
        ${className}
      `}
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <img
          src={imageError ? "/placeholder-product.jpg" : productImage}
          alt={product.name}
          className={`
            w-full h-full object-cover 
            transition-all duration-500
            group-hover:scale-105
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Image Overlay */}
        <div className={`absolute inset-0 bg-black/0 transition-all duration-300 ${
          isHovered ? 'bg-black/10' : ''
        }`} />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
              <Star className="w-3 h-3 mr-1" />
              ফিচার্ড
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              নতুন
            </Badge>
          )}
          {product.is_best_selling && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              বেস্ট সেলার
            </Badge>
          )}
        </div>

        {/* Stock Status */}
        <div className="absolute top-2 right-2">
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs px-2 py-1">
              স্টক নেই
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-orange-500 text-white text-xs px-2 py-1 animate-pulse">
              মাত্র {stock}টি
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`
          absolute top-2 right-2 flex flex-col gap-2
          transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
          ${isOutOfStock || isLowStock ? 'top-10' : ''}
        `}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleFavorite}
            className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/50 shadow-md rounded-full"
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewDetails}
            className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/50 shadow-md rounded-full"
          >
            <Eye className="w-3 h-3 text-gray-600" />
          </Button>
        </div>

        {/* Hover Actions */}
        <div className={`
          absolute inset-x-2 bottom-2
          transition-all duration-300 transform
          ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-8 text-xs font-medium"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              কার্টে যোগ করুন
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCustomize}
              className="h-8 px-3 bg-white/90 backdrop-blur-sm border-white/50 shadow-md text-xs"
            >
              <Palette className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info - Flexible content area */}
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-between space-y-2">
          {/* Category */}
          {product.category && (
            <Badge variant="outline" className="text-xs w-fit">
              {product.category}
            </Badge>
          )}
          
          {/* Title - Fixed height with line clamp */}
          <h3 className="
            font-semibold text-sm leading-tight text-gray-900
            line-clamp-2 min-h-[2.5rem] flex items-start
          ">
            {product.name}
          </h3>
          
          {/* Description - Fixed height with line clamp */}
          {product.description && (
            <p className="
              text-xs text-gray-600
              line-clamp-2 min-h-[2rem] flex items-start
            ">
              {product.description}
            </p>
          )}

          {/* Rating & Reviews (Placeholder) */}
          <div className="flex items-center gap-2 min-h-[1.25rem]">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(৪.৫) ৪২ রিভিউ</span>
          </div>

          {/* Price & Stock - Fixed height */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                {formatPrice(price)}
              </span>
              {stock > 0 && (
                <span className="text-xs text-gray-500">
                  {stock}টি স্টকে
                </span>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="flex gap-1 sm:hidden">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCustomize}
                className="h-8 w-8 p-0"
              >
                <Palette className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PerfectResponsiveProductCard;
import { useState, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Palette } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface OptimizedProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  className?: string;
}

const OptimizedProductCard = memo(function OptimizedProductCard({ 
  product, 
  onViewDetails,
  onCustomize,
  className = ""
}: OptimizedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { addItem } = useCart();
  const { toast } = useToast();

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast({
        title: "দুঃখিত, এই পণ্যটি স্টকে নেই",
        description: product.name,
        variant: "destructive",
      });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image_url: product.image_url || undefined
    });
    
    toast({
      title: "পণ্য কার্টে যোগ করা হয়েছে",
      description: product.name,
    });
  }, [product, price, isOutOfStock, addItem, toast]);

  const handleCustomize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCustomize) {
      onCustomize(product);
    }
  }, [product, onCustomize]);

  const handleViewDetails = useCallback(() => {
    onViewDetails(product);
  }, [onViewDetails, product]);

  return (
    <Card 
      className={`group overflow-hidden border hover:shadow-xl transition-all duration-300 bg-white cursor-pointer ${className}`}
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        {/* Optimized Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <img
            src={product.image_url || "/placeholder.png"}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          
          {/* Stock Badge */}
          <div className="absolute top-3 left-3">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-xs font-medium">স্টকে নেই</Badge>
            ) : (
              <Badge className="text-xs font-medium bg-green-100 text-green-800">স্টকে আছে</Badge>
            )}
          </div>

          {/* Quick Actions on Hover */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewDetails}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
              data-testid="button-view-details"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            {/* Product Name */}
            <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mb-3">
              <div className="text-lg font-bold text-primary">
                {formatPrice(price)}
              </div>
              <span className="text-xs text-gray-500">{stock} টি স্টকে</span>
            </div>

            {/* Action Buttons - Responsive and Perfect Sizing */}
            <div className="mt-auto space-y-2">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full h-10 sm:h-11 font-medium text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isOutOfStock ? 'স্টকে নেই' : 'কার্টে যোগ করুন'}
              </Button>
              
              {onCustomize && (
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="w-full h-10 sm:h-11 font-medium text-sm transition-all duration-300"
                  data-testid="button-customize"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  কাস্টমাইজ করুন
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

export default OptimizedProductCard;
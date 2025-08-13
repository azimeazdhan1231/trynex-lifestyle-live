import { useState, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  TrendingUp,
  Package
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface CleanProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  className?: string;
  variant?: "grid" | "list";
}

const CleanProductCard = memo(function CleanProductCard({ 
  product, 
  onViewDetails,
  className = "", 
  variant = "grid"
}: CleanProductCardProps) {
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
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  }, [addToCart, product, price, isOutOfStock, toast]);

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "পছন্দের তালিকা থেকে সরানো হয়েছে" : "পছন্দের তালিকায় যোগ করা হয়েছে",
      description: product.name,
    });
  }, [isFavorite, product.name, toast]);

  const handleViewDetails = useCallback(() => {
    onViewDetails(product);
  }, [onViewDetails, product]);

  if (variant === "list") {
    return (
      <Card 
        className={`overflow-hidden border hover:shadow-lg transition-all duration-300 bg-white cursor-pointer ${className}`}
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`card-product-${product.id}`}
      >
        <div className="flex flex-row p-4">
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            
            {/* Overlay Badges */}
            <div className="absolute top-2 left-2">
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">স্টকে নেই</Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">কম স্টক</Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 ml-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.5</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">{stock} টি স্টকে</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-primary">
                {formatPrice(price)}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="h-8 w-8 p-0"
                  data-testid="button-toggle-favorite"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  size="sm"
                  className="px-4"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  কার্টে যোগ করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className={`group overflow-hidden border hover:shadow-xl transition-all duration-300 bg-white cursor-pointer ${className}`}
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <img
            src={product.image_url || "/placeholder.png"}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">স্টকে নেই</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">কম স্টক</Badge>
            )}
            {!isOutOfStock && !isLowStock && (
              <Badge className="text-xs bg-green-100 text-green-800">স্টকে আছে</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFavorite}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
              data-testid="button-toggle-favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </Button>
            
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

          {/* Trending Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="text-xs bg-blue-100 text-blue-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              জনপ্রিয়
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">(4.5)</span>
              </div>
              <span className="text-sm text-gray-500">{stock} টি স্টকে</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(price)}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full h-11 font-medium bg-primary hover:bg-primary/90 transition-colors"
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? 'স্টকে নেই' : 'কার্টে যোগ করুন'}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

export default CleanProductCard;
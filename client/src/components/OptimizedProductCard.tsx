import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Palette, Heart } from "lucide-react";
import LazyImage from "./LazyImage";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}

export default memo(function OptimizedProductCard({
  product,
  onAddToCart,
  onViewProduct,
  onCustomize
}: OptimizedProductCardProps) {
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md overflow-hidden bg-white">
      <div className="relative overflow-hidden">
        <LazyImage
          src={product.image_url || 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=No+Image'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
              ফিচার্ড
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
              নতুন
            </Badge>
          )}
        </div>

        {/* Stock status */}
        <div className="absolute top-2 right-2">
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white text-xs animate-pulse">
              মাত্র {product.stock}টি
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-red-500 text-white text-xs">
              স্টক নেই
            </Badge>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 bg-white/90 backdrop-blur-sm text-xs"
                onClick={() => onViewProduct(product)}
              >
                <Eye className="w-3 h-3 mr-1" />
                দেখুন
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 
            className="font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-primary transition-colors text-sm leading-tight"
            onClick={() => onViewProduct(product)}
          >
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
              স্টক: {product.stock}
            </Badge>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white text-sm py-2 transition-all duration-300"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
            </Button>

            {onCustomize && (
              <Button
                onClick={() => onCustomize(product)}
                variant="outline"
                className="w-full bg-purple-500 text-white hover:bg-purple-600 border-purple-500 text-sm py-2"
              >
                <Palette className="w-3 h-3 mr-1" />
                কাস্টমাইজ
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Settings, Palette } from 'lucide-react';
import LazyImage from './LazyImage';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import type { Product } from '@shared/schema';

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  className?: string;
  loading?: boolean;
}

export const OptimizedProductCard: React.FC<OptimizedProductCardProps> = ({
  product,
  onAddToCart,
  onViewProduct,
  onCustomize,
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl transform hover:scale-[1.02] lg:hover:scale-105",
      className
    )}>
      {/* Optimized Image with Lazy Loading - Increased Height */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <LazyImage
          src={product.image_url || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full"
          loading="lazy"
        />
        
        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onViewProduct(product)}
            className="bg-white/90 hover:bg-white text-black"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {onCustomize && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCustomize(product)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock > 0 ? `স্টক: ${product.stock}` : "স্টক নেই"}
          </Badge>
        </div>

        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-orange-500 text-white">
              ফিচার্ড
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {product.description || "কাস্টমাইজেশন উপলব্ধ"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            ৳{Number(product.price).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex space-x-2">
            {onCustomize && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCustomize(product)}
                className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
              >
                কাস্টমাইজ
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              কার্টে যোগ
            </Button>
          </div>
          
          {/* Always show customize option */}
          <Link href={`/customize/${product.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 border-0"
            >
              <Palette className="w-4 h-4 mr-2" />
              কাস্টম ডিজাইন করুন
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default OptimizedProductCard;
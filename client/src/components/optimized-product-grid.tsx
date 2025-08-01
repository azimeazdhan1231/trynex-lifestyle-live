import { memo, useState, useMemo, useCallback } from "react";
// Virtual scrolling grid for better performance - commenting out react-window for now
// import { FixedSizeGrid as Grid } from "react-window";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Zap } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface OptimizedProductGridProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  containerWidth: number;
  containerHeight: number;
}

interface ProductCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    columnsPerRow: number;
    onQuickView: (product: Product) => void;
    onCustomize: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    onToggleWishlist: (productId: string) => void;
    wishlist: string[];
  };
}

// Optimized product card component
interface ProductCellSimpleProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

const ProductCell = memo(({ product, onQuickView, onCustomize, onAddToCart, onToggleWishlist, isInWishlist }: ProductCellSimpleProps) => {
  return (
    <div className="p-2">
      <Card className="h-full group hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <img
              src={product.image_url || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_featured && (
                <Badge className="bg-red-500 text-white text-xs">ফিচার্ড</Badge>
              )}
              {product.is_latest && (
                <Badge className="bg-green-500 text-white text-xs">নতুন</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              size="sm"
              variant="ghost"
              className={`absolute top-2 right-2 w-8 h-8 p-0 ${
                isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-black hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                {product.name}
              </h3>
              <div className="flex items-center ml-2">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 ml-1">4.8</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-gray-500">
                স্টক: {product.stock}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                কার্ট
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(product);
                }}
              >
                <Zap className="w-3 h-3 mr-1" />
                অর্ডার
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ProductCell.displayName = "ProductCell";

const OptimizedProductGrid = memo(({
  products,
  onQuickView,
  onCustomize,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  containerWidth,
  containerHeight
}: OptimizedProductGridProps) => {
  // For now, use a simple grid layout until react-window is properly installed
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCell
          key={product.id}
          product={product}
          onQuickView={onQuickView}
          onCustomize={onCustomize}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={wishlist.includes(product.id)}
        />
      ))}
    </div>
  );
});

OptimizedProductGrid.displayName = "OptimizedProductGrid";

export default OptimizedProductGrid;
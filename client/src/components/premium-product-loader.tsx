import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Plus, Eye, Sparkles, TrendingUp, Zap, Gift } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface PremiumProductLoaderProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  showBadge?: boolean;
  maxCount?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

// Advanced loading skeleton with premium animations
const PremiumProductSkeleton = ({ index = 0 }: { index?: number }) => (
  <Card 
    className="group relative overflow-hidden border border-gray-100 bg-gradient-to-br from-white via-gray-50/50 to-white shadow-sm hover:shadow-lg transition-all duration-700 transform"
    style={{ 
      animationDelay: `${index * 150}ms`,
      animation: 'fadeInUp 0.8s ease-out forwards'
    }}
  >
    <div className="relative">
      {/* Premium Image Skeleton */}
      <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
        {/* Advanced Shimmer Wave */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-wave"
          style={{
            backgroundSize: '200% 100%',
            animation: `shimmer-wave ${2 + (index % 3) * 0.5}s infinite`
          }}
        />
        
        {/* Premium Floating Elements */}
        <div className="absolute top-4 left-4 w-4 h-4 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full animate-premium-pulse" />
        <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
        
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/5 animate-glow" />
      </div>
      
      {/* Premium Badge Skeleton */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100/80 via-orange-100/80 to-yellow-100/80 px-3 py-1 rounded-md backdrop-blur-sm border border-yellow-200/50 animate-premium-pulse">
          <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
          <div className="w-12 h-3 bg-gradient-to-r from-yellow-300/60 to-orange-300/60 rounded animate-shimmer" />
        </div>
      </div>

      {/* Premium Wishlist Skeleton */}
      <div className="absolute top-3 right-3 z-20">
        <div className="w-9 h-9 bg-white/95 rounded-full shadow-lg backdrop-blur-sm border border-gray-100/50 flex items-center justify-center animate-float">
          <Heart className="w-4 h-4 text-gray-300" />
        </div>
      </div>

      {/* Premium Action Buttons Overlay Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 h-8 bg-white/20 rounded-md animate-shimmer" />
          <div className="flex-1 h-8 bg-primary/30 rounded-md animate-shimmer" style={{ animationDelay: '0.2s' }} />
        </div>
        <div className="w-full h-8 bg-white/20 rounded-md animate-shimmer" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>

    <CardContent className="p-5 space-y-4">
      {/* Premium Title Skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-full bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer-wave" />
        <div className="h-4 w-3/4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-shimmer-wave" style={{ animationDelay: '0.3s' }} />
      </div>
      
      {/* Premium Price and Rating Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-20 bg-gradient-to-r from-primary/30 to-primary/50 rounded animate-shimmer-wave" />
          <div className="h-4 w-16 bg-emerald-100/80 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-200 animate-pulse" />
          <div className="h-4 w-8 bg-yellow-100 rounded animate-shimmer" />
          <div className="h-3 w-6 bg-gray-200 rounded animate-shimmer" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Premium Mobile Buttons Skeleton */}
      <div className="flex gap-3 sm:hidden">
        <div className="flex-1 h-9 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md animate-shimmer-wave" />
        <div className="flex-1 h-9 bg-gradient-to-r from-primary/30 to-primary/50 rounded-md animate-shimmer-wave" style={{ animationDelay: '0.3s' }} />
      </div>
      
      <div className="w-full h-9 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md sm:hidden animate-shimmer-wave" style={{ animationDelay: '0.5s' }} />
    </CardContent>

    {/* Premium Loading Pulse Animation */}
    <div className="absolute inset-0 pointer-events-none">
      <div 
        className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at ${50 + (index % 3) * 15}% ${40 + (index % 2) * 20}%, rgba(59,130,246,0.1) 0%, transparent 70%)`
        }}
      />
    </div>
  </Card>
);

// Premium loading state with enhanced visual feedback
const PremiumLoadingState = ({ count = 8, title = "পণ্য লোড হচ্ছে..." }) => (
  <div className="relative">
    {/* Premium Loading Header */}
    <div className="text-center mb-12">
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 rounded-full animate-premium-pulse flex items-center justify-center">
            <Gift className="w-8 h-8 text-white animate-float" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce">
            <Sparkles className="w-2 h-2 text-white m-1" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-gray-600 animate-pulse">সেরা পণ্য আনা হচ্ছে আপনার জন্য...</p>
        </div>
      </div>
      
      {/* Premium Progress Indicator */}
      <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full animate-shimmer-wave" />
      </div>
    </div>

    {/* Premium Product Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PremiumProductSkeleton key={index} index={index} />
      ))}
    </div>

    {/* Premium Loading Footer */}
    <div className="text-center mt-16">
      <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-100 via-white to-gray-100 px-8 py-4 rounded-full shadow-lg backdrop-blur-sm border border-gray-200/50 animate-float">
        <Zap className="w-5 h-5 text-primary animate-pulse" />
        <span className="text-gray-700 font-medium">প্রিমিয়াম কোয়ালিটি নিশ্চিত করা হচ্ছে...</span>
      </div>
    </div>
  </div>
);

export default function PremiumProductLoader({
  products,
  isLoading,
  onAddToCart,
  onViewProduct,
  onCustomize,
  showBadge = true,
  maxCount = 8,
  title = "প্রিমিয়াম পণ্য",
  subtitle = "আমাদের সেরা কালেকশন",
  className = ""
}: PremiumProductLoaderProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Progressive loading effect
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      setIsAnimating(true);
      
      // Stagger the product appearance for premium effect
      products.slice(0, maxCount).forEach((product, index) => {
        setTimeout(() => {
          setDisplayedProducts(prev => [...prev, product]);
        }, index * 100);
      });

      // Complete animation
      setTimeout(() => {
        setIsAnimating(false);
      }, products.length * 100 + 500);
    }
  }, [isLoading, products, maxCount]);

  if (isLoading) {
    return (
      <div className={`py-20 ${className}`}>
        <PremiumLoadingState count={maxCount} title={title} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`py-20 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
          <p className="text-gray-600">শীঘ্রই নতুন পণ্য যোগ করা হবে</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-20 relative ${className}`}>
      {/* Premium Section Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-emerald-600 rounded-full flex items-center justify-center animate-float">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        <div className="w-32 h-1 bg-gradient-to-r from-primary to-emerald-500 mx-auto mt-8 rounded-full" />
      </div>

      {/* Premium Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product, index) => (
          <div 
            key={product.id}
            className="transform transition-all duration-500"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.8s ease-out forwards'
            }}
          >
            <UnifiedProductCard
              product={product}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              onCustomize={onCustomize || (() => {})}
              showBadge={showBadge}
            />
          </div>
        ))}
      </div>

      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary/20 rounded-full animate-float" />
        <div className="absolute top-1/3 right-20 w-1 h-1 bg-emerald-300/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-yellow-200/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}

// Import UnifiedProductCard at the end to avoid circular imports
import UnifiedProductCard from './unified-product-card';
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface EnhancedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  onProductSelect?: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  className?: string;
}

// Enhanced Product Card Component
function EnhancedProductCard({ product, onProductSelect, onCustomize }: {
  product: Product;
  onProductSelect?: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}) {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    trackProductView(product.id, product.name || 'Unknown Product', product.category || 'uncategorized');
    
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      setLocation(`/product/${product.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name || 'Unknown Product',
      price: price,
    });

    trackAddToCart(product.id, product.name || 'Unknown Product', price);

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onCustomize) {
      onCustomize(product);
    } else {
      setLocation(`/customize/${product.id}`);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "পছন্দের তালিকা থেকে সরানো হয়েছে" : "পছন্দের তালিকায় যোগ করা হয়েছে",
      description: product.name || "পণ্য"
    });
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden border-0 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
          {!imageError && product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Overlay with Actions */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'bg-opacity-40' : 'bg-opacity-0'
          }`}>
            {/* Action Buttons */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-800"
                  onClick={handleViewProduct}
                  data-testid={`button-view-${product.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  দেখুন
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  data-testid={`button-cart-${product.id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {stock === 0 ? 'স্টক নেই' : 'কার্ট'}
                </Button>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-red-500 text-white text-xs">
                ফিচার্ড
              </Badge>
            )}
            {stock === 0 && (
              <Badge variant="destructive" className="text-xs">
                স্টক নেই
              </Badge>
            )}
            {stock > 0 && stock < 5 && (
              <Badge className="bg-orange-500 text-white text-xs">
                সীমিত স্টক
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-3 right-3 p-2 transition-colors ${
              isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={toggleFavorite}
            data-testid={`button-favorite-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-600 ml-1">(৪.৮)</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight" data-testid={`text-name-${product.id}`}>
            {product.name || 'Unnamed Product'}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>
          )}

          {/* Description */}
          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
            {product.description || 'পণ্যের বিস্তারিত বিবরণ শীঘ্রই যোগ করা হবে।'}
          </p>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-green-600" data-testid={`text-price-${product.id}`}>
                {formatPrice(price)}
              </span>
              {/* Optional: Show original price */}
              {price > 0 && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(price * 1.2)}
                </span>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-1 md:hidden">
              <Button
                size="sm"
                onClick={handleCustomize}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
                data-testid={`button-customize-${product.id}`}
              >
                কাস্টমাইজ
              </Button>
            </div>

            {/* Desktop Customize Button */}
            <Button
              size="sm"
              onClick={handleCustomize}
              className="hidden md:flex bg-purple-600 hover:bg-purple-700 text-white"
              data-testid={`button-customize-desktop-${product.id}`}
            >
              কাস্টমাইজ করুন
            </Button>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {stock > 0 ? `${stock}টি স্টকে আছে` : 'স্টক নেই'}
            </span>
            <span>ফ্রি ডেলিভারি</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton Component
function ProductCardSkeleton({ index }: { index: number }) {
  return (
    <Card className="overflow-hidden border-0 bg-white">
      <CardContent className="p-0">
        <div className="animate-pulse">
          {/* Image skeleton with staggered delay */}
          <div 
            className="aspect-[4/5] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-size-200"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Rating skeleton */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
              ))}
            </div>
            
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            
            {/* Category skeleton */}
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            
            {/* Description skeleton */}
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
            
            {/* Price and button skeleton */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Enhanced Product Grid Component
export default function EnhancedProductGrid({
  products,
  isLoading = false,
  error = null,
  onProductSelect,
  onCustomize,
  className = ""
}: EnhancedProductGridProps) {
  const [displayCount, setDisplayCount] = useState(12);

  // Memoize filtered products for performance
  const displayedProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 12, products.length));
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">পণ্য লোড করতে সমস্যা</h3>
          <p className="text-gray-600 mb-4">দুঃখিত, পণ্যগুলি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>
          <Button onClick={() => window.location.reload()}>
            আবার চেষ্টা করুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Products Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {/* Loading skeletons */}
        {isLoading && 
          Array.from({ length: 12 }, (_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} index={index} />
          ))
        }

        {/* Actual products */}
        {!isLoading && displayedProducts.map((product, index) => (
          <EnhancedProductCard
            key={product.id}
            product={product}
            onProductSelect={onProductSelect}
            onCustomize={onCustomize}
          />
        ))}
      </div>

      {/* Load More Button */}
      {!isLoading && products.length > displayCount && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="px-8 py-2"
            data-testid="button-load-more"
          >
            আরো পণ্য দেখুন ({products.length - displayCount}টি বাকি)
          </Button>
        </div>
      )}

      {/* No products message */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
          <p className="text-gray-600">দুঃখিত, আপনার খোঁজা পণ্য পাওয়া যায়নি। অন্য কিছু খুঁজে দেখুন।</p>
        </div>
      )}
    </div>
  );
}

// CSS for shimmer animation (inject into global styles)
export const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.bg-size-200 {
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Responsive grid improvements */
.xs\\:grid-cols-2 {
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;
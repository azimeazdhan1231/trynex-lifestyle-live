import React from 'react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Palette,
  Star,
  Zap
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  customizationOptions: {
    sizes: string[];
    colors: string[];
    materials: string[];
  };
}

interface PerfectProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onRemoveFromWishlist: (productId: number) => void;
  isInWishlist: boolean;
  isInCart: boolean;
}

export function PerfectProductCard({
  product,
  onAddToCart,
  onCustomize,
  onQuickView,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist,
  isInCart
}: PerfectProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clothing': return 'bg-blue-500';
      case 'drinkware': return 'bg-green-500';
      case 'artwork': return 'bg-purple-500';
      case 'accessories': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothing': return '👕';
      case 'drinkware': return '☕';
      case 'artwork': return '🎨';
      case 'accessories': return '📱';
      default: return '✨';
    }
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse" />
        )}
        
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoryColor(product.category)} text-white border-0 text-xs font-medium`}>
            {getCategoryIcon(product.category)} {product.category}
          </Badge>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 text-white border-0 text-xs font-medium">
              -{discount}%
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 text-gray-800 hover:bg-white"
            onClick={() => onQuickView(product)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 text-gray-800 hover:bg-white"
            onClick={() => onCustomize(product)}
          >
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => isInWishlist ? onRemoveFromWishlist(product.id) : onAddToWishlist(product)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isInWishlist 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onAddToCart(product)}
            disabled={isInCart}
          >
            {isInCart ? (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="px-3"
            onClick={() => onCustomize(product)}
          >
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Features */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Fast Delivery
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              4.9 (120)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
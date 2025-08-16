import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { optimizeImageUrl, createIntersectionObserver } from "@/lib/performance";
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star,
  Zap
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className = "" }: ProductCardProps) => {
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy loading with intersection observer
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image_url || "",
      quantity: 1
    });
  };

  const discountPercentage = Math.floor(Math.random() * 30) + 10; // Mock discount

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      whileHover={{ y: -5 }}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col ${className}`}
      data-testid={`product-card-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            {product.image_url && isVisible ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
                )}
                <img
                  src={optimizeImageUrl(product.image_url, 300, 80)}
                  alt={product.name}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ছবি নেই
                  </p>
                </div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-red-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচারড
                </Badge>
              )}
              {product.is_latest && (
                <Badge className="bg-green-500 text-white border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  নতুন
                </Badge>
              )}
              {product.is_best_selling && (
                <Badge className="bg-blue-500 text-white border-0">
                  বেস্ট সেলার
                </Badge>
              )}
            </div>

            {/* Discount Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-orange-500 text-white border-0">
                -{discountPercentage}%
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex space-x-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white"
                  data-testid={`product-quick-view-${product.id}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white"
                  data-testid={`product-wishlist-${product.id}`}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3 flex-grow flex flex-col">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-primary font-medium uppercase tracking-wide">
                {product.category}
              </p>
            )}

            {/* Product Name */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
              {product.name}
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                {product.description}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (৪.৮)
              </span>
            </div>

            {/* Spacer to push price to bottom */}
            <div className="flex-grow"></div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(parseFloat(product.price))}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ৳{Math.round(parseFloat(product.price) * 1.2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  স্টক: {product.stock} টি
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0 flex-shrink-0">
        <Button
          onClick={handleAddToCart}
          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
          variant="outline"
          data-testid={`add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          কার্টে যোগ করুন
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
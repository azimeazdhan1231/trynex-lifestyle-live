import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image_url: product.image_url || "",
        quantity: 1
      });

      // Show success toast
      toast({
        title: "কার্টে যোগ হয়েছে!",
        description: `${product.name} কার্টে যোগ করা হয়েছে`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const discountPercentage = Math.floor(Math.random() * 30) + 10; // Mock discount

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      whileHover={{ y: -5 }}
      className={`group card-enhanced card-hover-premium light-mode-card dark:card-enhanced rounded-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col ${className}`}
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

      {/* Action Buttons */}
      <div className="p-3 sm:p-4 pt-0 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:scale-100 btn-premium-light text-xs sm:text-sm"
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isAddingToCart ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{isAddingToCart ? 'যোগ করা হচ্ছে...' : 'কার্টে যোগ করুন'}</span>
            <span className="xs:hidden">{isAddingToCart ? 'যোগ...' : 'কার্ট'}</span>
          </Button>

          <Link href={`/customize/${product.id}`} className="flex-shrink-0">
            <Button
              variant="outline"
              className="px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 border-purple-500 text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white font-semibold text-xs sm:text-sm whitespace-nowrap"
              data-testid={`customize-${product.id}`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V9a2 2 0 00-2-2z" />
              </svg>
              <span className="hidden sm:inline">কাস্টমাইজ</span>
              <span className="sm:hidden">সাজান</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
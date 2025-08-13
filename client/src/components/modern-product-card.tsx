import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Package,
  Palette,
  Zap,
  TrendingUp
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ModernProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  className?: string;
  index?: number;
}

const ModernProductCard = memo(function ModernProductCard({ 
  product, 
  onViewDetails,
  onCustomize,
  className = "",
  index = 0
}: ModernProductCardProps) {
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
  const isTrending = product.is_best_selling;
  const isNew = product.is_latest;
  const isFeatured = product.is_featured;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart({
        id: product.id,
        name: product.name,
        price: price,
        image_url: product.image_url || '',
        quantity: 1
      });
      toast({
        title: "কার্টে যোগ করা হয়েছে",
        description: `${product.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
        duration: 2000,
      });
    }
  }, [product, addToCart, toast, isOutOfStock, price]);

  const handleCustomize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow customization for specific product types
    const customizableTypes = ['t-shirt', 'tshirt', 'mug', 'photo canvas', 'canvas'];
    const productName = product.name?.toLowerCase() || '';
    const productCategory = product.category?.toLowerCase() || '';
    
    const isCustomizable = customizableTypes.some(type => 
      productName.includes(type) || productCategory.includes(type)
    );
    
    if (isCustomizable) {
      // Navigate to customize page with product data
      window.location.href = `/customize?productId=${product.id}`;
    } else {
      toast({
        title: "কাস্টমাইজেশন উপলব্ধ নয়",
        description: "এই পণ্যটি কাস্টমাইজ করা যায় না",
        variant: "destructive"
      });
    }
  }, [product, toast]);

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

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`group overflow-hidden border-0 shadow-sm hover:shadow-xl bg-white cursor-pointer transform transition-all duration-300 rounded-2xl ${className}`}
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isOutOfStock && (
                <Badge className="bg-red-500/90 text-white font-medium text-xs px-2 py-1">
                  স্টকে নেই
                </Badge>
              )}
              {isNew && !isOutOfStock && (
                <Badge className="bg-green-500/90 text-white font-medium text-xs px-2 py-1">
                  নতুন
                </Badge>
              )}
              {isFeatured && !isOutOfStock && !isNew && (
                <Badge className="bg-blue-500/90 text-white font-medium text-xs px-2 py-1">
                  বিশেষ
                </Badge>
              )}
              {isTrending && !isOutOfStock && !isNew && !isFeatured && (
                <Badge className="bg-orange-500/90 text-white font-medium text-xs px-2 py-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  জনপ্রিয়
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge className="bg-amber-500/90 text-white font-medium text-xs px-2 py-1">
                  সীমিত স্টক
                </Badge>
              )}
            </div>

            {/* Top right actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFavorite}
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-red-500/90 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-white/90'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewDetails}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white/90 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Bottom action buttons - show on hover */}
            <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white backdrop-blur-sm border-0 font-medium text-xs"
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                কার্টে যোগ করুন
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Product name */}
            <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 leading-tight">
              {product.name}
            </h3>

            {/* Rating and stock info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">(4.0)</span>
              </div>
              <span className="text-xs text-gray-500">{stock} টি স্টকে</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-orange-600">
                  ৳{formatPrice(price)}
                </span>
                {product.category && (
                  <span className="text-xs text-gray-500 capitalize">
                    {product.category}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {isTrending && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">হট</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
});

export default ModernProductCard;
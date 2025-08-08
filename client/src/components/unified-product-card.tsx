import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Plus, Eye, Sparkles, TrendingUp, Zap, Palette, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

interface UnifiedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize: (product: Product) => void;
  showBadge?: boolean;
}

export default function UnifiedProductCard({ 
  product, 
  onAddToCart, 
  onViewProduct, 
  onCustomize, 
  showBadge = true 
}: UnifiedProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Intersection Observer for animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [, setLocation] = useLocation();

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔍 UnifiedProductCard: Card clicked, navigating to product page:", product.name);

    // Call the onViewProduct callback first if provided
    if (onViewProduct) {
      console.log("🔍 UnifiedProductCard: Calling onViewProduct callback");
      onViewProduct(product);
      return;
    }

    // Fallback to direct navigation
    try {
      console.log("🔍 UnifiedProductCard: Using direct navigation fallback");
      window.location.href = `/product/${product.id}`;
    } catch (error) {
      console.error('Error navigating to product:', error);
      setLocation(`/product/${product.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCustomize(product);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("👁️ UnifiedProductCard: View details clicked for:", product.name);

    // Call the onViewProduct callback first if provided
    if (onViewProduct) {
      console.log("👁️ UnifiedProductCard: Calling onViewProduct callback");
      onViewProduct(product);
      return;
    }

    // Fallback to direct navigation
    try {
      console.log("👁️ UnifiedProductCard: Using direct navigation fallback");
      window.location.href = `/product/${product.id}`;
    } catch (error) {
      console.error('Error navigating to product:', error);
      setLocation(`/product/${product.id}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Placeholder for WhatsApp order logic
    alert("WhatsApp order not implemented yet!");
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white border border-gray-200/50 hover:border-primary/30 hover-lift h-full flex flex-col rounded-xl shadow-sm hover:shadow-2xl hover:shadow-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex-shrink-0 overflow-hidden rounded-t-xl">
        {/* Premium Product Image with Progressive Loading */}
        <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
          {/* Image Loading Placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <div className="text-xs text-gray-400 font-medium">লোডিং...</div>
              </div>
            </div>
          )}

          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=750&q=80"}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ease-out transform
              ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
              ${isHovered ? 'scale-[1.08]' : 'scale-100'}
            `}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=750&q=80";
              setImageLoaded(true);
            }}
          />

          {/* Premium Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent transition-all duration-500 ease-out
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `} />
          
          {/* Premium Shine Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform transition-all duration-700 ease-out
            ${isHovered ? 'translate-x-full opacity-100' : '-translate-x-full opacity-0'}
          `} style={{ transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)' }} />
        </div>

        {/* Premium Product Badges with Animation */}
        {showBadge && (
          <div className="absolute top-3 left-3 space-y-2 z-10">
            {product.is_featured && (
              <Badge className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white font-bold shadow-lg backdrop-blur-sm border border-yellow-200/20 transition-all duration-300
                ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
              `}>
                <Star className="w-3 h-3 mr-1 animate-pulse" />
                ফিচার্ড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className={`bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg backdrop-blur-sm border border-blue-200/20 transition-all duration-300
                ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
              `}>
                <Sparkles className="w-3 h-3 mr-1 animate-bounce" />
                নতুন
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className={`bg-gradient-to-r from-green-500 via-emerald-500 to-emerald-600 text-white shadow-lg backdrop-blur-sm border border-green-200/20 transition-all duration-300
                ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
              `}>
                <TrendingUp className="w-3 h-3 mr-1 animate-pulse" />
                বেস্ট সেলার
              </Badge>
            )}
          </div>
        )}

        {/* Premium Stock Status */}
        <div className="absolute top-3 right-3 z-10">
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className={`bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse backdrop-blur-sm border border-orange-200/20 transition-all duration-300
              ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
            `}>
              <Zap className="w-3 h-3 mr-1" />
              মাত্র {product.stock}টি বাকি
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className={`bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg backdrop-blur-sm border border-red-200/20 transition-all duration-300
              ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
            `}>
              স্টক নেই
            </Badge>
          )}
        </div>

        {/* Premium Wishlist Button */}
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-3 right-3 w-9 h-9 p-0 rounded-full bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border border-gray-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20
            ${isFavorite ? 'text-red-500 bg-red-50/90 border-red-200/50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50/90'}
            ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
          `}
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : 'hover:scale-110'}`} />
        </Button>

        {/* Premium Action Buttons Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 transition-all duration-500 ease-out
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-white/95 hover:bg-white text-gray-900 shadow-xl font-medium border-0 backdrop-blur-md transition-all duration-300 hover:scale-105 rounded-lg"
                onClick={handleCustomize}
              >
                <Palette className="w-4 h-4 mr-1" />
                কাস্টমাইজ
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-xl font-medium transition-all duration-300 hover:scale-105 rounded-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                অর্ডার
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full bg-white/95 hover:bg-white text-gray-900 border-0 shadow-xl font-medium backdrop-blur-md transition-all duration-300 hover:scale-105 rounded-lg"
              onClick={handleViewDetails}
            >
              <Eye className="w-4 h-4 mr-1" />
              বিস্তারিত দেখুন
            </Button>
          </div>
        </div>

        {/* Premium Shine Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none
          ${isHovered ? 'animate-shine' : ''}
        `} />
      </div>

      {/* Premium Product Information */}
      <CardContent className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-4 flex-grow">
          {/* Premium Product Name */}
          <h3 className={`font-semibold text-gray-900 line-clamp-2 min-h-[3rem] leading-tight transition-all duration-300 text-base
            ${isHovered ? 'text-primary' : ''}
          `}>
            {product.name}
          </h3>

          {/* Category */}
          <div className="text-sm text-gray-500 font-medium">
            {product.category || 'পণ্য'}
          </div>

          {/* Premium Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className={`text-xl font-bold text-primary transition-all duration-300
                ${isHovered ? 'scale-105' : ''}
              `}>
                ৳{formatPrice(Number(product.price))}
              </span>
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 text-xs w-fit font-medium px-2 py-1">
                  ✅ স্টকে আছে
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50/50 text-xs w-fit font-medium px-2 py-1">
                  ❌ স্টক শেষ
                </Badge>
              )}
            </div>

            <div className={`flex items-center gap-1 transition-all duration-300
              ${isHovered ? 'scale-110' : ''}
            `}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              <span className="text-sm text-gray-700 font-bold">4.8</span>
              <span className="text-xs text-gray-500 font-medium">(১২৩)</span>
            </div>
          </div>

          {/* Action buttons - Mobile Optimized */}
          <div className="space-y-2.5 mt-auto">
            {/* Primary Add to Cart */}
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium py-3 rounded-lg btn-professional shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
            </Button>

            {/* Secondary Actions Row - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleViewDetails}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-medium py-2.5 sm:py-3 rounded-lg btn-professional text-xs sm:text-sm"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">বিস্তারিত</span>
                <span className="xs:hidden">দেখুন</span>
              </Button>

              <Button
                onClick={handleCustomize}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 font-medium py-2.5 sm:py-3 rounded-lg btn-professional shadow-md hover:shadow-lg text-xs sm:text-sm"
              >
                <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                কাস্টমাইজ
              </Button>
            </div>

            {/* WhatsApp Order */}
            <Button 
              onClick={handleWhatsAppOrder}
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 font-medium py-2.5 sm:py-3 rounded-lg btn-professional text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">হোয়াটসঅ্যাপে অর্ডার</span>
              <span className="sm:hidden">অর্ডার করুন</span>
            </Button>
          </div>
        </div>

        {/* Premium Card Background Effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 transition-opacity duration-500
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `} />
      </CardContent>
    </Card>
  );
}
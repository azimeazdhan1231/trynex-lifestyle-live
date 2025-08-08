import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Plus, Eye, Sparkles, TrendingUp, Zap } from "lucide-react";
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
    try {
      // Use direct navigation for better reliability
      window.location.href = `/product/${product.id}`;
    } catch (error) {
      console.error('Error navigating to product:', error);
      // Fallback to wouter navigation
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
    try {
      // Use direct navigation for better reliability
      window.location.href = `/product/${product.id}`;
    } catch (error) {
      console.error('Error navigating to product:', error);
      // Fallback to wouter navigation
      setLocation(`/product/${product.id}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card 
      ref={cardRef}
      className={`group hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden bg-white hover:border-primary/40 transform hover:-translate-y-2 cursor-pointer relative backdrop-blur-sm
        ${inView ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'}
        ${isHovered ? 'scale-[1.02] shadow-2xl' : ''}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="relative">
        {/* Premium Product Image with Progressive Loading */}
        <div className="aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
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
            className={`w-full h-full object-cover transition-all duration-700 transform
              ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
              ${isHovered ? 'scale-110' : 'scale-100'}
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
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300
            ${isHovered ? 'opacity-100' : ''}
          `} />
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
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0
        `}>
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/95 text-black hover:bg-white shadow-xl font-medium border border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={handleCustomize}
            >
              <Plus className="w-4 h-4 mr-1" />
              কাস্টমাইজ
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary shadow-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              অর্ডার
            </Button>
          </div>
          
          {/* Premium View Details Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-white/95 text-black hover:bg-white border-white/50 shadow-xl font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            onClick={handleViewDetails}
          >
            <Eye className="w-4 h-4 mr-1" />
            বিস্তারিত দেখুন
          </Button>
        </div>
        
        {/* Premium Shine Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none
          ${isHovered ? 'animate-shine' : ''}
        `} />
      </div>

      {/* Premium Product Information */}
      <CardContent className="p-5 relative">
        <div className="space-y-4">
          {/* Premium Product Name */}
          <h3 className={`font-bold text-gray-900 line-clamp-2 min-h-[3rem] leading-snug transition-all duration-300 text-lg
            ${isHovered ? 'text-primary scale-[1.02]' : ''}
          `}>
            {product.name}
          </h3>

          {/* Premium Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <span className={`text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent transition-all duration-300
                ${isHovered ? 'scale-110' : ''}
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

          {/* Premium Mobile Action Buttons */}
          <div className="flex gap-3 sm:hidden">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 font-medium border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
              onClick={handleCustomize}
            >
              <Plus className="w-4 h-4 mr-1" />
              কাস্টমাইজ
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              অর্ডার
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:hidden font-medium bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md"
            onClick={handleViewDetails}
          >
            <Eye className="w-4 h-4 mr-1" />
            বিস্তারিত দেখুন
          </Button>
        </div>
        
        {/* Premium Card Background Effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 transition-opacity duration-500
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `} />
      </CardContent>
    </Card>
  );
}
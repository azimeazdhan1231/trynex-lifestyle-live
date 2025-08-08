import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart, Eye, Palette } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@shared/schema';

interface DynamicProductCarouselProps {
  products: Product[];
  title?: string;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  className?: string;
}

export default function DynamicProductCarousel({
  products,
  title = "পণ্যসমূহ",
  onAddToCart,
  onViewProduct,
  onCustomize,
  className = ""
}: DynamicProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(320);
  const [visibleItems, setVisibleItems] = useState(1);

  // Calculate visible items and item width based on screen size
  useEffect(() => {
    const updateLayout = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.clientWidth;
        let items = 1;
        let width = 280;

        if (containerWidth >= 1280) {
          items = 4;
          width = Math.floor((containerWidth - 96) / 4); // 4 items with gaps
        } else if (containerWidth >= 1024) {
          items = 3;
          width = Math.floor((containerWidth - 72) / 3); // 3 items with gaps
        } else if (containerWidth >= 768) {
          items = 2;
          width = Math.floor((containerWidth - 48) / 2); // 2 items with gaps
        } else {
          items = 1;
          width = Math.min(320, containerWidth - 32); // 1 item with padding
        }

        setVisibleItems(items);
        setItemWidth(width);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleItems);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // Touch/mouse handlers for swipe functionality
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(currentIndex * (itemWidth + 24)); // 24px gap
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const x = clientX;
    const walk = (x - startX) * 2;
    const newScrollLeft = scrollLeft - walk;
    
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const x = clientX;
    const walk = x - startX;
    
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleEnd(e.clientX);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      handleEnd(e.changedTouches[0].clientX);
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (carouselRef.current && !isDragging) {
      const targetScroll = currentIndex * (itemWidth + 24);
      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, itemWidth, isDragging]);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && products.length > visibleItems) {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isDragging, products.length, visibleItems, maxIndex]);

  if (products.length === 0) return null;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="w-10 h-10 p-0 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="w-10 h-10 p-0 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing transition-all duration-300"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: isDragging ? 'auto' : 'smooth'
          }}
        >
          {products.map((product, index) => (
            <ProductCarouselCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              onCustomize={onCustomize}
              width={itemWidth}
              isVisible={index >= currentIndex && index < currentIndex + visibleItems}
            />
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary scale-125 shadow-lg' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductCarouselCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  width: number;
  isVisible: boolean;
}

function ProductCarouselCard({
  product,
  onAddToCart,
  onViewProduct,
  onCustomize,
  width,
  isVisible
}: ProductCarouselCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card 
      className={`flex-shrink-0 group relative overflow-hidden bg-white border border-gray-200/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-70 scale-95'
      }`}
      style={{ 
        width: `${width}px`,
        scrollSnapAlign: 'start',
        height: '480px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=750&q=80"}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=750&q=80";
            setImageLoaded(true);
          }}
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              ফিচার্ড
            </Badge>
          )}
          {product.is_latest && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
              নতুন
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-3 right-3 w-9 h-9 p-0 rounded-full bg-white/95 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 ${
            isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Quick Actions */}
        <div className={`absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ${
          isHovered ? 'translate-y-0' : 'translate-y-4'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white text-gray-900 shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {onCustomize && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(product);
              }}
            >
              <Palette className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-primary">
              ৳{formatPrice(Number(product.price))}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">4.8</span>
            </div>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium py-2 text-sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
        </Button>
      </CardContent>
    </Card>
  );
}
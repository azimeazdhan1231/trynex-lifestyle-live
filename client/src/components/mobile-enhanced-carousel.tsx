import { useState, useRef, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileEnhancedCarouselProps {
  children: React.ReactNode[];
  itemWidth?: number;
  gap?: number;
  showNavigation?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const MobileEnhancedCarousel = memo(function MobileEnhancedCarousel({
  children,
  itemWidth = 280,
  gap = 16,
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = ''
}: MobileEnhancedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Calculate visible items based on container width
  const [visibleItems, setVisibleItems] = useState(1);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const itemsPerView = Math.floor(containerWidth / (itemWidth + gap));
        setVisibleItems(Math.max(1, itemsPerView));
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, [itemWidth, gap]);

  // Update scroll buttons state
  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Handle scroll navigation
  const scrollTo = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    const scrollDistance = itemWidth + gap;
    const newScrollLeft = direction === 'left' 
      ? containerRef.current.scrollLeft - scrollDistance
      : containerRef.current.scrollLeft + scrollDistance;

    containerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    // Update current index
    const newIndex = Math.round(newScrollLeft / scrollDistance);
    setCurrentIndex(Math.max(0, Math.min(children.length - visibleItems, newIndex)));
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        if (canScrollRight) {
          scrollTo('right');
        } else {
          // Reset to beginning
          if (containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            setCurrentIndex(0);
          }
        }
      }, autoPlayInterval);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };

    startAutoPlay();

    // Pause on hover/touch
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', stopAutoPlay);
      container.addEventListener('mouseleave', startAutoPlay);
      container.addEventListener('touchstart', stopAutoPlay);
      container.addEventListener('touchend', startAutoPlay);
    }

    return () => {
      stopAutoPlay();
      if (container) {
        container.removeEventListener('mouseenter', stopAutoPlay);
        container.removeEventListener('mouseleave', startAutoPlay);
        container.removeEventListener('touchstart', stopAutoPlay);
        container.removeEventListener('touchend', startAutoPlay);
      }
    };
  }, [autoPlay, autoPlayInterval, canScrollRight]);

  // Touch/mouse drag functionality
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const x = clientX;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Buttons */}
      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="sm"
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 p-0 bg-white/95 border-gray-200 shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 ${
              !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 p-0 bg-white/95 border-gray-200 shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 ${
              !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={`flex overflow-x-auto scrollbar-hide swipe-enabled gap-4 pb-2 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x'
        }}
        onScroll={updateScrollButtons}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid="carousel-container"
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 swipe-item"
            style={{
              width: `${itemWidth}px`,
              scrollSnapAlign: 'start'
            }}
            data-testid={`carousel-item-${index}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      {children.length > visibleItems && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(children.length / visibleItems) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === Math.floor(currentIndex / visibleItems)
                  ? 'bg-primary w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                const targetIndex = index * visibleItems;
                const scrollDistance = targetIndex * (itemWidth + gap);
                containerRef.current?.scrollTo({
                  left: scrollDistance,
                  behavior: 'smooth'
                });
                setCurrentIndex(targetIndex);
              }}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MobileEnhancedCarousel;
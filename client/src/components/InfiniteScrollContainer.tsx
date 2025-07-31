import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfiniteScrollContainerProps {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  className?: string;
  threshold?: number; // Distance from bottom to trigger load
}

export const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  children,
  className,
  threshold = 200
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasNextPage) {
      onLoadMore();
    }
  }, [isLoadingMore, hasNextPage, onLoadMore]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [handleLoadMore, hasNextPage, isLoadingMore, threshold]);

  // Manual scroll detection as fallback
  useEffect(() => {
    const container = containerRef.current || window;
    
    const handleScroll = () => {
      const scrollTop = container === window 
        ? window.pageYOffset 
        : (container as HTMLElement).scrollTop;
      
      const scrollHeight = container === window 
        ? document.documentElement.scrollHeight 
        : (container as HTMLElement).scrollHeight;
      
      const clientHeight = container === window 
        ? window.innerHeight 
        : (container as HTMLElement).clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        handleLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleLoadMore, threshold]);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" />
      
      {/* Loading state */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">আরো পণ্য লোড হচ্ছে...</span>
          </div>
        </div>
      )}
      
      {/* Load more button (fallback) */}
      {hasNextPage && !isLoadingMore && (
        <div className="flex justify-center py-8">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="min-w-[200px]"
          >
            আরো পণ্য দেখুন
          </Button>
        </div>
      )}
      
      {/* End of content indicator */}
      {!hasNextPage && !isLoadingMore && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">সব পণ্য দেখানো হয়েছে</p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollContainer;
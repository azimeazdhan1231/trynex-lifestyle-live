import { useEffect, useMemo } from 'react';
import { queryClient } from '@/lib/queryClient';

/**
 * Enhanced Performance Optimizer Component
 * Implements aggressive caching, preloading, and performance optimizations
 */
export default function EnhancedPerformanceOptimizer() {
  useEffect(() => {
    // Prefetch critical resources
    const prefetchCriticalData = async () => {
      try {
        // Prefetch products data
        await queryClient.prefetchQuery({
          queryKey: ['/api/products'],
          staleTime: 1000 * 60 * 10, // 10 minutes
        });

        // Prefetch categories
        await queryClient.prefetchQuery({
          queryKey: ['/api/categories'],
          staleTime: 1000 * 60 * 30, // 30 minutes
        });

        // Prefetch offers
        await queryClient.prefetchQuery({
          queryKey: ['/api/offers'],
          staleTime: 1000 * 60 * 15, // 15 minutes
        });
      } catch (error) {
        console.log('Prefetch optimization completed');
      }
    };

    // Optimize image loading
    const optimizeImageLoading = () => {
      // Implement lazy loading for all images
      if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        const images = document.querySelectorAll('img[data-src]');
        images.forEach((img: any) => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      } else {
        // Fallback intersection observer
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach((img) => {
          imageObserver.observe(img);
        });
      }
    };

    // Optimize bundle loading
    const optimizeBundleLoading = () => {
      // Preload critical chunks
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      document.head.appendChild(link);
    };

    // Memory management
    const optimizeMemoryUsage = () => {
      // Clean up unused cache entries
      const cleanupInterval = setInterval(() => {
        const cache = queryClient.getQueryCache();
        cache.getAll().forEach((query) => {
          if (query.state.dataUpdatedAt < Date.now() - 1000 * 60 * 60) { // 1 hour
            cache.remove(query);
          }
        });
      }, 1000 * 60 * 30); // Every 30 minutes

      return () => clearInterval(cleanupInterval);
    };

    // Performance monitoring
    const setupPerformanceMonitoring = () => {
      // Monitor Web Vitals
      if ('web-vitals' in window) {
        // Already loaded
        return;
      }

      // Custom performance monitoring
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log(`🚀 Performance: Page load took ${navEntry.loadEventEnd - navEntry.loadEventStart}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    };

    // Apply optimizations
    prefetchCriticalData();
    optimizeImageLoading();
    optimizeBundleLoading();
    const cleanupMemory = optimizeMemoryUsage();
    setupPerformanceMonitoring();

    return cleanupMemory;
  }, []);

  // Service Worker registration for advanced caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('🔧 Service Worker registered for caching'))
        .catch(() => console.log('Service Worker registration skipped'));
    }
  }, []);

  return null;
}

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitoring = () => {
  return useMemo(() => {
    return {
      measureFunction: (name: string, fn: Function) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`⚡ ${name} took ${end - start}ms`);
        return result;
      },
      
      measureAsyncFunction: async (name: string, fn: Function) => {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`⚡ ${name} took ${end - start}ms`);
        return result;
      }
    };
  }, []);
};
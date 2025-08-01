// Advanced performance optimization utilities
import type { Product } from "@shared/schema";

// Memoization cache for expensive operations
const memoCache = new Map();

export class PerformanceOptimizer {
  // Debounce function calls to prevent excessive API requests
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle function calls for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memoize expensive product filtering operations
  static memoizeProductFilter(
    products: Product[],
    filterKey: string,
    filterFn: (products: Product[]) => Product[]
  ): Product[] {
    const cacheKey = `${filterKey}-${products.length}-${products[0]?.id || 'empty'}`;
    
    if (memoCache.has(cacheKey)) {
      return memoCache.get(cacheKey);
    }

    const result = filterFn(products);
    memoCache.set(cacheKey, result);

    // Clear cache after 5 minutes to prevent memory leaks
    setTimeout(() => memoCache.delete(cacheKey), 5 * 60 * 1000);

    return result;
  }

  // Preload critical resources
  static preloadCriticalResources() {
    // Preload important CSS classes
    const style = document.createElement('style');
    style.textContent = `
      .product-card { transform: translateZ(0); }
      .loading-skeleton { will-change: opacity; }
      .hero-section { contain: layout style paint; }
    `;
    document.head.appendChild(style);

    // Prefetch DNS for external resources
    const dnsPrefetch = [
      'https://images.unsplash.com',
      'https://fonts.googleapis.com'
    ];

    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  // Optimize images with modern formats and lazy loading
  static optimizeImageLoading() {
    // Enable lazy loading for all images below the fold
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  // Clean up memory and caches periodically
  static setupMemoryCleanup() {
    setInterval(() => {
      // Clear old memoization cache entries
      if (memoCache.size > 100) {
        const keys = Array.from(memoCache.keys());
        keys.slice(0, 50).forEach(key => memoCache.delete(key));
      }

      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  // Optimize database queries by batching requests
  static batchApiRequests<T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 3
  ): Promise<T[]> {
    const batches: Array<Array<() => Promise<T>>> = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }

    return batches.reduce(async (promiseChain, batch) => {
      const results = await promiseChain;
      const batchResults = await Promise.all(batch.map(req => req()));
      return [...results, ...batchResults];
    }, Promise.resolve([] as T[]));
  }
}
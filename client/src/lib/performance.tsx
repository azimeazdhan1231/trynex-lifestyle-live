// Performance optimization utilities

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}

// Image preloader for better UX
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Optimize images by adding query parameters
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return '/placeholder.jpg';
  
  try {
    const urlObj = new URL(url);
    
    // Add optimization parameters for supported services
    if (urlObj.hostname.includes('postimg.cc') || urlObj.hostname.includes('imgur.com')) {
      if (width) urlObj.searchParams.set('w', width.toString());
      if (height) urlObj.searchParams.set('h', height.toString());
    }
    
    return urlObj.toString();
  } catch {
    return url; // Return original if URL parsing fails
  }
}

// Chunk array for better rendering performance
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Virtual scrolling helper
export function calculateVisibleItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  buffer: number = 2
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + buffer * 2,
    Infinity
  );
  
  return { startIndex, endIndex };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  measureTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  }
  
  async measureAsyncTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  }
  
  logPageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          console.log('📊 Page Load Metrics:');
          console.log(`• DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.navigationStart}ms`);
          console.log(`• Load Complete: ${navigation.loadEventEnd - navigation.navigationStart}ms`);
          console.log(`• First Paint: ${performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A'}ms`);
          console.log(`• First Contentful Paint: ${performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A'}ms`);
        }, 0);
      });
    }
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.getInstance().logPageLoad();
}
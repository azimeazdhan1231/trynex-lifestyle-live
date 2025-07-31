// Performance monitoring utilities
export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface LoadingMetrics {
  productLoadTime: number;
  imageLoadTime: number;
  apiResponseTime: number;
  totalPageLoadTime: number;
}

// Web Vitals monitoring
export const measureWebVitals = (): Promise<Partial<PerformanceMetrics>> => {
  return new Promise((resolve) => {
    const metrics: Partial<PerformanceMetrics> = {};
    
    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      metrics.lcp = lastEntry.startTime;
      lcpObserver.disconnect();
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        metrics.fid = entry.processingStart - entry.startTime;
      });
      fidObserver.disconnect();
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
    
    // CLS - Cumulative Layout Shift
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      metrics.cls = clsScore;
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // Return metrics after a delay to capture initial measurements
    setTimeout(() => {
      clsObserver.disconnect();
      resolve(metrics);
    }, 5000);
  });
};

// Performance timing for custom events
export class PerformanceTimer {
  private startTimes = new Map<string, number>();
  
  start(label: string): void {
    this.startTimes.set(label, performance.now());
  }
  
  end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.startTimes.delete(label);
    
    // Log performance metric
    console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    
    return duration;
  }
  
  measure(label: string, fn: () => Promise<any>): Promise<any> {
    this.start(label);
    return fn().finally(() => {
      this.end(label);
    });
  }
}

// Global performance timer instance
export const performanceTimer = new PerformanceTimer();

// Monitor loading performance
export const monitorLoadingPerformance = (): LoadingMetrics => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    productLoadTime: 0, // Will be measured by specific components
    imageLoadTime: 0, // Will be measured by LazyImage component
    apiResponseTime: navigation.responseEnd - navigation.responseStart,
    totalPageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
    ttfb: navigation.responseStart - navigation.requestStart
  } as LoadingMetrics;
};

// Report performance metrics to analytics
export const reportPerformanceMetrics = async (metrics: Partial<PerformanceMetrics & LoadingMetrics>) => {
  try {
    // Send to Google Analytics if available
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        page_load_time: metrics.totalPageLoadTime,
        api_response_time: metrics.apiResponseTime
      });
    }
    
    // Send to internal analytics
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'performance_metric',
        metadata: metrics,
        page_url: window.location.pathname
      })
    }).catch(console.warn);
    
  } catch (error) {
    console.warn('Failed to report performance metrics:', error);
  }
};

// Check if performance is optimal
export const isPerformanceOptimal = (metrics: Partial<PerformanceMetrics>): boolean => {
  const thresholds = {
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1   // 0.1
  };
  
  return (
    (metrics.lcp === undefined || metrics.lcp <= thresholds.lcp) &&
    (metrics.fid === undefined || metrics.fid <= thresholds.fid) &&
    (metrics.cls === undefined || metrics.cls <= thresholds.cls)
  );
};

// Automatic performance monitoring setup
export const setupPerformanceMonitoring = () => {
  // Monitor Web Vitals
  measureWebVitals().then((metrics) => {
    reportPerformanceMetrics(metrics);
    
    if (!isPerformanceOptimal(metrics)) {
      console.warn('Performance metrics are below optimal thresholds:', metrics);
    }
  });
  
  // Monitor loading performance
  window.addEventListener('load', () => {
    const loadingMetrics = monitorLoadingPerformance();
    reportPerformanceMetrics(loadingMetrics);
  });
};
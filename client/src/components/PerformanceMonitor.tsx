
import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Navigation timing:', {
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstPaint: navEntry.responseEnd - navEntry.requestStart
          });
        }

        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
          // You can send this data to your analytics service
        }

        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }

        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      });
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for older browsers
      console.log('Performance Observer not supported');
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}

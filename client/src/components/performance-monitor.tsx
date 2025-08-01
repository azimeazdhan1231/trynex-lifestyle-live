import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const measureWebVitals = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Log initial page load
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            
            console.log('🚀 Page Performance Metrics:');
            console.log(`• DOM Load: ${navigation.domContentLoadedEventEnd - navigation.navigationStart}ms`);
            console.log(`• Total Load: ${navigation.loadEventEnd - navigation.navigationStart}ms`);
            console.log(`• First Paint: ${performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A'}ms`);
            
            // Track if we're meeting performance goals
            const totalLoad = navigation.loadEventEnd - navigation.navigationStart;
            if (totalLoad < 1000) {
              console.log('✅ Excellent load time (<1s)');
            } else if (totalLoad < 2000) {
              console.log('✅ Good load time (<2s)');
            } else {
              console.log('⚠️ Slow load time (>2s) - optimization needed');
            }
          }, 100);
        });
      }
    };

    measureWebVitals();
  }, []);

  return null;
}
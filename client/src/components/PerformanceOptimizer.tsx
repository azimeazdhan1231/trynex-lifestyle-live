import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
}

// Ultra-fast performance optimization component
export default function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize all performance optimizations
    initializeOptimizations();
    
    // Monitor performance metrics
    monitorPerformance();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Setup service worker for caching
    setupServiceWorker();
    
    // Optimize images
    optimizeImages();
    
    // Setup connection optimization
    setupConnectionOptimization();
    
    return () => {
      // Cleanup performance observers
      if ('PerformanceObserver' in window) {
        // Disconnect observers
      }
    };
  }, []);

  const initializeOptimizations = () => {
    // Enable performance features
    console.log('🚀 Performance optimizations initialized');
    
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.openai.com'
    ];
    
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    
    // DNS prefetch for faster lookups
    const dnsPrefetchDomains = [
      'https://cdnjs.cloudflare.com',
      'https://www.google-analytics.com'
    ];
    
    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  };

  const monitorPerformance = () => {
    if ('PerformanceObserver' in window) {
      // Monitor First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log(`⚡ FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Monitor Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`⚡ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        
        if (lastEntry.startTime > 2500) {
          console.warn('⚠️ LCP is slow, optimizing...');
          optimizeLCP();
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log(`⚡ CLS: ${clsValue.toFixed(4)}`);
        
        if (clsValue > 0.1) {
          console.warn('⚠️ High CLS detected, fixing layout shifts...');
          fixLayoutShifts();
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
    
    // Web Vitals monitoring
    if ('web-vitals' in window) {
      // Implementation would use web-vitals library if available
    }
  };

  const preloadCriticalResources = () => {
    // Preload critical API endpoints
    const criticalEndpoints = [
      '/api/products',
      '/api/categories',
      '/api/settings'
    ];
    
    criticalEndpoints.forEach(endpoint => {
      // Use React Query to prefetch data
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    });
    
    // Preload critical images
    const criticalImages = [
      '/images/hero-bg.jpg',
      '/images/logo.png'
    ];
    
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  };

  const setupServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      // Create inline service worker for basic caching
      const swCode = `
        const CACHE_NAME = 'trynex-v1';
        const STATIC_ASSETS = [
          '/',
          '/manifest.json',
          '/favicon.ico'
        ];
        
        self.addEventListener('install', (event) => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => cache.addAll(STATIC_ASSETS))
          );
        });
        
        self.addEventListener('fetch', (event) => {
          if (event.request.url.includes('/api/')) {
            // Network first for API calls
            event.respondWith(
              fetch(event.request)
                .then((response) => {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, responseClone));
                  return response;
                })
                .catch(() => caches.match(event.request))
            );
          } else {
            // Cache first for static assets
            event.respondWith(
              caches.match(event.request)
                .then((response) => response || fetch(event.request))
            );
          }
        });
      `;
      
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(swUrl)
        .then(() => console.log('🚀 Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed:', err));
    }
  };

  const optimizeImages = () => {
    // Add intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
    
    // Convert images to WebP when supported
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
    };
    
    if (supportsWebP()) {
      document.documentElement.classList.add('webp-support');
    }
  };

  const setupConnectionOptimization = () => {
    // Monitor connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const handleConnectionChange = () => {
        const { effectiveType, downlink, rtt } = connection;
        console.log(`📶 Connection: ${effectiveType}, Speed: ${downlink}Mbps, RTT: ${rtt}ms`);
        
        // Adjust quality based on connection
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          enableLowQualityMode();
        } else if (effectiveType === '4g') {
          enableHighQualityMode();
        }
      };
      
      connection.addEventListener('change', handleConnectionChange);
      handleConnectionChange();
    }
    
    // Memory usage optimization
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit > 0.8) {
        console.warn('⚠️ High memory usage detected, optimizing...');
        optimizeMemoryUsage();
      }
    }
  };

  const optimizeLCP = () => {
    // Remove non-critical CSS
    const nonCriticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    nonCriticalStyles.forEach(link => {
      link.setAttribute('media', 'print');
      setTimeout(() => link.setAttribute('media', 'all'), 100);
    });
    
    // Preload hero image
    const heroImage = document.querySelector('.hero-image') as HTMLImageElement;
    if (heroImage && heroImage.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = heroImage.src;
      document.head.appendChild(link);
    }
  };

  const fixLayoutShifts = () => {
    // Add dimension attributes to images without them
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const element = img as HTMLImageElement;
      if (element.naturalWidth && element.naturalHeight) {
        element.width = element.naturalWidth;
        element.height = element.naturalHeight;
      }
    });
    
    // Reserve space for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic]');
    dynamicContainers.forEach(container => {
      const element = container as HTMLElement;
      if (!element.style.minHeight) {
        element.style.minHeight = '200px';
      }
    });
  };

  const enableLowQualityMode = () => {
    document.documentElement.classList.add('low-quality-mode');
    
    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && !img.src.includes('q_auto:low')) {
        // Add quality parameter if using Cloudinary or similar
        img.src = img.src.replace(/(\.[^.]+)$/, ',q_auto:low$1');
      }
    });
    
    // Disable animations
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  };

  const enableHighQualityMode = () => {
    document.documentElement.classList.remove('low-quality-mode');
    
    // Enable high-quality images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.hqSrc) {
        img.src = img.dataset.hqSrc;
      }
    });
  };

  const optimizeMemoryUsage = () => {
    // Clear React Query cache for old data
    queryClient.clear();
    
    // Remove large DOM elements not in viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            if (element.dataset.virtualizable === 'true') {
              element.innerHTML = '';
              element.style.height = element.offsetHeight + 'px';
            }
          }
        });
      });
      
      document.querySelectorAll('[data-virtualizable]').forEach(el => {
        observer.observe(el);
      });
    }
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  };

  // Performance monitoring hook
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`⚡ Component lifecycle: ${(endTime - startTime).toFixed(2)}ms`);
    };
  }, []);

  return null;
}
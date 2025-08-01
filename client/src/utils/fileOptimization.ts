// File splitting and optimization utilities for maximum performance

import { lazy } from 'react';

// Lazy load components for code splitting
export const LazyComponents = {
  // Heavy components that can be loaded on demand
  AIChatbot: lazy(() => import('@/components/AIChatbot')),
  SmartSearch: lazy(() => import('@/components/SmartSearch')),
  AdminPanel: lazy(() => import('@/components/admin-panel-new')),
  ProductModal: lazy(() => import('@/components/product-modal')),
  CustomizeModal: lazy(() => import('@/components/customize-modal')),
  CheckoutModal: lazy(() => import('@/components/checkout-modal')),
  
  // Pages for route-based code splitting
  Products: lazy(() => import('@/pages/products')),
  About: lazy(() => import('@/pages/about')),
  Contact: lazy(() => import('@/pages/contact')),
  Profile: lazy(() => import('@/pages/profile')),
  Admin: lazy(() => import('@/pages/admin')),
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  const componentsToPreload = [
    () => import('@/components/product-modal'),
    () => import('@/components/cart-modal'),
  ];

  componentsToPreload.forEach(importFn => {
    importFn().catch(err => console.warn('Failed to preload component:', err));
  });
};

// Bundle analysis and optimization
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('📦 Bundle Analysis:');
    
    // Check which components are loaded
    const loadedModules = Array.from(document.querySelectorAll('script[src]'))
      .map(script => (script as HTMLScriptElement).src)
      .filter(src => src.includes('assets'))
      .length;
    
    console.log(`Loaded scripts: ${loadedModules}`);
    
    // Performance metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log(`DOM Ready: ${navigation.domContentLoadedEventEnd - navigation.fetchStart}ms`);
      console.log(`Load Complete: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
    }
  }
};

// Resource hints for better loading
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  const hints = [
    // Preconnect to external domains
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    
    // DNS prefetch for likely resources
    { rel: 'dns-prefetch', href: 'https://api.openai.com' },
    { rel: 'dns-prefetch', href: 'https://i.imgur.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};

// Tree shaking optimization helpers
export const optimizeImports = {
  // Only import what we need from lodash-like libraries
  debounce: (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle for scroll events
  throttle: (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Dynamic import helpers
export const dynamicImport = {
  // Import modules only when needed
  loadModule: async <T>(importFn: () => Promise<{ default: T }>): Promise<T> => {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      console.error('Failed to load module:', error);
      throw error;
    }
  },

  // Load multiple modules in parallel
  loadModules: async (importFns: Array<() => Promise<any>>) => {
    try {
      return await Promise.all(importFns.map(fn => fn()));
    } catch (error) {
      console.error('Failed to load modules:', error);
      throw error;
    }
  }
};

// Critical CSS extraction (for above-the-fold content)
export const criticalCSS = `
  /* Critical styles for immediate rendering */
  .hero-section {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    min-height: 60vh;
  }
  
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .product-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

// Initialize all optimizations
export const initializeOptimizations = () => {
  // Add resource hints
  addResourceHints();
  
  // Preload critical components
  preloadCriticalComponents();
  
  // Start bundle analysis in dev mode
  if (import.meta.env.DEV) {
    setTimeout(analyzeBundleSize, 2000);
  }
  
  // Add critical CSS
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};
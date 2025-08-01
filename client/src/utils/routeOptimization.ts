// Route-based code splitting and optimization for ultra-fast navigation

// Route preloading configuration
export const ROUTE_PRELOAD_CONFIG = {
  // Critical routes that should be preloaded immediately
  critical: [
    '/products',
    '/cart',
  ],
  
  // Routes to preload on user interaction
  onHover: [
    '/about',
    '/contact',
    '/profile',
  ],
  
  // Routes to preload when idle
  idle: [
    '/admin',
    '/orders',
    '/tracking',
  ]
};

// Simple route optimization without complex lazy loading

// Route preloader class
export class RoutePreloader {
  private static instance: RoutePreloader;
  private preloadedRoutes = new Set<string>();
  private preloadTimeout: NodeJS.Timeout | null = null;

  static getInstance(): RoutePreloader {
    if (!RoutePreloader.instance) {
      RoutePreloader.instance = new RoutePreloader();
    }
    return RoutePreloader.instance;
  }

  // Preload critical routes immediately
  preloadCriticalRoutes() {
    ROUTE_PRELOAD_CONFIG.critical.forEach(route => {
      this.preloadRoute(route);
    });
  }

  // Preload route on user interaction (hover, focus)
  preloadOnInteraction(route: string) {
    if (ROUTE_PRELOAD_CONFIG.onHover.includes(route)) {
      this.preloadRoute(route);
    }
  }

  // Preload routes when browser is idle
  preloadOnIdle() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        ROUTE_PRELOAD_CONFIG.idle.forEach(route => {
          this.preloadRoute(route);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      this.preloadTimeout = setTimeout(() => {
        ROUTE_PRELOAD_CONFIG.idle.forEach(route => {
          this.preloadRoute(route);
        });
      }, 2000);
    }
  }

  private preloadRoute(route: string) {
    if (this.preloadedRoutes.has(route)) return;

    // Map routes to their import functions
    const routeImports: Record<string, () => Promise<any>> = {
      '/products': () => import('@/pages/products'),
      '/about': () => import('@/pages/about'),
      '/contact': () => import('@/pages/contact'),
      '/profile': () => import('@/pages/profile'),
      '/admin': () => import('@/pages/admin'),
      '/orders': () => import('@/pages/orders'),
      '/tracking': () => import('@/pages/tracking'),
      '/cart': () => import('@/components/cart-modal'),
    };

    const importFn = routeImports[route];
    if (importFn) {
      importFn()
        .then(() => {
          this.preloadedRoutes.add(route);
          console.log(`✅ Route preloaded: ${route}`);
        })
        .catch(error => {
          console.warn(`❌ Route preload failed: ${route}`, error);
        });
    }
  }

  // Clean up timeouts
  cleanup() {
    if (this.preloadTimeout) {
      clearTimeout(this.preloadTimeout);
      this.preloadTimeout = null;
    }
  }
}

// Route transition optimization
export const optimizeRouteTransition = (from: string, to: string) => {
  // Add loading state classes for smooth transitions
  document.body.classList.add('route-transitioning');
  
  // Remove loading state after transition
  setTimeout(() => {
    document.body.classList.remove('route-transitioning');
  }, 300);

  // Track route changes for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to,
      page_title: document.title,
    });
  }
};

// Smart prefetching based on user behavior
export class SmartPrefetcher {
  private static instance: SmartPrefetcher;
  private userBehavior: { [route: string]: number } = {};
  private currentRoute: string = '/';

  static getInstance(): SmartPrefetcher {
    if (!SmartPrefetcher.instance) {
      SmartPrefetcher.instance = new SmartPrefetcher();
    }
    return SmartPrefetcher.instance;
  }

  // Track user navigation patterns
  trackNavigation(route: string) {
    this.userBehavior[route] = (this.userBehavior[route] || 0) + 1;
    this.currentRoute = route;
    
    // Predict and preload likely next routes
    this.predictAndPreload();
  }

  private predictAndPreload() {
    // Simple prediction based on common navigation patterns
    const predictions: { [route: string]: string[] } = {
      '/': ['/products', '/about'],
      '/products': ['/cart', '/profile'],
      '/about': ['/contact', '/products'],
      '/contact': ['/products', '/'],
    };

    const likelyRoutes = predictions[this.currentRoute] || [];
    likelyRoutes.forEach(route => {
      RoutePreloader.getInstance().preloadRoute(route);
    });
  }

  // Get most visited routes for prioritized preloading
  getMostVisitedRoutes(limit = 3): string[] {
    return Object.entries(this.userBehavior)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([route]) => route);
  }
}

// Initialize route optimizations
export const initializeRouteOptimizations = () => {
  const preloader = RoutePreloader.getInstance();
  const prefetcher = SmartPrefetcher.getInstance();

  // Preload critical routes
  preloader.preloadCriticalRoutes();
  
  // Setup idle preloading
  preloader.preloadOnIdle();

  // Add hover listeners for route preloading
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement;
    if (link && link.href) {
      const route = new URL(link.href).pathname;
      preloader.preloadOnInteraction(route);
    }
  });

  // Track route changes
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      optimizeRouteTransition(currentPath, window.location.pathname);
      prefetcher.trackNavigation(window.location.pathname);
      currentPath = window.location.pathname;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    preloader.cleanup();
    observer.disconnect();
  });

  console.log('🚀 Route optimizations initialized');
};
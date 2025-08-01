
// Product preloader for instant loading
class ProductPreloader {
  private static instance: ProductPreloader;
  private preloadPromise: Promise<any> | null = null;
  private preloadedData: any = null;

  static getInstance(): ProductPreloader {
    if (!ProductPreloader.instance) {
      ProductPreloader.instance = new ProductPreloader();
    }
    return ProductPreloader.instance;
  }

  // Preload products immediately when the app starts
  async preloadProducts(): Promise<void> {
    if (this.preloadPromise) return this.preloadPromise;

    this.preloadPromise = this.fetchAndCacheProducts();
    return this.preloadPromise;
  }

  private async fetchAndCacheProducts(): Promise<void> {
    try {
      // Check if we already have cached data
      const CACHE_KEY = 'products-cache-all';
      
      // Try session cache first
      try {
        const sessionCached = sessionStorage.getItem(CACHE_KEY);
        if (sessionCached) {
          this.preloadedData = JSON.parse(sessionCached);
          console.log('⚡ Products preloaded from session cache');
          return;
        }
      } catch (e) {}

      // Try localStorage
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year
          if (Date.now() - timestamp < CACHE_DURATION) {
            this.preloadedData = data;
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            console.log('⚡ Products preloaded from localStorage');
            return;
          }
        }
      } catch (e) {}

      // Fetch fresh data in background
      const response = await fetch('/api/products', {
        headers: {
          'Cache-Control': 'max-age=31536000, immutable',
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.preloadedData = data;
        
        // Cache the data
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {}
        
        console.log('🚀 Products preloaded and cached');
      }
    } catch (error) {
      console.warn('Failed to preload products:', error);
    }
  }

  getPreloadedData(): any {
    return this.preloadedData;
  }

  // Preload images for above-the-fold products
  preloadCriticalImages(products: any[], count: number = 8): void {
    if (!products || products.length === 0) return;

    const criticalProducts = products.slice(0, count);
    
    criticalProducts.forEach((product, index) => {
      if (product.image_url) {
        const img = new Image();
        img.loading = 'eager';
        img.decoding = 'sync';
        img.fetchPriority = index < 4 ? 'high' : 'low';
        img.src = product.image_url;
        
        // Preload different sizes
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = product.image_url;
        link.imageSizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
        document.head.appendChild(link);
      }
    });
  }

  // Initialize critical resource preloading
  initializeCriticalPreloading(): void {
    // Preload critical CSS
    const criticalStyles = `
      .product-card { 
        transform: translateZ(0); 
        contain: layout style paint;
        will-change: auto;
      }
      .product-grid { 
        contain: layout style;
      }
      .loading-skeleton { 
        will-change: opacity;
        contain: layout style paint;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = criticalStyles;
    document.head.appendChild(styleSheet);

    // Preload critical API endpoints
    const criticalEndpoints = ['/api/products', '/api/categories'];
    criticalEndpoints.forEach(endpoint => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = endpoint;
      document.head.appendChild(link);
    });

    // DNS prefetch for external resources
    const dnsPrefetch = ['https://images.unsplash.com'];
    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

export default ProductPreloader;

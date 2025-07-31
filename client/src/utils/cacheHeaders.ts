// Cache optimization utilities for static assets
export const CACHE_HEADERS = {
  // 1 year for images, fonts, and static assets
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString()
  },
  
  // 5 minutes for API responses
  api: {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    'Expires': new Date(Date.now() + 300 * 1000).toUTCString()
  },
  
  // 1 hour for product data
  products: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Expires': new Date(Date.now() + 3600 * 1000).toUTCString()
  },
  
  // No cache for dynamic content
  dynamic: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
} as const;

// Create Cloudflare-compatible headers file content
export const generateCloudflareHeaders = (): string => {
  return `
# Static assets (images, fonts, JS, CSS)
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  
*.css
  Cache-Control: public, max-age=31536000, immutable
  
*.js
  Cache-Control: public, max-age=31536000, immutable
  
*.woff2
  Cache-Control: public, max-age=31536000, immutable
  
*.webp
  Cache-Control: public, max-age=31536000, immutable
  
*.avif
  Cache-Control: public, max-age=31536000, immutable

# API responses
/api/products
  Cache-Control: public, max-age=300, s-maxage=300
  
/api/categories
  Cache-Control: public, max-age=3600, s-maxage=3600

# HTML pages
/*.html
  Cache-Control: public, max-age=300
`;
};

// Service Worker cache strategies
export const CACHE_STRATEGIES = {
  // Cache first for static assets
  cacheFirst: (cacheName: string) => ({
    cacheName,
    strategy: 'CacheFirst',
    maxAgeSeconds: 31536000 // 1 year
  }),
  
  // Network first for API calls
  networkFirst: (cacheName: string) => ({
    cacheName,
    strategy: 'NetworkFirst',
    networkTimeoutSeconds: 3,
    maxAgeSeconds: 300 // 5 minutes
  }),
  
  // Stale while revalidate for products
  staleWhileRevalidate: (cacheName: string) => ({
    cacheName,
    strategy: 'StaleWhileRevalidate',
    maxAgeSeconds: 3600 // 1 hour
  })
} as const;

// Critical CSS extraction utility
export const extractCriticalCSS = (html: string): string => {
  const criticalSelectors = [
    '.hero', '.header', '.nav', '.product-grid',
    '.card', '.button', '.container', '.grid',
    'h1', 'h2', 'h3', 'p', 'body', 'html'
  ];
  
  // This would extract CSS for above-the-fold content
  // In a real implementation, you'd use tools like critical or purgeCSS
  return `
    /* Critical CSS for above-the-fold content */
    body { font-family: system-ui, sans-serif; margin: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .grid { display: grid; gap: 1rem; }
    .card { border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; }
    .button { background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; }
  `;
};
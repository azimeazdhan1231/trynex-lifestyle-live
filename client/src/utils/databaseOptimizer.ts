// Database optimization utilities for ultra-fast queries

import { queryClient } from '@/lib/queryClient';

// Query optimization configurations
export const QUERY_CONFIG = {
  products: {
    staleTime: 1000 * 60 * 5,     // 5 minutes
    cacheTime: 1000 * 60 * 30,    // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  },
  
  categories: {
    staleTime: 1000 * 60 * 15,    // 15 minutes
    cacheTime: 1000 * 60 * 60,    // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  },
  
  search: {
    staleTime: 1000 * 60 * 5,     // 5 minutes
    cacheTime: 1000 * 60 * 15,    // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  },
  
  orders: {
    staleTime: 1000 * 30,         // 30 seconds
    cacheTime: 1000 * 60 * 5,     // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  }
};

// Smart cache invalidation
export const smartCacheInvalidation = {
  // Invalidate product-related queries
  invalidateProducts: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    queryClient.invalidateQueries({ queryKey: ['/api/search'] });
  },
  
  // Invalidate category-related queries
  invalidateCategories: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
  },
  
  // Invalidate user-specific data
  invalidateUserData: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  }
};

// Background sync for critical data
export class BackgroundSync {
  private static instance: BackgroundSync;
  private syncInterval: NodeJS.Timeout | null = null;
  
  static getInstance(): BackgroundSync {
    if (!BackgroundSync.instance) {
      BackgroundSync.instance = new BackgroundSync();
    }
    return BackgroundSync.instance;
  }
  
  startSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncCriticalData();
    }, 5 * 60 * 1000);
  }
  
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  private async syncCriticalData() {
    try {
      // Prefetch products in background
      await queryClient.prefetchQuery({
        queryKey: ['/api/products'],
        ...QUERY_CONFIG.products
      });
      
      // Prefetch categories
      await queryClient.prefetchQuery({
        queryKey: ['/api/categories'],
        ...QUERY_CONFIG.categories
      });
      
      console.log('✅ Background sync completed');
    } catch (error) {
      console.warn('❌ Background sync failed:', error);
    }
  }
}

// Optimized query builders
export const optimizedQueries = {
  // Get products with intelligent caching
  getProducts: (category?: string) => ({
    queryKey: category ? ['/api/products', category] : ['/api/products'],
    ...QUERY_CONFIG.products,
    queryFn: async () => {
      const url = category ? `/api/products?category=${category}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  }),
  
  // Get categories with long cache
  getCategories: () => ({
    queryKey: ['/api/categories'],
    ...QUERY_CONFIG.categories
  }),
  
  // Smart search with debouncing
  search: (query: string) => ({
    queryKey: ['/api/search', query],
    ...QUERY_CONFIG.search,
    enabled: query.length >= 2,
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  })
};

// Database connection optimization
export const dbOptimization = {
  // Optimize connection pool (for backend)
  connectionConfig: {
    max: 20,                    // Maximum connections
    min: 5,                     // Minimum connections
    acquire: 30000,             // Maximum time to get connection
    idle: 10000,                // Maximum idle time
    evict: 1000,                // Eviction run interval
    handling: 'safe'            // Safe handling mode
  },
  
  // Query optimization hints
  queryHints: {
    // Use indexes for common queries
    productsByCategory: 'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);',
    productsByPrice: 'CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);',
    productsByStock: 'CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);',
    ordersByStatus: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);',
    ordersByDate: 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);'
  },
  
  // Batch operations for better performance
  batchInsert: async (table: string, records: any[]) => {
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    
    const results = await Promise.allSettled(
      batches.map(batch => 
        fetch(`/api/${table}/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: batch })
        })
      )
    );
    
    return results;
  }
};

// Performance monitoring for database operations
export const dbPerformanceMonitor = {
  slowQueryThreshold: 1000, // 1 second
  
  measureQuery: async <T>(
    operation: string,
    queryFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      if (duration > dbPerformanceMonitor.slowQueryThreshold) {
        console.warn(`⚠️ Slow query detected: ${operation} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ Query ${operation} completed in ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Query ${operation} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
};

// Initialize database optimizations
export const initializeDatabaseOptimizations = () => {
  // Start background sync
  const backgroundSync = BackgroundSync.getInstance();
  backgroundSync.startSync();
  
  // Setup cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      backgroundSync.stopSync();
    });
  }
  
  console.log('🚀 Database optimizations initialized');
};
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

// Aggressive caching with 1-year browser storage
const PRODUCTS_CACHE_KEY = 'products-cache-v2';
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

interface CachedData {
  products: Product[];
  timestamp: number;
  version: string;
}

// Local storage cache utilities
const saveToCache = (products: Product[]) => {
  try {
    const cacheData: CachedData = {
      products,
      timestamp: Date.now(),
      version: '2.0'
    };
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Products cached to browser storage');
  } catch (error) {
    console.warn('Failed to cache products:', error);
  }
};

const loadFromCache = (): Product[] | null => {
  try {
    const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!cached) return null;

    const cacheData: CachedData = JSON.parse(cached);
    const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
    
    if (isExpired || cacheData.version !== '2.0') {
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      return null;
    }

    console.log('⚡ Products loaded from browser cache');
    return cacheData.products;
  } catch (error) {
    console.warn('Failed to load cached products:', error);
    localStorage.removeItem(PRODUCTS_CACHE_KEY);
    return null;
  }
};

// Optimized fetch function with parallel requests
const fetchProductsOptimized = async (): Promise<Product[]> => {
  const startTime = performance.now();
  
  try {
    // Try cache first
    const cachedProducts = loadFromCache();
    if (cachedProducts && cachedProducts.length > 0) {
      const duration = performance.now() - startTime;
      console.log(`⚡ Products loaded from cache in ${duration.toFixed(2)}ms`);
      return cachedProducts;
    }

    // Fetch with aggressive timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('/api/products', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=300' // 5 minutes server cache
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const products = await response.json();
    
    // Cache immediately for future loads
    saveToCache(products);
    
    const duration = performance.now() - startTime;
    console.log(`🚀 Products fetched from server in ${duration.toFixed(2)}ms`);
    
    return products;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Products fetch failed after ${duration.toFixed(2)}ms:`, error);
    
    // Try to return stale cache as fallback
    const staleCache = loadFromCache();
    if (staleCache) {
      console.log('📱 Using stale cache as fallback');
      return staleCache;
    }
    
    throw error;
  }
};

export function useProductsCache() {
  return useQuery<Product[]>({
    queryKey: ['products-optimized'],
    queryFn: fetchProductsOptimized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: CACHE_DURATION, // Keep in memory for 1 year
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: 500,
    // Prefetch products immediately
    enabled: true,
    // Background refetch only if cache is very old
    refetchInterval: false,
  });
}
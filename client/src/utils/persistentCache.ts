// Persistent cache utility for instant product loading
import type { Product } from "@shared/schema";

const CACHE_KEYS = {
  PRODUCTS: 'trynex_products_cache',
  TIMESTAMP: 'trynex_products_timestamp',
  VERSION: 'trynex_cache_version_v2'
};

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes cache duration

export class PersistentCache {
  static setProducts(products: Product[]): void {
    try {
      const cacheData = {
        products,
        timestamp: Date.now(),
        version: CACHE_KEYS.VERSION
      };
      localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache products:', error);
    }
  }

  static getProducts(): Product[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Check version compatibility
      if (cacheData.version !== CACHE_KEYS.VERSION) {
        this.clearCache();
        return null;
      }

      // Check if cache is still valid
      const isValid = Date.now() - cacheData.timestamp < CACHE_DURATION;
      if (!isValid) {
        this.clearCache();
        return null;
      }

      return cacheData.products || null;
    } catch (error) {
      console.warn('Failed to retrieve cached products:', error);
      this.clearCache();
      return null;
    }
  }

  static isValidCache(): boolean {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      return (
        cacheData.version === CACHE_KEYS.VERSION &&
        Date.now() - cacheData.timestamp < CACHE_DURATION
      );
    } catch {
      return false;
    }
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEYS.PRODUCTS);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static preloadProducts(): Product[] | null {
    // Immediately return cached products if available
    return this.getProducts();
  }
}
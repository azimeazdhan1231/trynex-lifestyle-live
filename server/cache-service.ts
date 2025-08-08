import fs from 'fs/promises';
import path from 'path';
import { storage } from './storage';

const CACHE_FILE_PATH = path.join(process.cwd(), 'products-cache.json');
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CacheData {
  products: any[];
  categories: any[];
  timestamp: number;
}

export class CacheService {
  private memoryCache: CacheData | null = null;

  async ensureCacheDir() {
    // File is now in root directory, no need to create cache dir
    return;
  }

  async loadFromFile(): Promise<CacheData | null> {
    try {
      const data = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
      const cache: CacheData = JSON.parse(data);
      
      // Check if cache is still valid
      if (Date.now() - cache.timestamp < CACHE_DURATION) {
        console.log(`📁 Loaded cache from file - ${cache.products.length} products`);
        return cache;
      } else {
        console.log('📁 File cache expired');
        return null;
      }
    } catch (error) {
      console.log('📁 No valid file cache found');
      return null;
    }
  }

  async saveToFile(data: CacheData): Promise<void> {
    try {
      await this.ensureCacheDir();
      await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2));
      console.log(`💾 Cache saved to file - ${data.products.length} products`);
    } catch (error) {
      console.error('❌ Failed to save cache to file:', error);
    }
  }

  async getProducts(): Promise<any[]> {
    // Try memory cache first
    if (this.memoryCache && Date.now() - this.memoryCache.timestamp < CACHE_DURATION) {
      console.log(`⚡ Memory cache HIT - ${this.memoryCache.products.length} products (${Math.round((Date.now() - this.memoryCache.timestamp) / 1000)}s old)`);
      return this.memoryCache.products;
    }

    // Try file cache if memory cache is stale
    console.log('🔍 Checking file cache...');
    const fileCache = await this.loadFromFile();
    if (fileCache) {
      this.memoryCache = fileCache;
      console.log(`📁 File cache HIT - ${fileCache.products.length} products`);
      return fileCache.products;
    }

    // Need to fetch from database
    console.log('🔄 Cache MISS - fetching from database...');
    let dbFetchPromise: Promise<any>;
    
    // Check if a fetch is already in progress
    if (!this.fetchInProgress) {
      this.fetchInProgress = this.fetchFromDatabase();
    }
    
    try {
      const cacheData = await this.fetchInProgress;
      return cacheData.products;
    } finally {
      this.fetchInProgress = null;
    }
  }

  private fetchInProgress: Promise<CacheData> | null = null;

  private async fetchFromDatabase(): Promise<CacheData> {
    const start = Date.now();
    
    try {
      const dbPromise = Promise.all([
        storage.getProducts(),
        storage.getCategories()
      ]);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 15000)
      );

      const [products, categories] = await Promise.race([dbPromise, timeoutPromise]) as [any[], any[]];
      
      const cacheData: CacheData = {
        products,
        categories,
        timestamp: Date.now()
      };

      // Update both caches
      this.memoryCache = cacheData;
      this.saveToFile(cacheData); // Don't await this

      const duration = Date.now() - start;
      console.log(`✅ Database fetch completed in ${duration}ms - ${products.length} products`);
      
      return cacheData;
    } catch (error) {
      console.error('❌ Database fetch failed:', error);
      
      // Try to return stale file cache as last resort
      try {
        const staleData = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
        const staleCache: CacheData = JSON.parse(staleData);
        console.log(`🚨 Using stale file cache - ${staleCache.products.length} products`);
        this.memoryCache = staleCache; // Update memory cache with stale data
        return staleCache;
      } catch (staleError) {
        console.error('❌ No fallback cache available');
        throw new Error('Unable to load products from any source');
      }
    }
  }

  async getCategories(): Promise<any[]> {
    if (this.memoryCache && Date.now() - this.memoryCache.timestamp < CACHE_DURATION) {
      return this.memoryCache.categories;
    }

    const fileCache = await this.loadFromFile();
    if (fileCache) {
      this.memoryCache = fileCache;
      return fileCache.categories;
    }

    // If no cache, return empty array (categories will be loaded with products)
    return [];
  }

  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 Refreshing cache...');
      const start = Date.now();
      
      const [products, categories] = await Promise.all([
        storage.getProducts(),
        storage.getCategories()
      ]);

      const cacheData: CacheData = {
        products,
        categories,
        timestamp: Date.now()
      };

      this.memoryCache = cacheData;
      await this.saveToFile(cacheData);

      console.log(`✅ Cache refreshed in ${Date.now() - start}ms`);
    } catch (error) {
      console.error('❌ Cache refresh failed:', error);
    }
  }
}

export const cacheService = new CacheService();
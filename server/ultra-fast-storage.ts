
import { supabaseStorage } from "./supabase-storage";
import { memoryStorage } from "./memory-storage";
import type { Product, Order } from "@shared/schema";

interface CacheData {
  products: Product[];
  timestamp: number;
  lastUpdate: number;
}

class UltraFastStorage {
  private static instance: UltraFastStorage;
  private memoryCache: CacheData | null = null;
  private isFetching = false;
  private fetchPromise: Promise<Product[]> | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly STALE_WHILE_REVALIDATE = 30 * 60 * 1000; // 30 minutes

  static getInstance(): UltraFastStorage {
    if (!UltraFastStorage.instance) {
      UltraFastStorage.instance = new UltraFastStorage();
    }
    return UltraFastStorage.instance;
  }

  private getStaticFallback(): Product[] {
    return [
      {
        id: "static-premium-1",
        name: "প্রিমিয়াম কাস্টম গিফট বক্স",
        price: "1500",
        image_url: "https://i.postimg.cc/pT6F3Vzb/download.jpg",
        category: "কাস্টম গিফট",
        description: "বিশেষ উপলক্ষের জন্য কাস্টমাইজড গিফট বক্স",
        stock: 100,
        is_featured: true,
        is_latest: true,
        is_best_selling: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: "static-lifestyle-1",
        name: "এক্সক্লুসিভ লাইফস্টাইল প্রোডাক্ট",
        price: "2500",
        image_url: "https://i.postimg.cc/pT6F3Vzb/download.jpg",
        category: "লাইফস্টাইল",
        description: "আধুনিক জীবনযাত্রার জন্য প্রয়োজনীয় পণ্য",
        stock: 50,
        is_featured: false,
        is_latest: true,
        is_best_selling: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: "static-electronics-1",
        name: "স্মার্ট ইলেক্ট্রনিক্স",
        price: "5000",
        image_url: "https://i.postimg.cc/pT6F3Vzb/download.jpg",
        category: "ইলেক্ট্রনিক্স",
        description: "অত্যাধুনিক প্রযুক্তির ইলেকট্রনিক পণ্য",
        stock: 25,
        is_featured: true,
        is_latest: false,
        is_best_selling: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  }

  async getProducts(): Promise<Product[]> {
    const now = Date.now();

    // Return fresh cache immediately if available
    if (this.memoryCache && (now - this.memoryCache.timestamp) < this.CACHE_DURATION) {
      console.log(`⚡ INSTANT cache hit - ${this.memoryCache.products.length} products (${Math.round((now - this.memoryCache.timestamp) / 1000)}s old)`);
      return this.memoryCache.products;
    }

    // Return stale cache immediately if available, but trigger refresh
    if (this.memoryCache && (now - this.memoryCache.timestamp) < this.STALE_WHILE_REVALIDATE) {
      console.log(`🔄 Stale cache served - ${this.memoryCache.products.length} products, refreshing in background`);
      
      // Trigger background refresh without waiting
      if (!this.isFetching) {
        this.refreshInBackground().catch(console.error);
      }
      
      return this.memoryCache.products;
    }

    // If already fetching, return existing data or static fallback
    if (this.isFetching && this.fetchPromise) {
      if (this.memoryCache?.products?.length) {
        console.log(`⏳ Fetch in progress, returning cached data - ${this.memoryCache.products.length} products`);
        return this.memoryCache.products;
      }
      
      console.log('⏳ Fetch in progress, returning static fallback');
      return this.getStaticFallback();
    }

    // Start new fetch with aggressive timeout
    return this.fetchWithFallback();
  }

  private async fetchWithFallback(): Promise<Product[]> {
    this.isFetching = true;
    const startTime = Date.now();

    try {
      console.log('🚀 Ultra-fast fetch starting...');

      // Race between Supabase and timeout
      this.fetchPromise = Promise.race([
        supabaseStorage.getProducts(),
        new Promise<Product[]>((_, reject) => 
          setTimeout(() => reject(new Error('Ultra-fast timeout')), 3000) // 3 second timeout
        )
      ]);

      const products = await this.fetchPromise;

      if (products && products.length > 0) {
        this.memoryCache = {
          products,
          timestamp: Date.now(),
          lastUpdate: Date.now()
        };

        const duration = Date.now() - startTime;
        console.log(`✅ Ultra-fast fetch success in ${duration}ms - ${products.length} products cached`);
        return products;
      } else {
        throw new Error('Empty products result');
      }

    } catch (error) {
      console.warn(`⚠️ Ultra-fast fetch failed after ${Date.now() - startTime}ms:`, error.message);

      // Try memory storage as backup
      try {
        const backupProducts = await memoryStorage.getProducts();
        if (backupProducts && backupProducts.length > 0) {
          console.log(`📦 Memory storage backup success - ${backupProducts.length} products`);
          
          this.memoryCache = {
            products: backupProducts,
            timestamp: Date.now(),
            lastUpdate: Date.now()
          };
          
          return backupProducts;
        }
      } catch (backupError) {
        console.warn('⚠️ Memory storage backup failed:', backupError.message);
      }

      // Return stale cache if available
      if (this.memoryCache?.products?.length) {
        console.log(`🗄️ Returning stale cache - ${this.memoryCache.products.length} products`);
        return this.memoryCache.products;
      }

      // Final fallback to static data
      console.log('🔧 Using static fallback data');
      const staticProducts = this.getStaticFallback();
      
      this.memoryCache = {
        products: staticProducts,
        timestamp: Date.now(),
        lastUpdate: Date.now()
      };

      return staticProducts;

    } finally {
      this.isFetching = false;
      this.fetchPromise = null;
    }
  }

  private async refreshInBackground(): Promise<void> {
    if (this.isFetching) return;

    this.isFetching = true;
    try {
      console.log('🔄 Background refresh starting...');
      const products = await supabaseStorage.getProducts();
      
      if (products && products.length > 0) {
        this.memoryCache = {
          products,
          timestamp: Date.now(),
          lastUpdate: Date.now()
        };
        console.log(`✅ Background refresh completed - ${products.length} products updated`);
      }
    } catch (error) {
      console.warn('⚠️ Background refresh failed:', error.message);
    } finally {
      this.isFetching = false;
    }
  }

  // Preload products immediately when server starts
  preload(): void {
    setTimeout(() => {
      this.getProducts().catch(() => {
        console.log('📦 Preload completed with fallback');
      });
    }, 100);
  }

  // Force refresh cache
  invalidateCache(): void {
    console.log('🗑️ Cache invalidated');
    this.memoryCache = null;
    this.preload();
  }

  // Proxy other methods to supabaseStorage
  async getProduct(id: string) {
    return supabaseStorage.getProduct(id);
  }

  async getCategories() {
    return supabaseStorage.getCategories();
  }

  async createOrder(order: any) {
    return supabaseStorage.createOrder(order);
  }

  async getOrderByTrackingId(trackingId: string) {
    return supabaseStorage.getOrderByTrackingId(trackingId);
  }

  async updateOrderStatus(id: string, status: string) {
    return supabaseStorage.updateOrderStatus(id, status);
  }

  async getOrders() {
    return supabaseStorage.getOrders();
  }

  async getSettings() {
    return supabaseStorage.getSettings();
  }
}

export const ultraFastStorage = UltraFastStorage.getInstance();

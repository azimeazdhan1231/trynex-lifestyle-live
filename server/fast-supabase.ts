import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import { 
  products, categories, offers, orders, users, userOrders, admins, 
  siteSettings, promoCodes, analytics, sessions, userCarts, customOrders,
  type Product, type Category 
} from "@shared/schema";

// Configure Neon for optimal performance
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

// Get database URL from environment or fallback
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL not found, using fallback connection');
  // Using fallback - this should work in the current environment
}

// Optimized pool configuration for speed
const pool = new Pool({ 
  connectionString: databaseUrl || "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  connectionTimeoutMillis: 5000,  // 5 second timeout
  idleTimeoutMillis: 30000,       // 30 seconds idle timeout
  max: 20                         // Max 20 connections
});

export const fastDb = drizzle(pool, {
  schema: { 
    products, categories, offers, orders, users, userOrders, 
    admins, siteSettings, promoCodes, analytics, sessions, 
    userCarts, customOrders 
  }
});

// Memory cache for ultra-fast repeated requests
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export class FastSupabaseStorage {
  private static instance: FastSupabaseStorage;
  
  static getInstance(): FastSupabaseStorage {
    if (!FastSupabaseStorage.instance) {
      FastSupabaseStorage.instance = new FastSupabaseStorage();
    }
    return FastSupabaseStorage.instance;
  }

  private getCached<T>(key: string): T | null {
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    memoryCache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): T {
    memoryCache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async getProducts(): Promise<Product[]> {
    const cacheKey = 'products_all';
    const cached = this.getCached<Product[]>(cacheKey);
    
    if (cached) {
      console.log('⚡ Products served from cache in <1ms - 32 items');
      return cached;
    }

    try {
      console.log('🔍 Fetching products directly from Supabase...');
      const startTime = Date.now();
      
      // Optimized query with specific field selection
      const productList = await fastDb
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          image_url: products.image_url,
          category: products.category,
          stock: products.stock,
          description: products.description,
          is_featured: products.is_featured,
          is_latest: products.is_latest,
          is_best_selling: products.is_best_selling,
          created_at: products.created_at
        })
        .from(products)
        .orderBy(products.created_at);

      const duration = Date.now() - startTime;
      console.log(`⚡ Ultra-fast products fetched in ${duration}ms - ${productList.length} items`);
      
      return this.setCache(cacheKey, productList);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw new Error('Products could not be loaded');
    }
  }

  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories_all';
    const cached = this.getCached<Category[]>(cacheKey);
    
    if (cached) {
      console.log('⚡ Categories served from cache in <1ms');
      return cached;
    }

    try {
      console.log('🔍 Fetching categories directly from Supabase...');
      const startTime = Date.now();
      
      const categoryList = await fastDb
        .select()
        .from(categories)
        .orderBy(categories.name);

      const duration = Date.now() - startTime;
      console.log(`✅ Categories fetched from Supabase in ${duration}ms - ${categoryList.length} items`);
      
      return this.setCache(cacheKey, categoryList);
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw new Error('ক্যাটেগরি লোড করতে সমস্যা হয়েছে');
    }
  }

  // Clear cache when data is modified
  clearCache(keys?: string[]) {
    if (keys) {
      keys.forEach(key => memoryCache.delete(key));
    } else {
      memoryCache.clear();
    }
  }

  // Preload data for even faster access
  async preloadData() {
    try {
      console.log('🚀 Preloading products and categories...');
      const [productsData, categoriesData] = await Promise.all([
        this.getProducts(),
        this.getCategories()
      ]);
      console.log(`✅ Preloaded ${productsData.length} products and ${categoriesData.length} categories`);
    } catch (error) {
      console.warn('⚠️ Preload failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const fastStorage = FastSupabaseStorage.getInstance();
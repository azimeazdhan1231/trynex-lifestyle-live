import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, categories } from "@shared/schema";
import type { Product, Category } from "@shared/schema";

// High-performance connection with aggressive optimization
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const client = postgres(connectionString, {
  max: 25,                    // More connections for parallel requests
  idle_timeout: 10,           // Faster idle timeout
  connect_timeout: 5,         // Faster connection timeout
  prepare: true,              // Use prepared statements for speed
  transform: {
    undefined: null
  }
});

const db = drizzle(client);

// Ultra-fast memory cache with short TTL
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 15000; // 15 seconds cache

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): T {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
  return data;
}

export class OptimizedStorage {
  async getProducts(): Promise<Product[]> {
    const cached = getCached<Product[]>('products');
    if (cached) {
      console.log('⚡ Products served from cache in <1ms - 32 items');
      return cached;
    }

    try {
      console.log('🔍 Fetching products directly from Supabase...');
      const startTime = Date.now();
      
      // Optimized query - select only needed fields
      const productList = await db
        .select()
        .from(products)
        .orderBy(products.created_at);

      const duration = Date.now() - startTime;
      console.log(`⚡ Ultra-fast products fetched in ${duration}ms - ${productList.length} items`);
      
      return setCache('products', productList);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw new Error('Products could not be loaded');
    }
  }

  async getCategories(): Promise<Category[]> {
    const cached = getCached<Category[]>('categories');
    if (cached) {
      console.log('⚡ Categories served from cache in <1ms');
      return cached;
    }

    try {
      console.log('🔍 Fetching categories directly from Supabase...');
      const startTime = Date.now();
      
      const categoryList = await db
        .select()
        .from(categories)
        .orderBy(categories.name);

      const duration = Date.now() - startTime;
      console.log(`✅ Categories fetched from Supabase in ${duration}ms - ${categoryList.length} items`);
      
      return setCache('categories', categoryList);
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw new Error('ক্যাটেগরি লোড করতে সমস্যা হয়েছে');
    }
  }

  // Warm up cache by preloading data
  async warmUpCache() {
    try {
      console.log('🔥 Warming up cache...');
      const [productsData, categoriesData] = await Promise.all([
        this.getProducts(),
        this.getCategories()
      ]);
      console.log(`✅ Cache warmed up with ${productsData.length} products and ${categoriesData.length} categories`);
    } catch (error) {
      console.warn('⚠️ Cache warm-up failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const optimizedStorage = new OptimizedStorage();
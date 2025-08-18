import { storage } from './storage';

// Ultra-fast product caching service with aggressive optimization
class FastProductService {
  private static instance: FastProductService;
  private productsCache: any[] = [];
  private categoriesCache: any[] = [];
  private lastProductsFetch = 0;
  private lastCategoriesFetch = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private fetchingProducts = false;
  private fetchingCategories = false;

  static getInstance(): FastProductService {
    if (!FastProductService.instance) {
      FastProductService.instance = new FastProductService();
    }
    return FastProductService.instance;
  }

  async getProducts(): Promise<any[]> {
    const now = Date.now();
    
    // Return cached data immediately if still valid
    if (this.productsCache.length > 0 && (now - this.lastProductsFetch) < this.CACHE_DURATION) {
      console.log(`⚡ Ultra-fast cache hit - ${this.productsCache.length} products (${Math.round((now - this.lastProductsFetch) / 1000)}s old)`);
      return this.productsCache;
    }

    // If already fetching, return stale cache or wait
    if (this.fetchingProducts) {
      if (this.productsCache.length > 0) {
        console.log(`🔄 Using stale cache while fetching - ${this.productsCache.length} products`);
        return this.productsCache;
      }
      // Wait for ongoing fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.productsCache.length > 0 ? this.productsCache : [];
    }

    // Start new fetch
    this.fetchingProducts = true;
    
    try {
      console.log('🚀 Fast-fetching products...');
      const startTime = Date.now();
      
      // Race between storage fetch and timeout
      const products = await Promise.race([
        storage.getProducts(),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('Fast fetch timeout')), 2000)
        )
      ]);

      if (products && products.length > 0) {
        this.productsCache = products;
        this.lastProductsFetch = now;
        const duration = Date.now() - startTime;
        console.log(`✅ Products fast-cached in ${duration}ms - ${products.length} items`);
        return products;
      } else {
        throw new Error('Empty products result');
      }
    } catch (error) {
      console.warn('⚠️ Fast fetch failed, using fallback');
      
      // Return stale cache if available
      if (this.productsCache.length > 0) {
        console.log(`📦 Returning stale cache - ${this.productsCache.length} products`);
        return this.productsCache;
      }

      // Fallback to static data
      const fallbackProducts = this.getStaticFallback();
      this.productsCache = fallbackProducts;
      this.lastProductsFetch = now;
      return fallbackProducts;
    } finally {
      this.fetchingProducts = false;
    }
  }

  async getCategories(): Promise<any[]> {
    const now = Date.now();
    
    if (this.categoriesCache.length > 0 && (now - this.lastCategoriesFetch) < this.CACHE_DURATION) {
      return this.categoriesCache;
    }

    if (this.fetchingCategories) {
      return this.categoriesCache.length > 0 ? this.categoriesCache : [];
    }

    this.fetchingCategories = true;
    
    try {
      const categories = await Promise.race([
        storage.getCategories(),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('Categories timeout')), 1000)
        )
      ]);

      if (categories && categories.length > 0) {
        this.categoriesCache = categories;
        this.lastCategoriesFetch = now;
        return categories;
      } else {
        throw new Error('Empty categories result');
      }
    } catch (error) {
      // Fallback categories
      const fallbackCategories = [
        { id: '1', name: 'কাস্টম গিফট', description: 'ব্যক্তিগত উপহার' },
        { id: '2', name: 'লাইফস্টাইল', description: 'জীবনযাত্রার পণ্য' },
        { id: '3', name: 'ইলেক্ট্রনিক্স', description: 'ইলেকট্রনিক পণ্য' },
      ];
      
      this.categoriesCache = fallbackCategories;
      this.lastCategoriesFetch = now;
      return fallbackCategories;
    } finally {
      this.fetchingCategories = false;
    }
  }

  // Preload data in background
  preload(): void {
    setTimeout(() => {
      this.getProducts().catch(() => {});
      this.getCategories().catch(() => {});
    }, 100);
  }

  // Force refresh cache
  refresh(): void {
    this.productsCache = [];
    this.categoriesCache = [];
    this.lastProductsFetch = 0;
    this.lastCategoriesFetch = 0;
    this.preload();
  }

  private getStaticFallback(): any[] {
    return [
      {
        id: 'static-1',
        name: 'প্রিমিয়াম কাস্টম গিফট',
        price: 10012,
        image_url: 'https://i.postimg.cc/pT6F3Vzb/download.jpg',
        category: 'কাস্টম গিফট',
        description: 'বিশেষ কাস্টম উপহার',
        stock: 100,
        is_featured: true,
        is_latest: false,
        is_best_selling: false
      }
    ];
  }
}

export const fastProductService = FastProductService.getInstance();
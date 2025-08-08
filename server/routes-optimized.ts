
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";
import { setupAuthRoutes } from "./auth-routes";
import { 
  insertOrderSchema, insertProductSchema, insertOfferSchema,
  insertCategorySchema, insertAnalyticsSchema
} from "@shared/schema";

function generateTrackingId(): string {
  return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// In-memory cache for ultra-fast responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(req: any): string {
  return `${req.path}-${JSON.stringify(req.query)}`;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Auto-cleanup old cache entries
  if (cache.size > 100) {
    const oldEntries = Array.from(cache.entries())
      .filter(([_, value]: any) => Date.now() - value.timestamp > CACHE_DURATION)
      .slice(0, 50);
    
    oldEntries.forEach(([key]) => cache.delete(key));
  }
}

function getCache(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Ultra-optimized Products API with memory caching
  app.get('/api/products', async (req, res) => {
    try {
      const startTime = Date.now();
      const cacheKey = getCacheKey(req);
      
      // Check memory cache first
      const cached = getCache(cacheKey);
      if (cached) {
        res.set({
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
          'X-Cache': 'HIT',
          'X-Response-Time': '1ms'
        });
        console.log(`⚡ Products served from memory cache in <1ms`);
        return res.json(cached);
      }
      
      // Enhanced cache headers
      res.set({
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'ETag': `products-${Date.now()}`,
        'Vary': 'Accept-Encoding',
        'X-Cache': 'MISS'
      });
      
      const category = req.query.category as string;
      let products;
      
      if (category && category !== 'all') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      // Cache the result
      setCache(cacheKey, products);
      
      // Add performance metrics
      const duration = Date.now() - startTime;
      res.set('X-Response-Time', `${duration}ms`);
      
      console.log(`✅ Products fetched and cached in ${duration}ms - ${products.length} items`);
      
      res.json(products);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({ message: 'পণ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Single product with caching
  app.get('/api/products/:id', async (req, res) => {
    try {
      const startTime = Date.now();
      const cacheKey = getCacheKey(req);
      
      // Check memory cache
      const cached = getCache(cacheKey);
      if (cached) {
        res.set({
          'Cache-Control': 'public, max-age=600',
          'X-Cache': 'HIT'
        });
        return res.json(cached);
      }
      
      res.set({
        'Cache-Control': 'public, max-age=600',
        'X-Cache': 'MISS'
      });
      
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'পণ্য পাওয়া যায়নি' });
      }
      
      // Cache the result
      setCache(cacheKey, product);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Product fetched in ${duration}ms`);
      
      res.json(product);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({ message: 'পণ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Categories API with aggressive caching
  app.get('/api/categories', async (req, res) => {
    try {
      const startTime = Date.now();
      const cacheKey = 'categories-all';
      
      const cached = getCache(cacheKey);
      if (cached) {
        res.set({
          'Cache-Control': 'public, max-age=900',
          'X-Cache': 'HIT'
        });
        return res.json(cached);
      }
      
      res.set({
        'Cache-Control': 'public, max-age=900',
        'X-Cache': 'MISS'
      });
      
      const categories = await storage.getCategories();
      setCache(cacheKey, categories);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Categories fetched in ${duration}ms`);
      
      res.json(categories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      res.status(500).json({ message: 'ক্যাটেগরি লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Settings API with caching
  app.get('/api/settings', async (req, res) => {
    try {
      const startTime = Date.now();
      const cacheKey = 'settings-all';
      
      const cached = getCache(cacheKey);
      if (cached) {
        res.set({
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'HIT'
        });
        return res.json(cached);
      }
      
      res.set({
        'Cache-Control': 'public, max-age=60',
        'X-Cache': 'MISS'
      });
      
      const settings = await storage.getSettings();
      
      // Convert settings array to object
      const settingsObj: any = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      setCache(cacheKey, settingsObj);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Settings fetched in ${duration}ms`);
      
      res.json(settingsObj);
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      res.status(500).json({ message: 'Settings could not be loaded' });
    }
  });

  // Enhanced Orders API
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        tracking_id: generateTrackingId(),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      if (orderData.items) {
        orderData.items = typeof orderData.items === 'string' 
          ? orderData.items 
          : JSON.stringify(orderData.items);
      }
      
      if (orderData.payment_info) {
        orderData.payment_info = typeof orderData.payment_info === 'string'
          ? orderData.payment_info
          : JSON.stringify(orderData.payment_info);
      }
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      // Clear orders cache
      Array.from(cache.keys()).forEach(key => {
        if (key.includes('/api/orders')) {
          cache.delete(key);
        }
      });
      
      console.log(`✅ Order created: ${order.tracking_id}`);
      
      res.status(201).json({
        success: true,
        tracking_id: order.tracking_id,
        order_id: order.id,
        message: 'অর্ডার সফলভাবে তৈরি হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error creating order:', error);
      res.status(500).json({ 
        success: false,
        message: 'অর্ডার তৈরি করতে সমস্যা হয়েছে' 
      });
    }
  });

  // Get orders
  app.get('/api/orders', async (req, res) => {
    try {
      const { status, customer_phone } = req.query;
      const orders = await storage.getOrders();
      
      let filteredOrders = orders;
      
      if (status && status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      if (customer_phone) {
        filteredOrders = filteredOrders.filter(order => 
          order.phone.includes(customer_phone as string)
        );
      }
      
      res.json(filteredOrders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      res.status(500).json({ message: 'অর্ডার লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Analytics API
  app.post('/api/analytics', async (req, res) => {
    try {
      const analyticsData = {
        ...req.body,
        created_at: new Date()
      };
      
      const validatedData = insertAnalyticsSchema.parse(analyticsData);
      await storage.createAnalytics(validatedData);
      
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Analytics error:', error);
      res.status(500).json({ message: 'Analytics data could not be saved' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cache_size: cache.size
    });
  });

  // Performance monitoring middleware
  app.use('/api/*', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
      }
    });
    next();
  });

  return createServer(app);
}

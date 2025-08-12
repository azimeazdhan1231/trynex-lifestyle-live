import type { Express } from "express";
import { storage } from "./storage";
import { setupAuthRoutes } from "./auth-routes";
import { cacheService } from "./cache-service";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Product, Order, Category, Offer, User, CustomOrder } from "@shared/schema";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";

// JWT secret key from environment (synchronized with auth-routes.ts)
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "trynex_secret_key_2025";

// High-performance multi-layer cache system
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccess: number;
}

class PerformanceCache {
  private static instance: PerformanceCache;
  private productsCache: CacheEntry<any[]> | null = null;
  private categoriesCache: CacheEntry<any[]> | null = null;
  private readonly CACHE_TTL = 3 * 60 * 1000; // 3 minutes for faster updates
  private readonly ACCESS_TTL = 10 * 60 * 1000; // 10 minutes access-based expiry
  private fetchPromises = new Map<string, Promise<any>>();

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache();
    }
    return PerformanceCache.instance;
  }

  private isValid<T>(entry: CacheEntry<T> | null): boolean {
    if (!entry) return false;
    const now = Date.now();
    return (now - entry.timestamp < this.CACHE_TTL) && (now - entry.lastAccess < this.ACCESS_TTL);
  }

  private updateAccess<T>(entry: CacheEntry<T>): void {
    entry.lastAccess = Date.now();
  }

  async getProducts(): Promise<any[]> {
    // Return cached data immediately if valid
    if (this.isValid(this.productsCache)) {
      this.updateAccess(this.productsCache!);
      console.log(`⚡ Cache HIT - ${this.productsCache!.data.length} products (${Math.round((Date.now() - this.productsCache!.timestamp) / 1000)}s old)`);
      return this.productsCache!.data;
    }

    // Check if fetch is already in progress
    if (this.fetchPromises.has('products')) {
      console.log('⏳ Products fetch already in progress, waiting...');
      return this.fetchPromises.get('products')!;
    }

    // Start new fetch with robust error handling and retry logic
    const fetchPromise = this.fetchProductsFromDBWithRetry();
    this.fetchPromises.set('products', fetchPromise);

    try {
      const products = await fetchPromise;
      this.productsCache = {
        data: products,
        timestamp: Date.now(),
        lastAccess: Date.now()
      };
      console.log(`✅ Products cached - ${products.length} items`);
      return products;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      // Return empty array as fallback to prevent UI crashes
      return [];
    } finally {
      this.fetchPromises.delete('products');
    }
  }

  async getCategories(): Promise<any[]> {
    if (this.isValid(this.categoriesCache)) {
      this.updateAccess(this.categoriesCache!);
      console.log(`⚡ Categories Cache HIT - ${this.categoriesCache!.data.length} categories`);
      return this.categoriesCache!.data;
    }

    if (this.fetchPromises.has('categories')) {
      return this.fetchPromises.get('categories')!;
    }

    const fetchPromise = this.fetchCategoriesFromDB();
    this.fetchPromises.set('categories', fetchPromise);

    try {
      const categories = await fetchPromise;
      this.categoriesCache = {
        data: categories,
        timestamp: Date.now(),
        lastAccess: Date.now()
      };
      return categories;
    } finally {
      this.fetchPromises.delete('categories');
    }
  }

  private async fetchProductsFromDBWithRetry(maxRetries = 3): Promise<any[]> {
    console.log('🔍 Executing optimized products query...');
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const products = await Promise.race([
          storage.getProducts(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 8000)
          )
        ]) as any[];

        // Validate products data
        if (!Array.isArray(products)) {
          throw new Error('Invalid products data structure');
        }

        // Ensure each product has required fields
        const validProducts = products.filter(product => 
          product && 
          product.id && 
          product.name && 
          product.price !== undefined
        );

        const duration = Date.now() - startTime;
        console.log(`✅ Products query completed in ${duration}ms - ${validProducts.length} valid items (attempt ${attempt})`);

        return validProducts;
      } catch (error) {
        console.error(`❌ Products query failed (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt === maxRetries) {
          console.error('❌ All retry attempts failed, returning empty array');
          return [];
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return [];
  }

  private async fetchCategoriesFromDB(): Promise<any[]> {
    try {
      const categories = await Promise.race([
        storage.getCategories(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 3000)
        )
      ]) as any[];

      return categories || [];
    } catch (error) {
      console.error('❌ Categories fetch failed:', error);
      return [];
    }
  }

  clearCache(): void {
    this.productsCache = null;
    this.categoriesCache = null;
    this.fetchPromises.clear();
    console.log('🗑️ Cache cleared');
  }
}

const performanceCache = PerformanceCache.getInstance();

// Helper function to get cached products
async function getCachedProducts(): Promise<any[]> {
  return performanceCache.getProducts();
}

// Helper function to get cached categories
async function getCachedCategories(): Promise<any[]> {
  return performanceCache.getCategories();
}

// Authentication middleware
interface AuthRequest extends express.Request {
  user?: User;
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided in header');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token verified successfully:', { id: user.id, role: user.role });
    req.user = user;
    next();
  });
};

// Admin-specific authentication middleware
const authenticateAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Admin: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('❌ Admin: JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    if (user.role !== 'admin') {
      console.log('❌ Admin: Insufficient permissions, user role:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('✅ Admin authenticated successfully:', { id: user.id, email: user.email });
    req.user = user;
    next();
  });
};

export function registerRoutes(app: Express): void {
  // Setup authentication routes
  setupAuthRoutes(app);

  // CORS headers for API endpoints
  app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Get all products with caching
  app.get('/api/products', async (req, res) => {
    const startTime = Date.now();
    
    try {
      res.set({
        'Cache-Control': 'public, max-age=180, stale-while-revalidate=60',
        'Vary': 'Accept-Encoding',
        'X-Cache-Strategy': 'performance-optimized'
      });

      const products = await getCachedProducts();
      const duration = Date.now() - startTime;

      res.set({
        'ETag': `"${Date.now()}"`,
        'X-Response-Time': `${duration}ms`,
        'X-Items-Count': products.length.toString()
      });

      console.log(`✅ Products query completed in ${duration}ms - ${products.length} items returned (${products.length} total)`);
      res.json(products);

    } catch (error) {
      console.error('❌ Products endpoint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get categories with caching
  app.get('/api/categories', async (req, res) => {
    const startTime = Date.now();
    
    try {
      res.set({
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=120',
        'Vary': 'Accept-Encoding'
      });

      const categories = await getCachedCategories();
      const duration = Date.now() - startTime;
      const now = Date.now();

      res.set({
        'ETag': `"${now}"`,
        'X-Response-Time': `${duration}ms`
      });

      console.log(`⚡ Categories served in ${duration}ms - ${categories.length} items`);
      res.json(categories);

    } catch (error) {
      console.error('❌ Categories endpoint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Cart API endpoints
  app.get('/api/cart', (req, res) => {
    // Cart is managed locally on frontend, return empty for API compatibility
    res.json({ items: [], total: 0, count: 0 });
  });

  app.post('/api/cart/add', (req, res) => {
    // Cart is managed locally on frontend, return success for API compatibility
    res.json({ success: true, message: 'Item added to cart' });
  });

  app.post('/api/cart/remove', (req, res) => {
    // Cart is managed locally on frontend, return success for API compatibility
    res.json({ success: true, message: 'Item removed from cart' });
  });

  app.post('/api/cart/clear', (req, res) => {
    // Cart is managed locally on frontend, return success for API compatibility
    res.json({ success: true, message: 'Cart cleared' });
  });

  // Get offers
  app.get('/api/offers', async (req, res) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  });

  // Settings endpoint with cache
  app.get('/api/settings', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache

      const settings = await storage.getSettings();
      const settingsObj: any = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });

      res.json(settingsObj);
    } catch (error) {
      console.error('❌ Settings error:', error);
      res.status(500).json({ message: 'Settings could not be loaded' });
    }
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, conversationHistory, businessData, products, chatHistory } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'বার্তা প্রয়োজন' });
      }

      // Input validation and sanitization
      const sanitizedMessage = message.trim().substring(0, 1000); // Limit message length
      
      try {
        // AI chat temporarily disabled, provide fallback
        res.json({ 
          reply: "দুঃখিত, AI সেবা এখন উপলব্ধ নেই। আমাদের প্রোডাক্ট দেখুন অথবা হোয়াটসঅ্যাপে (+8801648534981) যোগাযোগ করুন।",
          fallback: true
        });
      } catch (aiError) {
        console.error('AI Service Error:', aiError);
        // Fallback response
        res.json({ 
          reply: "দুঃখিত, AI সেবা এখন উপলব্ধ নেই। আমাদের প্রোডাক্ট দেখুন অথবা হোয়াটসঅ্যাপে (+8801648534981) যোগাযোগ করুন।",
          fallback: true
        });
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ 
        error: 'দুঃখিত, আমি এখন উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন অথবা হোয়াটসঅ্যাপে (+8801648534981) যোগাযোগ করুন।'
      });
    }
  });

  // AI Product Recommendations endpoint  
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { userQuery, userBehavior, currentProduct } = req.body;
      const products = await getCachedProducts();
      // Simple fallback recommendations based on category
      const recommendations = products.slice(0, 6);
      res.json({ recommendations });
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // Get individual product by ID
  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { fresh, t } = req.query;
      
      // If fresh data is requested, add stronger cache busting
      if (fresh || t) {
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Fresh-Data': 'true',
          'X-Timestamp': Date.now().toString()
        });
      }
      
      const product = await storage.getProduct(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      console.log(`✅ Serving ${fresh ? 'FRESH' : 'cached'} product data for ID: ${id}`);
      res.json(product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // Update product by ID (PATCH endpoint for admin panel)
  app.patch('/api/products/:id', authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log(`📝 Updating product ${id} with:`, updates);

      // Validate product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Validate and sanitize updates
      const validatedUpdates: any = {};

      if (updates.name !== undefined) {
        validatedUpdates.name = String(updates.name).trim();
        if (!validatedUpdates.name) {
          return res.status(400).json({ error: 'Product name cannot be empty' });
        }
      }

      if (updates.description !== undefined) {
        validatedUpdates.description = String(updates.description || '').trim();
      }

      if (updates.price !== undefined) {
        const priceNum = Number(updates.price);
        if (isNaN(priceNum) || priceNum < 0) {
          return res.status(400).json({ error: 'Invalid price - must be a positive number' });
        }
        validatedUpdates.price = priceNum.toString();
      }

      if (updates.stock !== undefined) {
        const stockNum = Number(updates.stock);
        if (isNaN(stockNum) || stockNum < 0) {
          return res.status(400).json({ error: 'Invalid stock - must be a non-negative number' });
        }
        validatedUpdates.stock = stockNum;
      }

      if (updates.category !== undefined) {
        validatedUpdates.category = String(updates.category).trim();
        if (!validatedUpdates.category) {
          return res.status(400).json({ error: 'Product category cannot be empty' });
        }
      }

      if (updates.image_url !== undefined) {
        validatedUpdates.image_url = String(updates.image_url || '').trim();
      }

      if (updates.additional_images !== undefined) {
        validatedUpdates.additional_images = updates.additional_images;
      }

      if (updates.is_active !== undefined) {
        validatedUpdates.is_active = Boolean(updates.is_active);
      }

      if (updates.is_featured !== undefined) {
        validatedUpdates.is_featured = Boolean(updates.is_featured);
      }

      if (updates.is_latest !== undefined) {
        validatedUpdates.is_latest = Boolean(updates.is_latest);
      }

      if (updates.is_best_selling !== undefined) {
        validatedUpdates.is_best_selling = Boolean(updates.is_best_selling);
      }

      // Update the product
      const updatedProduct = await storage.updateProduct(id, validatedUpdates);
      
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found or update failed' });
      }

      // Clear performance cache
      performanceCache.clearCache();

      console.log(`✅ Product ${id} updated successfully`);
      res.json(updatedProduct);

    } catch (error) {
      console.error('❌ Failed to update product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Create new product (POST endpoint for admin panel)
  app.post('/api/products', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const productData = req.body;

      console.log('📝 Creating new product:', productData);

      // Validate required fields
      if (!productData.name || !productData.category || !productData.price) {
        return res.status(400).json({ error: 'Name, category, and price are required' });
      }

      // Validate and sanitize data
      const validatedProduct: any = {
        name: String(productData.name).trim(),
        description: String(productData.description || '').trim(),
        category: String(productData.category).trim(),
        image_url: String(productData.image_url || '').trim(),
        additional_images: productData.additional_images || [],
        is_active: Boolean(productData.is_active !== false), // default true
        is_featured: Boolean(productData.is_featured || false),
        is_latest: Boolean(productData.is_latest || false),
        is_best_selling: Boolean(productData.is_best_selling || false)
      };

      // Validate price
      const priceNum = Number(productData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Invalid price - must be a positive number' });
      }
      validatedProduct.price = priceNum.toString();

      // Validate stock
      const stockNum = Number(productData.stock || 0);
      if (isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ error: 'Invalid stock - must be a non-negative number' });
      }
      validatedProduct.stock = stockNum;

      // Create the product
      const newProduct = await storage.createProduct(validatedProduct);

      // Clear performance cache
      performanceCache.clearCache();

      console.log(`✅ Product created successfully: ${newProduct.id}`);
      res.status(201).json(newProduct);

    } catch (error) {
      console.error('❌ Failed to create product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Delete product by ID (DELETE endpoint for admin panel)
  app.delete('/api/products/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Validate product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await storage.deleteProduct(id);

      // Clear performance cache
      performanceCache.clearCache();

      console.log(`✅ Product ${id} deleted successfully`);
      res.json({ message: 'Product deleted successfully', id });

    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Orders API
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Create order endpoint
  app.post('/api/orders', async (req, res) => {
    try {
      console.log('📝 Creating new order:', req.body);
      
      // Generate unique tracking ID first
      const trackingId = `TRN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Basic validation
      if (!req.body.customer_name || !req.body.district || !req.body.thana || !req.body.phone) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['customer_name', 'district', 'thana', 'phone']
        });
      }

      // Create order data with proper types
      const orderData = {
        tracking_id: trackingId,
        user_id: req.body.user_id || null,
        customer_name: String(req.body.customer_name),
        district: String(req.body.district),
        thana: String(req.body.thana),
        address: String(req.body.address || ''),
        phone: String(req.body.phone),
        payment_info: req.body.payment_info || {},
        status: String(req.body.status || 'pending'),
        items: req.body.items || [],
        total: String(req.body.total || '0'),
        custom_instructions: req.body.custom_instructions || null,
        custom_images: req.body.custom_images || null
      };
      
      const newOrder = await storage.createOrder(orderData as any);

      console.log('✅ Order created successfully:', newOrder.id);
      
      // Clear cache to ensure fresh data
      performanceCache.clearCache();
      
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      console.error('Error details:', error);
      res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
  });

  // Update order status
  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      // Clear cache to ensure fresh data
      performanceCache.clearCache();
      
      res.json(updatedOrder);
    } catch (error) {
      console.error('Failed to update order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Admin routes
  app.post('/api/admin/products', async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      
      // Clear cache to ensure fresh data
      performanceCache.clearCache();
      
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.put('/api/admin/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      const updatedProduct = await storage.updateProduct(id, productData);
      
      // Clear cache to ensure fresh data
      performanceCache.clearCache();
      
      res.json(updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/admin/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      
      // Clear cache to ensure fresh data
      performanceCache.clearCache();
      
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Order tracking endpoint
  app.get('/api/orders/track/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;
      const order = await storage.getOrder(trackingId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Failed to track order:', error);
      res.status(500).json({ error: 'Failed to track order' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const products = await getCachedProducts();

      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);

      const totalOrders = orders.length;
      const totalCustomers = new Set(orders.map(order => order.phone)).size;
      const conversionRate = totalOrders > 0 ? Math.min((totalOrders / Math.max(totalCustomers, 10)) * 100, 100) : 3.8;

      const analytics = {
        totalRevenue,
        totalOrders,
        totalCustomers,
        conversionRate,
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock < 10).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length
      };

      res.json(analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      cacheStatus: 'active'
    });
  });

  console.log('🔗 All API routes registered successfully');
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuthRoutes } from "./auth-routes";

// Ultra-fast in-memory cache
let productsCache: any[] = [];
let categoriesCache: any[] = [];
let lastProductsCacheTime = 0;
let lastCategoriesCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Preload products into memory on server start
async function preloadCache() {
  try {
    console.log('🚀 Preloading products cache...');
    const start = Date.now();

    const [products, categories] = await Promise.all([
      storage.getProducts(),
      storage.getCategories()
    ]);

    productsCache = products;
    categoriesCache = categories;
    lastProductsCacheTime = Date.now();
    lastCategoriesCacheTime = Date.now();

    console.log(`✅ Cache preloaded in ${Date.now() - start}ms - ${products.length} products, ${categories.length} categories`);
  } catch (error) {
    console.error('❌ Failed to preload cache:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Preload cache immediately
  await preloadCache();

  // Setup authentication routes
  setupAuthRoutes(app);

  // Ultra-fast products endpoint with memory cache
  app.get('/api/products', (req, res) => {
    const start = Date.now();

    try {
      // Aggressive caching headers for client-side caching
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'ETag': `products-v2-${lastProductsCacheTime}`,
        'Last-Modified': new Date(lastProductsCacheTime).toUTCString(),
        'Vary': 'Accept-Encoding',
        'X-Cache': 'MEMORY-HIT'
      });

      // Check if client has fresh cache
      const ifNoneMatch = req.headers['if-none-match'];
      const expectedETag = `products-v2-${lastProductsCacheTime}`;

      if (ifNoneMatch === expectedETag) {
        res.status(304).end();
        return;
      }

      const category = req.query.category as string;
      let result = productsCache;

      // Filter by category if specified
      if (category && category !== 'all') {
        result = productsCache.filter(p => p.category === category);
      }

      const duration = Date.now() - start;
      res.set('X-Response-Time', `${duration}ms`);

      console.log(`⚡ Products instant response: ${duration}ms - ${result.length} items`);
      res.json(result);

      // Background refresh if cache is getting old
      if (Date.now() - lastProductsCacheTime > CACHE_TTL) {
        refreshProductsCache();
      }

    } catch (error) {
      console.error('❌ Products endpoint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Ultra-fast categories endpoint
  app.get('/api/categories', (req, res) => {
    const start = Date.now();

    try {
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `categories-v2-${lastCategoriesCacheTime}`,
        'X-Cache': 'MEMORY-HIT'
      });

      const duration = Date.now() - start;
      res.set('X-Response-Time', `${duration}ms`);

      console.log(`⚡ Categories served from memory in ${duration}ms`);
      res.json(categoriesCache);

      // Background refresh if needed
      if (Date.now() - lastCategoriesCacheTime > CACHE_TTL) {
        refreshCategoriesCache();
      }

    } catch (error) {
      console.error('❌ Categories endpoint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Other endpoints remain the same but with optimizations
  app.post('/api/orders', async (req, res) => {
    try {
      // Generate a proper tracking ID 
      const trackingId = `TRX${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    if (!trackingId) {
      throw new Error('Failed to generate tracking ID');
    }

      const orderData = {
        ...req.body,
        tracking_id: trackingId,
        status: 'pending'
      };

      // Ensure items are properly stringified
      if (orderData.items && typeof orderData.items !== 'string') {
        orderData.items = JSON.stringify(orderData.items);
      }

      if (orderData.payment_info && typeof orderData.payment_info !== 'string') {
        orderData.payment_info = JSON.stringify(orderData.payment_info);
      }

      console.log('Creating order with tracking ID:', trackingId);
      const order = await storage.createOrder(orderData);

      res.status(201).json({
        success: true,
        tracking_id: order.tracking_id,
        order_id: order.id,
        message: 'অর্ডার সফলভাবে তৈরি হয়েছে'
      });
    } catch (error) {
      console.error('❌ Order creation error:', error);
      res.status(500).json({ 
        success: false,
        message: 'অর্ডার তৈরি করতে সমস্যা হয়েছে' 
      });
    }
  });

  // User orders endpoint - protected
  app.get('/api/orders/user', async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Verify JWT token
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || "trynex_secret_key_2025";

      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userOrders = await storage.getUserOrders(decoded.id);
        res.json(userOrders);
      } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: 'ইউজার অর্ডার লোড করতে পারিনি' });
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
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { getAIChatResponse } = await import("./ai-chat");
      const { message, businessData, products, chatHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const reply = await getAIChatResponse({
        message,
        businessData,
        products: products || productsCache.slice(0, 20),
        chatHistory: chatHistory || []
      });

      res.json({ reply });
    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ 
        error: 'AI service temporarily unavailable',
        fallback: 'দুঃখিত, AI সেবা এখন উপলব্ধ নেই। অনুগ্রহ করে হোয়াটসঅ্যাপে যোগাযোগ করুন।'
      });
    }
  });

  // AI Product Recommendations endpoint  
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { getAIProductRecommendations } = await import("./ai-chat");
      const { userQuery, userBehavior, currentProduct } = req.body;

      const recommendations = await getAIProductRecommendations(
        productsCache,
        userQuery || '',
        userBehavior
      );

      res.json({ data: recommendations });
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      // Fallback to basic filtering
      const fallbackProducts = productsCache
        .filter(p => p.is_featured || p.is_latest)
        .slice(0, 6);
      res.json({ data: fallbackProducts });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      cache: {
        products: productsCache.length,
        categories: categoriesCache.length,
        lastUpdate: new Date(lastProductsCacheTime).toISOString()
      },
      uptime: process.uptime()
    });
  });

  return createServer(app);
}

// Background cache refresh functions
async function refreshProductsCache() {
  try {
    console.log('🔄 Refreshing products cache...');
    const products = await storage.getProducts();
    productsCache = products;
    lastProductsCacheTime = Date.now();
    console.log(`✅ Products cache refreshed - ${products.length} items`);
  } catch (error) {
    console.error('❌ Failed to refresh products cache:', error);
  }
}

async function refreshCategoriesCache() {
  try {
    console.log('🔄 Refreshing categories cache...');
    const categories = await storage.getCategories();
    categoriesCache = categories;
    lastCategoriesCacheTime = Date.now();
    console.log(`✅ Categories cache refreshed - ${categories.length} items`);
  } catch (error) {
    console.error('❌ Failed to refresh categories cache:', error);
  }
}
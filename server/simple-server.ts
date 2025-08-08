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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Ultra-optimized Products API with aggressive caching
  app.get('/api/products', async (req, res) => {
    try {
      const startTime = Date.now();
      console.log('🔍 Executing optimized products query...');
      
      // Aggressive cache headers for maximum performance
      res.set({
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=300, stale-if-error=86400',
        'ETag': `products-v2-${Date.now()}`,
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-DNS-Prefetch-Control': 'on'
      });
      
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      let products;
      
      if (category && category !== 'all') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      // Apply pagination for better performance
      const paginatedProducts = products.slice(offset, offset + limit);
      
      // Add performance metrics
      const duration = Date.now() - startTime;
      res.set('X-Response-Time', `${duration}ms`);
      res.set('X-Total-Count', products.length.toString());
      res.set('X-Pagination-Limit', limit.toString());
      res.set('X-Pagination-Offset', offset.toString());
      
      console.log(`✅ Products query completed in ${duration}ms - ${paginatedProducts.length} items returned (${products.length} total)`);
      
      res.json(paginatedProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({ message: 'পণ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Single product with caching
  app.get('/api/products/:id', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes
      
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'পণ্য পাওয়া যায়নি' });
      }
      res.json(product);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({ message: 'পণ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Enhanced Orders API with detailed customization support
  app.post('/api/orders', async (req, res) => {
    try {
      const trackingId = generateTrackingId();
      const orderData = {
        ...req.body,
        tracking_id: trackingId,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Enhanced validation for customization data
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
      const order = await storage.createOrder({ ...validatedData, tracking_id: trackingId });
      
      console.log(`✅ Order created: ${order.tracking_id}`);
      
      res.status(201).json({
        success: true,
        tracking_id: trackingId,
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

  // Get orders with enhanced filtering
  app.get('/api/orders', async (req, res) => {
    try {
      const { status, customer_phone, date_from, date_to } = req.query;
      
      // Add basic filtering logic here if needed
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

  // Get single order with enhanced details
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
      }
      
      // Parse JSON fields for frontend consumption
      const enhancedOrder = {
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        payment_info: typeof order.payment_info === 'string' ? JSON.parse(order.payment_info) : order.payment_info
      };
      
      res.json(enhancedOrder);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      res.status(500).json({ message: 'অর্ডার লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Update order status
  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      console.log(`✅ Order ${req.params.id} status updated to: ${status}`);
      
      res.json({
        success: true,
        order,
        message: 'অর্ডার স্ট্যাটাস আপডেট হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      res.status(500).json({ message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' });
    }
  });

  // Categories API with caching
  app.get('/api/categories', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=900'); // 15 minutes
      
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      res.status(500).json({ message: 'ক্যাটেগরি লোড করতে সমস্যা হয়েছে' });
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

  // Get analytics data
  app.get('/api/analytics', async (req, res) => {
    try {
      // Mock analytics data since we don't have real analytics collection yet
      const analytics = {
        overview: {
          total_revenue: 150000,
          revenue_change: 12.5,
          total_orders: 45,
          orders_change: 8.3,
          total_customers: 32,
          customers_change: 15.2,
          conversion_rate: 3.2,
          conversion_change: -2.1
        },
        monthly_revenue: [
          { month: 'জানুয়ারি', revenue: 45000, orders: 15 },
          { month: 'ফেব্রুয়ারি', revenue: 52000, orders: 18 },
          { month: 'মার্চ', revenue: 48000, orders: 16 },
          { month: 'এপ্রিল', revenue: 61000, orders: 22 },
          { month: 'মে', revenue: 58000, orders: 19 },
          { month: 'জুন', revenue: 65000, orders: 24 }
        ],
        top_products: [
          { name: 'কাস্টম মগ', sales: 45, revenue: 22500 },
          { name: 'কাস্টম টি-শার্ট', sales: 38, revenue: 19000 },
          { name: 'কাস্টম কীচেইন', sales: 32, revenue: 9600 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      res.status(500).json({ message: 'Analytics could not be loaded' });
    }
  });

  // Offers API
  app.get('/api/offers', async (req, res) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
      res.status(500).json({ message: 'অফার লোড করতে সমস্যা হয়েছে' });
    }
  });

  app.post('/api/offers', async (req, res) => {
    try {
      const offerData = {
        ...req.body,
        created_at: new Date()
      };
      
      const validatedData = insertOfferSchema.parse(offerData);
      const offer = await storage.createOffer(validatedData);
      
      res.status(201).json(offer);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      res.status(500).json({ message: 'অফার তৈরি করতে সমস্যা হয়েছে' });
    }
  });

  app.patch('/api/offers/:id', async (req, res) => {
    try {
      const offer = await storage.updateOffer(req.params.id, req.body);
      res.json(offer);
    } catch (error) {
      console.error('❌ Error updating offer:', error);
      res.status(500).json({ message: 'অফার আপডেট করতে সমস্যা হয়েছে' });
    }
  });

  app.delete('/api/offers/:id', async (req, res) => {
    try {
      await storage.deleteOffer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error deleting offer:', error);
      res.status(500).json({ message: 'অফার মুছতে সমস্যা হয়েছে' });
    }
  });

  // Promo Codes API
  app.get('/api/promo-codes', async (req, res) => {
    try {
      // Mock promo codes data
      const promoCodes = [
        {
          id: '1',
          code: 'SAVE10',
          description: '১০% ছাড়',
          discount_type: 'percentage',
          discount_value: 10,
          min_order_amount: 1000,
          usage_limit: 100,
          expires_at: '2025-12-31',
          is_active: true
        },
        {
          id: '2',
          code: 'WELCOME20',
          description: '২০% ছাড় নতুন গ্রাহকদের জন্য',
          discount_type: 'percentage',
          discount_value: 20,
          min_order_amount: 1500,
          usage_limit: 50,
          expires_at: '2025-12-31',
          is_active: true
        }
      ];
      res.json(promoCodes);
    } catch (error) {
      console.error('❌ Error fetching promo codes:', error);
      res.status(500).json({ message: 'প্রমো কোড লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Blogs API
  app.get('/api/blogs', async (req, res) => {
    try {
      // Mock blogs data
      const blogs: any[] = [];
      res.json(blogs);
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
      res.status(500).json({ message: 'ব্লগ লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    try {
      // Mock users data
      const users = [
        {
          id: 'user1',
          phone: '01747292277',
          firstName: 'Azim',
          lastName: 'Eazdhan',
          email: null,
          address: 'Dhaka, Bangladesh',
          profileImageUrl: null,
          createdAt: '2025-01-01T00:00:00Z'
        }
      ];
      res.json(users);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      res.status(500).json({ message: 'ব্যবহারকারী তথ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Custom Orders API for product customization
  app.get('/api/custom-orders', async (req, res) => {
    try {
      const customOrders = await storage.getCustomOrders();
      res.json(customOrders);
    } catch (error) {
      console.error('❌ Error fetching custom orders:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার লোড করতে সমস্যা হয়েছে' });
    }
  });

  app.post('/api/custom-orders', async (req, res) => {
    try {
      const customOrderData = {
        ...req.body,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Process custom images if provided
      if (req.body.customImages && req.body.customImages.length > 0) {
        // Convert base64 images to references (in production, upload to storage)
        customOrderData.hasCustomImages = true;
        customOrderData.imageCount = req.body.customImages.length;
        customOrderData.customImageData = JSON.stringify(req.body.customImages);
      }

      const customOrder = await storage.createCustomOrder(customOrderData);
      
      console.log(`✅ Custom order created: ${customOrder.id}`);
      
      res.status(201).json({
        success: true,
        customOrder,
        message: 'কাস্টম অর্ডার সফলভাবে তৈরি হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error creating custom order:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার তৈরিতে সমস্যা হয়েছে' });
    }
  });

  app.patch('/api/custom-orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const customOrder = await storage.updateCustomOrderStatus(parseInt(req.params.id), status);
      
      res.json({
        success: true,
        customOrder,
        message: 'কাস্টম অর্ডার স্ট্যাটাস আপডেট হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error updating custom order status:', error);
      res.status(500).json({ message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' });
    }
  });

  app.get('/api/custom-orders/:id', async (req, res) => {
    try {
      const customOrder = await storage.getCustomOrder(parseInt(req.params.id));
      if (!customOrder) {
        return res.status(404).json({ message: 'কাস্টম অর্ডার পাওয়া যায়নি' });
      }
      res.json(customOrder);
    } catch (error) {
      console.error('❌ Error fetching custom order:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Enhanced cart API for customization
  app.post('/api/cart', async (req, res) => {
    try {
      const cartData = req.body;
      
      // Process customization data
      if (cartData.customization) {
        cartData.customizationData = JSON.stringify(cartData.customization);
      }
      
      // Store custom images info
      if (cartData.customImages && cartData.customImages.length > 0) {
        cartData.hasCustomImages = true;
        cartData.customImageCount = cartData.customImages.length;
      }

      // For now, return success (implement actual cart storage as needed)
      res.json({
        success: true,
        message: 'কাস্টম পণ্য কার্টে যোগ করা হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      res.status(500).json({ message: 'কার্টে যোগ করতে সমস্যা হয়েছে' });
    }
  });

  // Settings API
  app.get('/api/settings', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60'); // 1 minute
      
      const settings = await storage.getSettings();
      
      // Convert settings array to object for easier access
      const settingsObj: any = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      res.json(settingsObj);
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      res.status(500).json({ message: 'Settings could not be loaded' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Performance monitoring
  app.use('/api/*', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Log slow requests
        console.warn(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
      }
    });
    next();
  });

  return createServer(app);
}
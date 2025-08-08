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

  // Optimized Products API with enhanced caching
  app.get('/api/products', async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Enhanced cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'ETag': `products-${Date.now()}`,
        'Vary': 'Accept-Encoding'
      });
      
      const category = req.query.category as string;
      let products;
      
      if (category && category !== 'all') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      // Add performance metrics
      const duration = Date.now() - startTime;
      res.set('X-Response-Time', `${duration}ms`);
      
      console.log(`✅ Products fetched in ${duration}ms - ${products.length} items`);
      
      res.json(products);
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
      const orderData = {
        ...req.body,
        tracking_id: generateTrackingId(),
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
      const order = await storage.createOrder(validatedData);
      
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

  // Custom Orders API
  app.get('/api/custom-orders', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=30'); // 30 seconds
      
      const customOrders = await storage.getCustomOrders();
      
      console.log(`✅ Fetched ${customOrders.length} custom orders`);
      
      res.json(customOrders);
    } catch (error) {
      console.error('❌ Error fetching custom orders:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার লোড করতে সমস্যা হয়েছে' });
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

  app.post('/api/custom-orders', async (req, res) => {
    try {
      const orderData = req.body;
      
      // Process and serialize custom images
      const customImagesData = JSON.stringify(orderData.customImages || []);
      
      const customOrderData = {
        productId: orderData.productId,
        productName: orderData.productName,
        productPrice: orderData.productPrice.toString(),
        quantity: orderData.quantity,
        selectedSize: orderData.selectedSize,
        selectedColor: orderData.selectedColor,
        customImageData: customImagesData,
        instructions: orderData.instructions || '',
        totalPrice: orderData.totalPrice.toString(),
        customerName: orderData.customerName,
        phone: orderData.phone,
        email: orderData.email || null,
        address: orderData.address,
        hasCustomImages: orderData.hasCustomImages || false,
        imageCount: orderData.imageCount || 0,
        status: 'pending'
      };
      
      const customOrder = await storage.createCustomOrder(customOrderData);
      
      console.log(`✅ Created custom order #${customOrder.id} for ${customOrder.customerName}`);
      
      res.json({
        success: true,
        customOrder,
        message: 'কাস্টম অর্ডার সফলভাবে তৈরি হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error creating custom order:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার তৈরি করতে সমস্যা হয়েছে' });
    }
  });

  app.patch('/api/custom-orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const customOrder = await storage.updateCustomOrderStatus(parseInt(req.params.id), status);
      
      console.log(`✅ Custom order #${req.params.id} status updated to: ${status}`);
      
      res.json({
        success: true,
        customOrder,
        message: 'কাস্টম অর্ডার স্ট্যাটাস আপডেট হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error updating custom order status:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' });
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
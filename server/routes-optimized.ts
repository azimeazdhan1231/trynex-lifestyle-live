import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseStorage } from "./supabase-storage";
import { memoryStorage } from "./memory-storage";
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
        products = await supabaseStorage.getProductsByCategory(category);
      } else {
        products = await supabaseStorage.getProducts();
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
      
      const product = await supabaseStorage.getProduct(req.params.id);
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
      
      // Debug log to check data types
      console.log('🔍 Order data before validation:', {
        total: orderData.total,
        totalType: typeof orderData.total,
        phone: orderData.phone,
        phoneType: typeof orderData.phone
      });

      // Convert numeric fields to strings to match schema
      const dataToValidate = {
        ...orderData,
        total: String(orderData.total || 0),
        phone: String(orderData.phone || '')
      };

      console.log('🔍 Data after conversion:', {
        total: dataToValidate.total,
        totalType: typeof dataToValidate.total
      });

      const validatedData = insertOrderSchema.parse(dataToValidate);
      
      let order;
      try {
        order = await supabaseStorage.createOrder(validatedData);
      } catch (dbError) {
        console.warn('⚠️ Supabase unavailable for orders, using memory storage');
        order = await memoryStorage.createOrder(validatedData);
      }
      
      console.log(`✅ Order created: ${order.tracking_id}`);
      
      // Return the complete order object for frontend compatibility
      res.status(201).json({
        ...order,
        tracking_number: order.tracking_id, // For compatibility with existing frontend code
        success: true,
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
      const orders = await supabaseStorage.getOrders();
      
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

  // Update order status endpoint
  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      console.log(`📝 Updating order ${id} status to: ${status}`);
      
      const updatedOrder = await supabaseStorage.updateOrderStatus(id, status);
      
      console.log(`✅ Order ${id} status updated successfully to ${status}`);
      res.json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error('❌ Order status update error:', error);
      res.status(500).json({ 
        error: 'Failed to update order status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get single order with enhanced details
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const order = await supabaseStorage.getOrder(req.params.id);
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
      const order = await supabaseStorage.updateOrderStatus(req.params.id, status);
      
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
      
      const categories = await supabaseStorage.getCategories();
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
      await supabaseStorage.createAnalytics(validatedData);
      
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Analytics error:', error);
      res.status(500).json({ message: 'Analytics data could not be saved' });
    }
  });

  // Custom Orders - Simplified for now
  // Custom Orders endpoints
  app.get('/api/custom-orders', async (req, res) => {
    try {
      const customOrders = await supabaseStorage.getCustomOrders();
      res.json(customOrders);
    } catch (error) {
      console.error('❌ Error fetching custom orders:', error);
      res.status(500).json({ message: 'কাস্টম অর্ডার লোড করতে সমস্যা হয়েছে' });
    }
  });

  app.post('/api/custom-orders', async (req, res) => {
    try {
      console.log('Creating custom order with data:', req.body);
      
      // Set proper JSON content type and CORS headers
      res.setHeader('Content-Type', 'application/json');
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      const orderData = req.body;
      
      // Map the frontend data to the expected schema format
      const customOrderData = {
        productId: orderData.productId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        customerAddress: orderData.customerAddress || "ঢাকা",
        customizationData: orderData.customizationData,
        totalPrice: parseFloat(orderData.totalPrice || "0"),
        status: orderData.status || "pending_advance_payment",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const customOrder = await supabaseStorage.createCustomOrder(customOrderData);
      console.log('Custom order created successfully:', customOrder.id);
      
      res.status(201).json({ 
        success: true,
        id: customOrder.id,
        data: customOrder,
        message: "কাস্টম অর্ডার সফলভাবে তৈরি হয়েছে"
      });
    } catch (error: any) {
      console.error('Failed to create custom order:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to create custom order' 
      });
    }
  });

  app.get('/api/custom-orders/:id', async (req, res) => {
    try {
      const customOrder = await supabaseStorage.getCustomOrder(req.params.id);
      if (!customOrder) {
        return res.status(404).json({ error: 'Custom order not found' });
      }
      res.json(customOrder);
    } catch (error: any) {
      console.error('Failed to fetch custom order:', error);
      res.status(500).json({ error: 'Failed to fetch custom order' });
    }
  });

  app.patch('/api/custom-orders/:id', async (req, res) => {
    try {
      const { status } = req.body;
      const customOrder = await supabaseStorage.updateCustomOrderStatus(req.params.id, status);
      res.json(customOrder);
    } catch (error: any) {
      console.error('Failed to update custom order:', error);
      res.status(500).json({ error: 'Failed to update custom order' });
    }
  });

  // Settings API
  app.get('/api/settings', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60'); // 1 minute
      
      const settings = await supabaseStorage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      res.status(500).json({ message: 'Settings could not be loaded' });
    }
  });

  // Order tracking by tracking ID
  app.get('/api/orders/track/:trackingId', async (req, res) => {
    try {
      const trackingId = req.params.trackingId;
      
      if (!trackingId) {
        return res.status(400).json({ 
          success: false,
          message: 'ট্র্যাকিং আইডি প্রয়োজন' 
        });
      }
      
      console.log(`🔍 Tracking order with ID: ${trackingId}`);
      
      const order = await supabaseStorage.getOrderByTrackingId(trackingId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false,
          message: 'এই ট্র্যাকিং আইডি দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি' 
        });
      }
      
      // Parse JSON fields for frontend consumption
      const enhancedOrder = {
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        payment_info: typeof order.payment_info === 'string' ? JSON.parse(order.payment_info) : order.payment_info,
        custom_images: typeof order.custom_images === 'string' ? JSON.parse(order.custom_images) : order.custom_images
      };
      
      console.log(`✅ Order found: ${order.customer_name} - ${order.status}`);
      
      res.json({
        success: true,
        order: enhancedOrder
      });
    } catch (error) {
      console.error('❌ Error tracking order:', error);
      res.status(500).json({ 
        success: false,
        message: 'অর্ডার ট্র্যাকিং করতে সমস্যা হয়েছে' 
      });
    }
  });

  // Products API
  app.get('/api/products', async (req, res) => {
    try {
      console.log('🔍 Fetching products from Supabase...');
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      
      const products = await supabaseStorage.getProducts();
      console.log(`✅ Products fetched successfully: ${products.length} products`);
      
      res.json(products);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({ message: 'পণ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Get single product
  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await supabaseStorage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'পণ্য পাওয়া যায়নি' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({ message: 'পণ্য লোড করতে সমস্যা হয়েছে' });
    }
  });

  // Create product
  app.post('/api/products', async (req, res) => {
    try {
      const productData = {
        ...req.body,
        price: String(req.body.price), // Ensure price is string
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const validatedData = insertProductSchema.parse(productData);
      const product = await supabaseStorage.createProduct(validatedData);
      
      console.log('✅ Product created successfully:', product.name);
      res.status(201).json({
        success: true,
        product,
        message: 'পণ্য সফলভাবে যোগ করা হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error creating product:', error);
      res.status(500).json({ message: 'পণ্য তৈরি করতে সমস্যা হয়েছে' });
    }
  });

  // Update product - This was missing!
  app.patch('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log(`📝 Updating product ${id} with:`, updates);

      // Validate and sanitize the update data
      const validatedUpdates: any = {};

      if (updates.name !== undefined) {
        validatedUpdates.name = String(updates.name).trim();
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
      }
      if (updates.image_url !== undefined) {
        validatedUpdates.image_url = String(updates.image_url || '').trim();
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

      validatedUpdates.updated_at = new Date();

      const updatedProduct = await supabaseStorage.updateProduct(id, validatedUpdates);

      if (!updatedProduct) {
        return res.status(404).json({ error: 'পণ্য পাওয়া যায়নি' });
      }

      console.log(`✅ Product ${id} updated successfully`);
      res.json({
        success: true,
        product: updatedProduct,
        message: 'পণ্য সফলভাবে আপডেট হয়েছে'
      });

    } catch (error) {
      console.error('❌ Failed to update product:', error);
      res.status(500).json({ error: 'পণ্য আপডেট করতে সমস্যা হয়েছে' });
    }
  });

  // Delete product
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const success = await supabaseStorage.deleteProduct(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: 'পণ্য পাওয়া যায়নি' });
      }
      
      console.log(`✅ Product ${req.params.id} deleted successfully`);
      res.json({
        success: true,
        message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      res.status(500).json({ message: 'পণ্য মুছতে সমস্যা হয়েছে' });
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
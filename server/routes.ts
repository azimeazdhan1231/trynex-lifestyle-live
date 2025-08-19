
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuthRoutes } from "./auth-routes";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Product, Order, Category, Offer, User, CustomOrder } from "@shared/schema";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "trynex_secret_key_2025";

// Admin authentication middleware
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // CORS preflight handler
  app.options('*', (req, res) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.status(204).end();
  });

  // Products endpoints
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // Categories endpoints
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Orders endpoints
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = req.body;
      const trackingId = `TRX${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      // Map frontend order data to database schema
      const mappedOrderData = {
        tracking_id: trackingId,
        customer_name: orderData.customerName,
        district: orderData.district,
        thana: orderData.thana,
        address: orderData.customerAddress,
        phone: orderData.customerPhone,
        payment_info: JSON.stringify({
          method: orderData.paymentMethod,
          trxId: orderData.trxId,
          screenshot: orderData.paymentScreenshot
        }),
        status: 'pending',
        items: JSON.stringify(orderData.items),
        total: orderData.total.toString(),
        custom_instructions: orderData.notes || '',
        custom_images: JSON.stringify([])
      };
      
      const order = await storage.createOrder(mappedOrderData);
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ADMIN ENDPOINTS WITH AUTHENTICATION
  app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Failed to fetch admin products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.patch('/api/products/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedProduct = await storage.updateProduct(id, updateData);
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.patch('/api/orders/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Failed to update order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // Enhanced admin dashboard stats
  app.get('/api/admin/dashboard-stats', authenticateAdmin, async (req, res) => {
    try {
      const [products, orders, categories] = await Promise.all([
        storage.getProducts(),
        storage.getOrders(),
        storage.getCategories()
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthOrders = orders.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      
      const lastMonthOrders = orders.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === (currentMonth - 1 < 0 ? 11 : currentMonth - 1) && 
               orderDate.getFullYear() === (currentMonth - 1 < 0 ? currentYear - 1 : currentYear);
      });

      const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);

      const revenueGrowth = lastMonthRevenue > 0 ? 
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
      const orderGrowth = lastMonthOrders.length > 0 ? 
        ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100).toFixed(1) : 0;

      const stats = {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalCustomers: Array.from(new Set(orders.map(o => o.phone))).length,
        totalProducts: products.length,
        revenueGrowth: parseFloat(revenueGrowth as string),
        orderGrowth: parseFloat(orderGrowth as string),
        activeCategories: categories.filter(c => c.is_active).length,
        lowStockProducts: products.filter(p => p.stock < 10).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Recent orders for dashboard
  app.get('/api/admin/recent-orders', authenticateAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const orders = await storage.getOrders();
      
      const recentOrders = orders
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit)
        .map(order => ({
          id: order.id,
          tracking_id: order.tracking_id,
          customer_name: order.customer_name,
          phone: order.phone,
          district: order.district,
          thana: order.thana,
          total: order.total,
          status: order.status,
          created_at: order.created_at
        }));

      res.json(recentOrders);
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      res.status(500).json({ error: 'Failed to fetch recent orders' });
    }
  });

  // Top products for dashboard
  app.get('/api/admin/top-products', authenticateAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const [products, orders] = await Promise.all([
        storage.getProducts(),
        storage.getOrders()
      ]);

      // Calculate product sales
      const productSales: { [key: string]: { total_sales: number, revenue: number } } = {};
      
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.id || item.product_id;
            if (productId) {
              if (!productSales[productId]) {
                productSales[productId] = { total_sales: 0, revenue: 0 };
              }
              productSales[productId].total_sales += item.quantity || 1;
              productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
            }
          });
        }
      });

      // Combine with product info and sort by revenue
      const topProducts = products
        .map(product => ({
          id: product.id,
          name: product.name,
          category: product.category || 'অন্যান্য',
          total_sales: productSales[product.id]?.total_sales || 0,
          revenue: productSales[product.id]?.revenue || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

      res.json(topProducts);
    } catch (error) {
      console.error('Failed to fetch top products:', error);
      res.status(500).json({ error: 'Failed to fetch top products' });
    }
  });

  // Legacy stats endpoint for compatibility
  app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
      const [products, orders] = await Promise.all([
        storage.getProducts(),
        storage.getOrders()
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
      const stats = {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        lowStockProducts: products.filter(p => p.stock < 10).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Admin Products CRUD
  app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(400).json({ error: 'Failed to create product' });
    }
  });

  app.patch('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const product = await storage.updateProduct(id, updateData);
      res.json(product);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(400).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(400).json({ error: 'Failed to delete product' });
    }
  });

  // Admin Orders Management
  app.patch('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error('Failed to update order status:', error);
      res.status(400).json({ error: 'Failed to update order status' });
    }
  });

  // Order Tracking Endpoints
  app.get('/api/orders/track/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;
      console.log('🔍 Tracking order with ID:', trackingId);
      
      // Get all orders and find by tracking_id
      const orders = await storage.getOrders();
      const order = orders.find(o => o.tracking_id === trackingId || o.id === trackingId);
      
      if (!order) {
        console.log('❌ Order not found for tracking ID:', trackingId);
        return res.status(404).json({ 
          success: false, 
          message: 'অর্ডার খুঁজে পাওয়া যায়নি',
          trackingId 
        });
      }

      console.log('✅ Order found:', { id: order.id, tracking_id: order.tracking_id, status: order.status });

      res.json({ 
        success: true, 
        order: {
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        } 
      });
    } catch (error) {
      console.error('Failed to track order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে',
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Backward compatibility endpoint
  app.get('/api/track/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;
      
      // Get all orders and find by tracking_id
      const orders = await storage.getOrders();
      const order = orders.find(o => o.tracking_id === trackingId || o.id === trackingId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'অর্ডার খুঁজে পাওয়া যায়নি' 
        });
      }

      res.json({ 
        success: true, 
        order: {
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        } 
      });
    } catch (error) {
      console.error('Failed to track order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে' 
      });
    }
  });

  // Settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const settingsObj: any = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      res.json(settingsObj);
    } catch (error) {
      console.error('Settings error:', error);
      res.status(500).json({ message: 'Settings could not be loaded' });
    }
  });

  // Admin Settings Management
  app.patch('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
      const settings = req.body;
      const updatedSettings = [];
      
      for (const [key, value] of Object.entries(settings)) {
        const updated = await storage.updateSetting(key, value as string);
        updatedSettings.push(updated);
      }
      
      res.json({ success: true, settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      res.status(400).json({ error: 'Failed to update settings' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return createServer(app);
}

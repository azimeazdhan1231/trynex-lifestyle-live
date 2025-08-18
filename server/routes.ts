
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
      
      const order = await storage.createOrder({
        ...orderData,
        tracking_id: trackingId
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to create order' });
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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return createServer(app);
}

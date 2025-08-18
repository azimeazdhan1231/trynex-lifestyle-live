import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuthRoutes } from "./auth-routes";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Product, Order, Category, Offer, User, CustomOrder } from "@shared/schema";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";

// JWT Secret for authentication
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "trynex_secret_key_2025";

export function setupRoutes(app: Express): Server {
  const server = createServer(app);

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

  // Simple products endpoint - direct from Supabase without caching
  app.get('/api/products', async (req, res) => {
    try {
      console.log('🔍 Fetching products directly from Supabase...');
      const startTime = Date.now();
      
      const products = await storage.getProducts();
      const duration = Date.now() - startTime;
      
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Products-Count': products.length.toString(),
        'X-Data-Source': 'supabase',
        'X-Response-Time': `${duration}ms`
      });

      console.log(`✅ Products fetched from Supabase in ${duration}ms - ${products.length} items`);
      res.json(products);

    } catch (error) {
      console.error('❌ Failed to fetch products from Supabase:', error);
      res.status(500).json({ 
        message: 'পণ্য লোড করতে সমস্যা হয়েছে',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Simple categories endpoint - direct from Supabase without caching
  app.get('/api/categories', async (req, res) => {
    try {
      console.log('🔍 Fetching categories directly from Supabase...');
      const startTime = Date.now();
      
      const categories = await storage.getCategories();
      const duration = Date.now() - startTime;

      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Categories-Count': categories.length.toString(),
        'X-Data-Source': 'supabase',
        'X-Response-Time': `${duration}ms`
      });

      console.log(`✅ Categories fetched from Supabase in ${duration}ms - ${categories.length} items`);
      res.json(categories);

    } catch (error) {
      console.error('❌ Failed to fetch categories from Supabase:', error);
      res.status(500).json({ 
        message: 'ক্যাটেগরি লোড করতে সমস্যা হয়েছে',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get individual product by ID
  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      console.log(`✅ Product fetched: ${id}`);
      res.json(product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
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

  // Settings endpoint
  app.get('/api/settings', async (req, res) => {
    try {
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

  // Create order endpoint
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      console.log('✅ Order created:', order.id);
      res.status(201).json(order);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Create custom order endpoint
  app.post('/api/custom-orders', async (req, res) => {
    try {
      const customOrderData = req.body;
      const customOrder = await storage.createCustomOrder(customOrderData);
      
      console.log('✅ Custom order created:', customOrder.tracking_id);
      res.status(201).json(customOrder);
    } catch (error) {
      console.error('Failed to create custom order:', error);
      res.status(500).json({ error: 'Failed to create custom order' });
    }
  });

  // Get orders
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Get custom orders
  app.get('/api/custom-orders', async (req, res) => {
    try {
      const customOrders = await storage.getCustomOrders();
      res.json(customOrders);
    } catch (error) {
      console.error('Failed to fetch custom orders:', error);
      res.status(500).json({ error: 'Failed to fetch custom orders' });
    }
  });

  // AI Chat endpoint (simplified)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'বার্তা প্রয়োজন' });
      }

      // Simple fallback response
      const response = "আমি একজন AI সহায়ক। আপনি আমাদের প্রোডাক্ট সম্পর্কে জানতে চাইলে বা কোন সাহায্য প্রয়োজন হলে হোয়াটসঅ্যাপে (+8801648534981) যোগাযোগ করুন।";

      res.json({ reply: response });
    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ 
        error: 'দুঃখিত, আমি এখন উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন।'
      });
    }
  });

  // Search products
  app.get('/api/search/products', async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const products = await storage.getProducts();
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(query.toLowerCase()))
      );

      res.json(filtered);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  return server;
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";
import { setupAuthRoutes } from "./auth-routes";
import { insertOrderSchema, insertProductSchema, insertOfferSchema, insertCategorySchema } from "@shared/schema";

function generateTrackingId(): string {
  return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Products API with caching
  app.get('/api/products', async (req, res) => {
    try {
      // Add cache headers for better performance
      res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
      
      const category = req.query.category as string;
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });

  // Orders API
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        tracking_id: generateTrackingId(),
        status: 'pending'
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  // Offers API
  app.get('/api/offers', async (req, res) => {
    try {
      const offers = await storage.getActiveOffers();
      res.json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ message: 'Failed to fetch offers' });
    }
  });

  app.post('/api/offers', async (req, res) => {
    try {
      const validatedData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(validatedData);
      res.status(201).json(offer);
    } catch (error) {
      console.error('Error creating offer:', error);
      res.status(500).json({ message: 'Failed to create offer' });
    }
  });

  // Categories API with caching
  app.get('/api/categories', async (req, res) => {
    try {
      // Add cache headers for better performance
      res.set('Cache-Control', 'public, max-age=900'); // Cache for 15 minutes
      
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  // Settings API
  app.get('/api/settings', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
      
      const settings = await storage.getSettings();
      
      // Convert settings array to object for easier access
      const settingsObj: any = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      res.json(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const { key, value } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ message: 'Key and value are required' });
      }
      
      const setting = await storage.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ message: 'Failed to update setting' });
    }
  });

  // Custom orders API with image support
  app.post('/api/custom-orders', async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // For now, we'll store custom orders as regular orders with custom flag
      const customOrder = await storage.createOrder({
        tracking_id: generateTrackingId(),
        customer_name: orderData.name,
        phone: orderData.whatsapp,
        address: orderData.address,
        items: JSON.stringify([{
          name: orderData.productName,
          customization: orderData.customization,
          quantity: orderData.quantity,
          price: orderData.totalPrice,
          paymentMethod: orderData.paymentMethod,
          trxId: orderData.trxId,
          paymentScreenshot: orderData.paymentScreenshot
        }]),
        total: orderData.totalPrice,
        status: orderData.status,
        payment_info: JSON.stringify({
          method: orderData.paymentMethod,
          trxId: orderData.trxId,
          screenshot: orderData.paymentScreenshot
        })
      });
      
      res.status(201).json(customOrder);
    } catch (error) {
      console.error('Error creating custom order:', error);
      res.status(500).json({ message: 'Failed to create custom order' });
    }
  });

  // Start server
  const httpServer = createServer(app);
  return httpServer;
}
import type { Express } from "express";
import { storage } from "./storage";
import { optimizedStorage } from "./optimized-storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Product, Order, Category, Offer, CustomOrder, PromoCode, SiteSettings, User, Analytics } from "@shared/schema";
import { insertProductSchema, insertOrderSchema, insertCategorySchema, insertOfferSchema, insertPromoCodeSchema, insertSiteSettingsSchema, insertAnalyticsSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "trynex_secret_key_2025";

// Admin authentication middleware
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'অ্যাক্সেস টোকেন প্রয়োজন' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'অবৈধ টোকেন' });
  }
};

export function setupAdminRoutes(app: Express) {
  // Admin login with automatic admin user creation for testing
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রয়োজন' });
      }

      let admin = await storage.getAdminByEmail(email);
      
      // Create default admin if doesn't exist (for development)
      if (!admin && email === 'admin@trynex.com' && password === 'admin123') {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await storage.createAdmin({
          email: 'admin@trynex.com',
          password: hashedPassword
        });
        console.log('✅ Default admin user created for development');
      }
      
      if (!admin) {
        return res.status(401).json({ error: 'অবৈধ ইমেইল বা পাসওয়ার্ড' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'অবৈধ ইমেইল বা পাসওয়ার্ড' });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        admin: { id: admin.id, email: admin.email }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'লগইন ব্যর্থ হয়েছে' });
    }
  });

  // ADMIN PRODUCT MANAGEMENT
  app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
      const products = await optimizedStorage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Failed to fetch products for admin:', error);
      res.status(500).json({ error: 'পণ্য লোড করতে ব্যর্থ' });
    }
  });

  app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      
      // Clear cache after creating product
      console.log('✅ Product created:', product.id);
      res.status(201).json(product);
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({ error: 'পণ্য তৈরি করতে ব্যর্থ' });
    }
  });

  app.put('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const product = await storage.updateProduct(id, updates);
      console.log('✅ Product updated:', id);
      res.json(product);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: 'পণ্য আপডেট করতে ব্যর্থ' });
    }
  });

  app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      
      console.log('✅ Product deleted:', id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ error: 'পণ্য ডিলিট করতে ব্যর্থ' });
    }
  });

  // ADMIN CATEGORY MANAGEMENT
  app.get('/api/admin/categories', authenticateAdmin, async (req, res) => {
    try {
      const categories = await optimizedStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Failed to fetch categories for admin:', error);
      res.status(500).json({ error: 'ক্যাটেগরি লোড করতে ব্যর্থ' });
    }
  });

  app.post('/api/admin/categories', authenticateAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      
      console.log('✅ Category created:', category.id);
      res.status(201).json(category);
    } catch (error) {
      console.error('Failed to create category:', error);
      res.status(500).json({ error: 'ক্যাটেগরি তৈরি করতে ব্যর্থ' });
    }
  });

  app.put('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const category = await storage.updateCategory(id, updates);
      console.log('✅ Category updated:', id);
      res.json(category);
    } catch (error) {
      console.error('Failed to update category:', error);
      res.status(500).json({ error: 'ক্যাটেগরি আপডেট করতে ব্যর্থ' });
    }
  });

  app.delete('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      
      console.log('✅ Category deleted:', id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete category:', error);
      res.status(500).json({ error: 'ক্যাটেগরি ডিলিট করতে ব্যর্থ' });
    }
  });

  // ADMIN ORDER MANAGEMENT
  app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch orders for admin:', error);
      res.status(500).json({ error: 'অর্ডার লোড করতে ব্যর্থ' });
    }
  });

  app.get('/api/admin/custom-orders', authenticateAdmin, async (req, res) => {
    try {
      const customOrders = await storage.getCustomOrders();
      res.json(customOrders);
    } catch (error) {
      console.error('Failed to fetch custom orders for admin:', error);
      res.status(500).json({ error: 'কাস্টম অর্ডার লোড করতে ব্যর্থ' });
    }
  });

  app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      console.log('✅ Order status updated:', id, 'to', status);
      res.json(order);
    } catch (error) {
      console.error('Failed to update order status:', error);
      res.status(500).json({ error: 'অর্ডার স্ট্যাটাস আপডেট করতে ব্যর্থ' });
    }
  });

  // ADMIN OFFERS MANAGEMENT
  app.get('/api/admin/offers', authenticateAdmin, async (req, res) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      console.error('Failed to fetch offers for admin:', error);
      res.status(500).json({ error: 'অফার লোড করতে ব্যর্থ' });
    }
  });

  app.post('/api/admin/offers', authenticateAdmin, async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      
      console.log('✅ Offer created:', offer.id);
      res.status(201).json(offer);
    } catch (error) {
      console.error('Failed to create offer:', error);
      res.status(500).json({ error: 'অফার তৈরি করতে ব্যর্থ' });
    }
  });

  app.put('/api/admin/offers/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const offer = await storage.updateOffer(id, updates);
      console.log('✅ Offer updated:', id);
      res.json(offer);
    } catch (error) {
      console.error('Failed to update offer:', error);
      res.status(500).json({ error: 'অফার আপডেট করতে ব্যর্থ' });
    }
  });

  app.delete('/api/admin/offers/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOffer(id);
      
      console.log('✅ Offer deleted:', id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete offer:', error);
      res.status(500).json({ error: 'অফার ডিলিট করতে ব্যর্থ' });
    }
  });

  // ADMIN PROMO CODES MANAGEMENT
  app.get('/api/admin/promo-codes', authenticateAdmin, async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      res.status(500).json({ error: 'প্রোমো কোড লোড করতে ব্যর্থ' });
    }
  });

  app.post('/api/admin/promo-codes', authenticateAdmin, async (req, res) => {
    try {
      const promoCodeData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(promoCodeData);
      
      console.log('✅ Promo code created:', promoCode.id);
      res.status(201).json(promoCode);
    } catch (error) {
      console.error('Failed to create promo code:', error);
      res.status(500).json({ error: 'প্রোমো কোড তৈরি করতে ব্যর্থ' });
    }
  });

  app.put('/api/admin/promo-codes/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const promoCode = await storage.updatePromoCode(id, updates);
      console.log('✅ Promo code updated:', id);
      res.json(promoCode);
    } catch (error) {
      console.error('Failed to update promo code:', error);
      res.status(500).json({ error: 'প্রোমো কোড আপডেট করতে ব্যর্থ' });
    }
  });

  app.delete('/api/admin/promo-codes/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePromoCode(id);
      
      console.log('✅ Promo code deleted:', id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete promo code:', error);
      res.status(500).json({ error: 'প্রোমো কোড ডিলিট করতে ব্যর্থ' });
    }
  });

  // ADMIN SITE SETTINGS MANAGEMENT
  app.get('/api/admin/site-settings', authenticateAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
      res.status(500).json({ error: 'সাইট সেটিংস লোড করতে ব্যর্থ' });
    }
  });

  app.put('/api/admin/site-settings/:key', authenticateAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;
      
      const setting = await storage.updateSetting(key, value, description);
      console.log('✅ Site setting updated:', key);
      res.json(setting);
    } catch (error) {
      console.error('Failed to update site setting:', error);
      res.status(500).json({ error: 'সাইট সেটিং আপডেট করতে ব্যর্থ' });
    }
  });

  app.post('/api/admin/site-settings', authenticateAdmin, async (req, res) => {
    try {
      const settingData = insertSiteSettingsSchema.parse(req.body);
      const setting = await storage.createSetting(settingData);
      
      console.log('✅ Site setting created:', setting.key);
      res.status(201).json(setting);
    } catch (error) {
      console.error('Failed to create site setting:', error);
      res.status(500).json({ error: 'সাইট সেটিং তৈরি করতে ব্যর্থ' });
    }
  });

  // ADMIN CUSTOMER MANAGEMENT
  app.get('/api/admin/customers', authenticateAdmin, async (req, res) => {
    try {
      const customers = await storage.getUsers();
      res.json(customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      res.status(500).json({ error: 'কাস্টমার তথ্য লোড করতে ব্যর্থ' });
    }
  });

  app.get('/api/admin/customers/:id/orders', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userOrders = await storage.getUserOrders(id);
      res.json(userOrders);
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      res.status(500).json({ error: 'কাস্টমার অর্ডার লোড করতে ব্যর্থ' });
    }
  });

  // ADMIN ANALYTICS
  app.get('/api/admin/analytics', authenticateAdmin, async (req, res) => {
    try {
      const { startDate, endDate, eventType } = req.query;
      const analytics = await storage.getAnalytics(startDate as string, endDate as string, eventType as string);
      res.json(analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      res.status(500).json({ error: 'অ্যানালিটিক্স লোড করতে ব্যর্থ' });
    }
  });

  // COMPREHENSIVE DASHBOARD STATS
  app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
      const [products, orders, customOrders, categories, promoCodes, users] = await Promise.all([
        storage.getProducts(),
        storage.getOrders(),
        storage.getCustomOrders(),
        storage.getCategories(),
        storage.getPromoCodes(),
        storage.getUsers()
      ]);

      // Calculate revenue trends (last 7 days)
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentOrders = orders.filter(order => 
        order.created_at && new Date(order.created_at) >= weekAgo
      );

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
      const weeklyRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);

      // Calculate popular categories
      const categoryStats: { [key: string]: number } = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const category = item.category || 'অন্যান্য';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
          });
        }
      });

      const stats = {
        // Basic counts
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomOrders: customOrders.length,
        totalCategories: categories.length,
        totalPromoCodes: promoCodes.length,
        totalCustomers: users.length,
        
        // Order status breakdown
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        
        // Revenue analytics
        totalRevenue,
        weeklyRevenue,
        averageOrderValue: totalRevenue / (orders.length || 1),
        
        // Growth metrics
        newOrdersThisWeek: recentOrders.length,
        revenueGrowth: weeklyRevenue > 0 ? ((weeklyRevenue / (totalRevenue - weeklyRevenue)) * 100).toFixed(1) : '0',
        
        // Product insights
        featuredProducts: products.filter(p => p.is_featured).length,
        latestProducts: products.filter(p => p.is_latest).length,
        bestSellingProducts: products.filter(p => p.is_best_selling).length,
        lowStockProducts: products.filter(p => p.stock < 10).length,
        
        // Active promotions
        activeOffers: (await storage.getOffers()).filter(o => o.active).length,
        activePromoCodes: promoCodes.filter(p => p.is_active).length,
        
        // Category popularity
        topCategories: Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
        
        // Recent activity
        recentOrders: orders.slice(-10).reverse(),
        recentCustomOrders: customOrders.slice(-5).reverse()
      };

      res.json(stats);
    } catch (error) {
      console.error('Failed to fetch comprehensive admin stats:', error);
      res.status(500).json({ error: 'স্ট্যাটিস্টিক্স লোড করতে ব্যর্থ' });
    }
  });

  // BULK OPERATIONS
  app.post('/api/admin/products/bulk-update', authenticateAdmin, async (req, res) => {
    try {
      const { productIds, updates } = req.body;
      
      const updatedProducts = await Promise.all(
        productIds.map((id: string) => storage.updateProduct(id, updates))
      );
      
      console.log('✅ Bulk product update completed:', productIds.length, 'products');
      res.json(updatedProducts);
    } catch (error) {
      console.error('Failed to bulk update products:', error);
      res.status(500).json({ error: 'বাল্ক আপডেট ব্যর্থ হয়েছে' });
    }
  });

  app.post('/api/admin/orders/bulk-status-update', authenticateAdmin, async (req, res) => {
    try {
      const { orderIds, status } = req.body;
      
      const updatedOrders = await Promise.all(
        orderIds.map((id: string) => storage.updateOrderStatus(id, status))
      );
      
      console.log('✅ Bulk order status update completed:', orderIds.length, 'orders to', status);
      res.json(updatedOrders);
    } catch (error) {
      console.error('Failed to bulk update order status:', error);
      res.status(500).json({ error: 'বাল্ক স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' });
    }
  });
}
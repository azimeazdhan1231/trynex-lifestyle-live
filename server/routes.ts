import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AIChatbot, type ChatMessage } from "./ai-chatbot";

const aiChatbot = new AIChatbot();
import { setupAuth, isAuthenticated, optionalAuth } from "./replitAuth";
import { 
  insertOrderSchema, insertProductSchema, insertOfferSchema,
  insertCategorySchema, insertPromoCodeSchema, insertAnalyticsSchema,
  insertSiteSettingsSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "trynex_secret_key_2025";

// Simple authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware (keeping old system for compatibility)
  await setupAuth(app);

  // Simple Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { phone, password, firstName, lastName, address } = req.body;

      if (!phone || !password || !firstName || !address) {
        return res.status(400).json({ message: 'সব তথ্য দিন' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ message: 'এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট আছে' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        phone,
        password: hashedPassword,
        firstName,
        lastName: lastName || '',
        address,
        email: null,
        profileImageUrl: null
      });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'অ্যাকাউন্ট তৈরি হয়েছে',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'রেজিস্ট্রেশন ব্যর্থ' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ message: 'ফোন নম্বর এবং পাসওয়ার্ড দিন' });
      }

      // Find user
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(400).json({ message: 'ভুল ফোন নম্বর বা পাসওয়ার্ড' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'ভুল ফোন নম্বর বা পাসওয়ার্ড' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'সফলভাবে লগইন হয়েছে',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'লগইন ব্যর্থ' });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Keep old auth routes for compatibility
  app.get('/api/auth/user-old', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Blog API routes
  app.get('/api/blogs', async (req, res) => {
    try {
      const blogs = await storage.getBlogs();
      res.json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ message: 'Failed to fetch blogs' });
    }
  });

  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      // Increment view count
      await storage.incrementBlogViews(req.params.id);
      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ message: 'Failed to fetch blog' });
    }
  });

  app.post('/api/blogs', async (req, res) => {
    try {
      const blog = await storage.createBlog(req.body);
      res.status(201).json(blog);
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ message: 'Failed to create blog' });
    }
  });

  app.put('/api/blogs/:id', async (req, res) => {
    try {
      const blog = await storage.updateBlog(req.params.id, req.body);
      res.json(blog);
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({ message: 'Failed to update blog' });
    }
  });

  app.delete('/api/blogs/:id', async (req, res) => {
    try {
      await storage.deleteBlog(req.params.id);
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ message: 'Failed to delete blog' });
    }
  });

  // Pages API routes  
  app.get('/api/pages', async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ message: 'Failed to fetch pages' });
    }
  });

  app.get('/api/pages/:slug', async (req, res) => {
    try {
      const page = await storage.getPage(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ message: 'Failed to fetch page' });
    }
  });

  app.post('/api/pages', async (req, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ message: 'Failed to create page' });
    }
  });

  app.put('/api/pages/:slug', async (req, res) => {
    try {
      const page = await storage.updatePage(req.params.slug, req.body);
      res.json(page);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Failed to update page' });
    }
  });

  app.delete('/api/pages/:slug', async (req, res) => {
    try {
      await storage.deletePage(req.params.slug);
      res.json({ message: 'Page deleted successfully' });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ message: 'Failed to delete page' });
    }
  });

  // Handle auth page fallback
  app.get('/auth', (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/profile');
    }
    next();
  });

  // User management routes (for admin)
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // User cart routes
  app.get('/api/user/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cart = await storage.getUserCart(userId);
      res.json(cart ? JSON.parse(cart.items as string) : []);
    } catch (error) {
      console.error("Error fetching user cart:", error);
      res.status(500).json({ message: "Error fetching cart" });
    }
  });

  app.post('/api/user/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items } = req.body;
      const cart = await storage.updateUserCart(userId, items);
      res.json(cart);
    } catch (error) {
      console.error("Error updating user cart:", error);
      res.status(500).json({ message: "Error updating cart" });
    }
  });

  // User orders routes
  app.get('/api/user/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      // Set aggressive cache headers for instant loading
      res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      res.set('ETag', `"products-${Date.now()}"`);
      
      const { category } = req.query;
      const products = category && typeof category === "string" 
        ? await storage.getProductsByCategory(category)
        : await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Error creating product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:trackingId", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.trackingId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.post("/api/orders", optionalAuth, async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);

      // Link order to user if authenticated
      if (req.user?.claims?.sub) {
        await storage.linkOrderToUser(order.id, req.user.claims.sub);
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Error creating order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Error updating order status" });
    }
  });

  // Additional endpoint for order status updates (for compatibility)
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Error updating order status" });
    }
  });

  // Clear all orders endpoint (with backup)
  app.delete("/api/orders/clear-all", async (req, res) => {
    try {
      const result = await storage.clearAllOrders();
      res.json({ 
        message: "All orders cleared successfully",
        cleared_count: result.clearedCount,
        backup_created: true
      });
    } catch (error) {
      console.error("Error clearing all orders:", error);
      res.status(500).json({ message: "Error clearing orders" });
    }
  });

  // Offers
  app.get("/api/offers", async (req, res) => {
    try {
      const { active } = req.query;
      const offers = active === "true" 
        ? await storage.getActiveOffers()
        : await storage.getOffers();
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Error fetching offers" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(400).json({ message: "Error creating offer" });
    }
  });

  app.put("/api/offers/:id", async (req, res) => {
    try {
      const offerData = insertOfferSchema.partial().parse(req.body);
      const offer = await storage.updateOffer(req.params.id, offerData);
      res.json(offer);
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(400).json({ message: "Error updating offer" });
    }
  });

  app.delete("/api/offers/:id", async (req, res) => {
    try {
      await storage.deleteOffer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({ message: "Error deleting offer" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Error creating category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Error updating category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  // Promo Codes
  app.get("/api/promo-codes", async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      res.status(500).json({ message: "Error fetching promo codes" });
    }
  });

  app.post("/api/promo-codes", async (req, res) => {
    try {
      const promoData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(promoData);
      res.status(201).json(promoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(400).json({ message: "Error creating promo code" });
    }
  });

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      const validation = await storage.validatePromoCode(code, orderAmount);
      res.json(validation);
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(400).json({ message: "Error validating promo code" });
    }
  });

  app.put("/api/promo-codes/:id", async (req, res) => {
    try {
      const promoData = insertPromoCodeSchema.partial().parse(req.body);
      const promoCode = await storage.updatePromoCode(req.params.id, promoData);
      res.json(promoCode);
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(400).json({ message: "Error updating promo code" });
    }
  });

  app.delete("/api/promo-codes/:id", async (req, res) => {
    try {
      await storage.deletePromoCode(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting promo code:", error);
      res.status(500).json({ message: "Error deleting promo code" });
    }
  });

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const { event_type, start_date, end_date } = req.query;
      const analytics = await storage.getAnalytics(
        event_type as string,
        start_date as string,
        end_date as string
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.createAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(400).json({ message: "Error creating analytics" });
    }
  });

  // Site Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.createSetting(settingsData);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating setting:", error);
      res.status(400).json({ message: "Error creating setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(400).json({ message: "Error updating setting" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      // Default admin credentials for demo
      if (email === "admin@trynex.com" && password === "admin123") {
        console.log("✅ Admin login successful:", email);
        return res.json({ 
          success: true, 
          admin: { id: "admin-1", email: "admin@trynex.com" },
          message: "Login successful"
        });
      }

      // Try database lookup (if admin exists in DB)
      try {
        const admin = await storage.getAdminByEmail(email);
        if (admin && admin.password === password) {
          console.log("✅ Database admin login successful:", email);
          return res.json({ 
            success: true, 
            admin: { id: admin.id, email: admin.email },
            message: "Login successful"
          });
        }
      } catch (dbError) {
        console.warn("Database admin lookup failed:", dbError);
        // Continue to check default credentials
      }

      console.log("❌ Admin login failed for:", email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials. Use admin@trynex.com / admin123" 
      });

    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during login" 
      });
    }
  });

  // Custom Orders API Routes
  app.get("/api/custom-orders", async (req, res) => {
    try {
      const customOrders = await storage.getCustomOrders();
      res.json(customOrders);
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      res.status(500).json({ message: "Error fetching custom orders" });
    }
  });

  app.get('/api/custom-orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customOrder = await storage.getCustomOrder(id);

      if (!customOrder) {
        return res.status(404).json({ error: 'Custom order not found' });
      }

      res.json(customOrder);
    } catch (error) {
      console.error('Error fetching custom order:', error);
      res.status(500).json({ error: 'Failed to fetch custom order' });
    }
  });

  app.post("/api/custom-orders", async (req, res) => {
    try {
      const {
        name,
        whatsapp,
        address,
        productName,
        customization,
        quantity = 1,
        totalPrice,
        paymentMethod,
        trxId,
        paymentScreenshot
      } = req.body;

      if (!name || !whatsapp || !address || !productName || !customization || !paymentMethod) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const customOrder = await storage.createCustomOrder({
        name,
        whatsapp,
        address,
        productName,
        customization,
        quantity,
        totalPrice: totalPrice ? parseFloat(totalPrice).toString() : "100.00",
        paymentMethod,
        trxId: trxId || null,
        paymentScreenshot: paymentScreenshot || null,
        status: "pending"
      });

      res.status(201).json(customOrder);
    } catch (error) {
      console.error("Error creating custom order:", error);
      res.status(400).json({ message: "Error creating custom order" });
    }
  });

  app.patch("/api/custom-orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const customOrder = await storage.updateCustomOrderStatus(parseInt(req.params.id), status);
      res.json(customOrder);
    } catch (error) {
      console.error("Error updating custom order status:", error);
      res.status(400).json({ message: "Error updating custom order status" });
    }
  });

  // Blog Routes
  app.get('/api/blogs', async (req, res) => {
    try {
      const { published, featured } = req.query;

      let blogs;
      if (published === 'true') {
        blogs = await storage.getPublishedBlogs();
      } else if (featured === 'true') {
        blogs = await storage.getFeaturedBlogs();
      } else {
        blogs = await storage.getBlogs();
      }

      res.json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  });

  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.getBlogById(id);

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ error: 'Failed to fetch blog' });
    }
  });

  app.post('/api/blogs', async (req, res) => {
    try {
      const blog = await storage.createBlog(req.body);
      res.status(201).json(blog);
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ error: 'Failed to create blog' });
    }
  });

  app.put('/api/blogs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.updateBlog(id, req.body);

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json(blog);
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({ error: 'Failed to update blog' });
    }
  });

  app.delete('/api/blogs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlog(id);

      if (!success) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Failed to delete blog' });
    }
  });

  // Pages Routes
  app.get('/api/pages', async (req, res) => {
    try {
      const { active } = req.query;

      let pages;
      if (active === 'true') {
        pages = await storage.getActivePages();
      } else {
        pages = await storage.getPages();
      }

      res.json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Failed to fetch pages' });
    }
  });

  app.get('/api/pages/:identifier', async (req, res) => {
    try {
      const identifier = req.params.identifier;
      let page;

      // Check if identifier is numeric (ID) or string (slug)
      if (/^\d+$/.test(identifier)) {
        page = await storage.getPageById(parseInt(identifier));
      } else {
        page = await storage.getPageBySlug(identifier);
      }

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });

  app.post('/api/pages', async (req, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ error: 'Failed to create page' });
    }
  });

  app.put('/api/pages/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.updatePage(id, req.body);

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ error: 'Failed to update page' });
    }
  });

  app.delete('/api/pages/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePage(id);

      if (!success) {
        return res.status(404).json({ error: 'Page not found' });
      }      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  });

  // AI Chatbot API Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, chatHistory = [] } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get all products for search functionality
      const products = await storage.getProducts();
      
      // Generate AI response
      const response = await aiChatbot.generateResponse(message, products, chatHistory);
      
      res.json(response);
    } catch (error) {
      console.error("AI Chatbot Error:", error);
      res.status(500).json({ 
        message: "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।" 
      });
    }
  });

  // Enhanced AI Chat endpoint with OpenAI
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { handleAIChat } = await import('./ai-chat');
      await handleAIChat(req, res);
    } catch (error) {
      console.error('AI Chat route error:', error);
      res.status(500).json({ 
        error: 'AI service unavailable',
        reply: "দুঃখিত, AI সেবা এখন উপলব্ধ নেই। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
      });
    }
  });

  // Smart Search API Route
  app.get("/api/search", async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Get all products
      const allProducts = await storage.getProducts();
      
      // Smart search algorithm
      const searchTerms = query.toLowerCase().split(' ');
      const searchResults = allProducts.filter(product => {
        const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return searchTerms.some(term => searchableText.includes(term));
      });

      // Sort by relevance (name matches first, then description, then category)
      const sortedResults = searchResults.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        return bNameMatch - aNameMatch;
      });

      res.json({
        query,
        results: sortedResults.slice(0, 20), // Return top 20 results
        total: sortedResults.length
      });
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // AI Product Recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { interests = [], userId } = req.body;
      
      // Get all products
      const products = await storage.getProducts();
      
      // Generate AI-powered recommendations
      const recommendations = await aiChatbot.getSmartRecommendations(interests, products);
      
      res.json({
        recommendations,
        interests
      });
    } catch (error) {
      console.error("Recommendations Error:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
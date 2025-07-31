
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, optionalAuth } from "./replitAuth";
import { 
  insertOrderSchema, insertProductSchema, insertOfferSchema,
  insertCategorySchema, insertPromoCodeSchema, insertAnalyticsSchema,
  insertSiteSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Initialize default categories if none exist
  app.get('/api/init-categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "gifts", name_bengali: "গিফট", description: "Special gift items", is_active: true, sort_order: 1 },
          { name: "lifestyle", name_bengali: "লাইফস্টাইল", description: "Lifestyle products", is_active: true, sort_order: 2 },
          { name: "accessories", name_bengali: "অ্যাক্সেসরিজ", description: "Fashion accessories", is_active: true, sort_order: 3 },
          { name: "custom", name_bengali: "কাস্টম", description: "Custom products", is_active: true, sort_order: 4 },
          { name: "electronics", name_bengali: "ইলেক্ট্রনিক্স", description: "Electronic gadgets", is_active: true, sort_order: 5 },
          { name: "fashion", name_bengali: "ফ্যাশন", description: "Fashion items", is_active: true, sort_order: 6 },
          { name: "home-decor", name_bengali: "হোম ডেকোর", description: "Home decoration items", is_active: true, sort_order: 7 },
          { name: "books", name_bengali: "বই", description: "Books and stationery", is_active: true, sort_order: 8 },
          { name: "sports", name_bengali: "খেলাধুলা", description: "Sports and fitness", is_active: true, sort_order: 9 },
          { name: "health", name_bengali: "স্বাস্থ্য", description: "Health and wellness", is_active: true, sort_order: 10 }
        ];

        for (const category of defaultCategories) {
          await storage.createCategory(category);
        }
      }
      res.json({ message: "Categories initialized" });
    } catch (error) {
      console.error("Error initializing categories:", error);
      res.status(500).json({ message: "Error initializing categories" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    // Clear any session data if needed
    res.json({ message: "Logged out successfully" });
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

  app.patch("/api/offers/:id", async (req, res) => {
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
        return res.status(400).json({ message: "Email and password are required" });
      }

      const admin = await storage.getAdminByEmail(email);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ success: true, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

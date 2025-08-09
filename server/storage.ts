import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, lte, like, or, sql } from "drizzle-orm";
import NodeCache from "node-cache";
import {
  products, orders, offers, admins, categories, promoCodes, analytics, siteSettings,
  users, userCarts, userOrders, customOrders,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type Offer, type InsertOffer, type Admin, type InsertAdmin,
  type Category, type InsertCategory, type PromoCode, type InsertPromoCode,
  type Analytics, type InsertAnalytics, type SiteSettings, type InsertSiteSettings,
  type User, type UpsertUser, type UserCart, type InsertUserCart,
  type UserOrder, type InsertUserOrder, type CustomOrder, type InsertCustomOrder
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.lxhhgdqdictfhmkbyoev:Fz0R2tN542G09u6W@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

// Optimized connection with pooling
const client = postgres(connectionString, {
  max: 10,                    // Maximum connections in pool
  idle_timeout: 20,           // Close idle connections after 20s
  connect_timeout: 10,        // Connection timeout 10s
  transform: {
    undefined: null           // Transform undefined to null for PostgreSQL
  }
});
const db = drizzle(client);

// Cache layer for performance optimization
const cache = new NodeCache({
  stdTTL: 300,        // 5 minutes default TTL
  checkperiod: 60,    // Check for expired keys every 60 seconds
  useClones: false    // Return references instead of clones for better performance
});

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(trackingId: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  clearAllOrders(): Promise<{ clearedCount: number; backupKey: string }>;

  // Offers
  getActiveOffers(): Promise<Offer[]>;
  getOffers(): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: string, offer: Partial<InsertOffer>): Promise<Offer>;
  deleteOffer(id: string): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: string, promoCode: Partial<InsertPromoCode>): Promise<PromoCode>;
  deletePromoCode(id: string): Promise<void>;
  validatePromoCode(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message: string }>;

  // Analytics
  getAnalytics(eventType?: string, startDate?: string, endDate?: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;

  // Settings
  getSettings(): Promise<SiteSettings[]>;
  createSetting(setting: InsertSiteSettings): Promise<SiteSettings>;
  updateSetting(key: string, value: string): Promise<SiteSettings>;

  // Admins
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Users (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>; // For admin panel

  // Simple Authentication Methods
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: { phone: string; password: string; firstName: string; lastName: string; address: string; email: string | null; profileImageUrl: string | null }): Promise<User>;

  // User Carts
  getUserCart(userId: string): Promise<UserCart | undefined>;
  updateUserCart(userId: string, items: any[]): Promise<UserCart>;

  // User Orders
  getUserOrders(userId: string): Promise<Order[]>;
  linkOrderToUser(orderId: string, userId: string): Promise<void>;

  // Blog operations - removed due to missing imports
  // getBlogs(): Promise<Blog[]>;
  // getBlog(id: string): Promise<Blog | undefined>;
  // createBlog(blog: InsertBlog): Promise<Blog>;
  // updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog>;
  // deleteBlog(id: string): Promise<void>;
  // incrementBlogViews(id: string): Promise<void>;

  // Pages operations - removed due to missing imports  
  // getPages(): Promise<Page[]>;
  // getPage(slug: string): Promise<Page | undefined>;
  // createPage(page: InsertPage): Promise<Page>;
  // updatePage(slug: string, updates: Partial<InsertPage>): Promise<Page>;
  // deletePage(slug: string): Promise<void>;

  // Custom Orders operations
  getCustomOrders(): Promise<CustomOrder[]>;
  getCustomOrder(id: string): Promise<CustomOrder | null>;
  createCustomOrder(orderData: InsertCustomOrder): Promise<CustomOrder>;
  updateCustomOrderStatus(id: string, status: string): Promise<CustomOrder>;
}

export class DatabaseStorage implements IStorage {
  // Inject db instance into the class
  private db: any;

  constructor() {
    this.db = db;
  }

  async getProducts(): Promise<Product[]> {
    const cacheKey = 'products_all';
    const cached = cache.get<Product[]>(cacheKey);
    if (cached) {
      console.log(`⚡ Products served from cache in <1ms - ${cached.length} items`);
      return cached;
    }

    const startTime = Date.now();
    const result = await this.db.select().from(products).orderBy(desc(products.created_at));
    const endTime = Date.now();

    // Aggressive caching for 15 minutes
    cache.set(cacheKey, result, 900);
    console.log(`⚡ Products fetched in ${endTime - startTime}ms - ${result.length} items`);
    return result;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const cacheKey = `products_category_${category}`;
    const cached = cache.get<Product[]>(cacheKey);
    if (cached) {
      console.log(`✅ Products for category ${category} served from cache`);
      return cached;
    }

    const startTime = Date.now();
    const result = await this.db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.created_at));
    const endTime = Date.now();

    // Aggressive caching for 15 minutes
    cache.set(cacheKey, result, 900);
    console.log(`⚡ Category ${category} products fetched in ${endTime - startTime}ms - ${result.length} items`);
    return result;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(product).returning();
    // Clear cache when new product is added
    cache.del('products_all');
    if (product.category) {
      cache.del(`products_category_${product.category}`);
    }
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const result = await this.db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }

  async getOrders(): Promise<Order[]> {
    const result = await this.db.select().from(orders).orderBy(desc(orders.created_at));
    return result;
  }

  async getOrder(trackingId: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.tracking_id, trackingId)).limit(1);
    const order = result[0];
    if (order) {
      // Ensure items is properly parsed
      if (typeof order.items === 'string') {
        try {
          order.items = JSON.parse(order.items);
        } catch (e) {
          order.items = [];
        }
      }
      // Ensure payment_info is properly parsed
      if (typeof order.payment_info === 'string') {
        try {
          order.payment_info = JSON.parse(order.payment_info);
        } catch (e) {
          order.payment_info = null;
        }
      }
    }
    return order || null;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const trackingId = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const result = await this.db.insert(orders).values({
      ...order,
      tracking_id: trackingId,
    }).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const result = await this.db.update(orders).set({
      status
    }).where(eq(orders.id, id)).returning();

    if (result.length === 0) {
      throw new Error("Order not found");
    }

    return result[0];
  }

  async clearAllOrders(): Promise<{ clearedCount: number; backupKey: string }> {
    // First, get all orders for backup
    const allOrders = await this.db.select().from(orders);

    // Create backup table entry (you might want to implement a proper backup system)
    const backupData = {
      key: `orders_backup_${new Date().toISOString()}`,
      value: JSON.stringify(allOrders),
      description: `Backup of ${allOrders.length} orders before clearing`
    };

    // Store backup in site_settings table
    await this.db.insert(siteSettings).values(backupData).returning();

    // Clear all orders
    const deleteResult = await this.db.delete(orders).returning();

    // Also clear user_orders relationships
    await this.db.delete(userOrders).returning();

    return {
      clearedCount: allOrders.length,
      backupKey: backupData.key
    };
  }

  async getActiveOffers(): Promise<Offer[]> {
    const now = new Date();
    const result = await this.db.select().from(offers)
      .where(and(eq(offers.active, true), gte(offers.expiry, now)))
      .orderBy(desc(offers.created_at));
    return result;
  }

  async getOffers(): Promise<Offer[]> {
    const result = await this.db.select().from(offers).orderBy(desc(offers.created_at));
    return result;
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const result = await this.db.insert(offers).values(offer).returning();
    return result[0];
  }

  async updateOffer(id: string, offer: Partial<InsertOffer>): Promise<Offer> {
    const result = await this.db.update(offers).set(offer).where(eq(offers.id, id)).returning();
    return result[0];
  }

  async deleteOffer(id: string): Promise<void> {
    await this.db.delete(offers).where(eq(offers.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const result = await this.db.select().from(categories).orderBy(desc(categories.sort_order));
    return result;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const result = await this.db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    const result = await this.db.select().from(promoCodes).orderBy(desc(promoCodes.created_at));
    return result;
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await this.db.insert(promoCodes).values(promoCode).returning();
    return result[0];
  }

  async updatePromoCode(id: string, promoCode: Partial<InsertPromoCode>): Promise<PromoCode> {
    const result = await this.db.update(promoCodes).set(promoCode).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  async deletePromoCode(id: string): Promise<void> {
    await this.db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  async validatePromoCode(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message: string }> {
    const result = await this.db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase())).limit(1);
    const promoCode = result[0];

    if (!promoCode) {
      return { valid: false, discount: 0, message: "প্রমো কোড খুঁজে পাওয়া যায়নি" };
    }

    if (!promoCode.is_active) {
      return { valid: false, discount: 0, message: "প্রমো কোড নিষ্ক্রিয়" };
    }

    if (promoCode.expires_at && new Date() > new Date(promoCode.expires_at)) {
      return { valid: false, discount: 0, message: "প্রমো কোডের মেয়াদ শেষ" };
    }

    if (promoCode.usage_limit && (promoCode.used_count || 0) >= promoCode.usage_limit) {
      return { valid: false, discount: 0, message: "প্রমো কোডের ব্যবহারের সীমা শেষ" };
    }

    if (orderAmount < Number(promoCode.min_order_amount)) {
      return {
        valid: false,
        discount: 0,
        message: `সর্বনিম্ন অর্ডার পরিমাণ ৳${promoCode.min_order_amount} হতে হবে`
      };
    }

    let discount = 0;
    if (promoCode.discount_type === "percentage") {
      discount = (orderAmount * Number(promoCode.discount_value)) / 100;
      if (promoCode.max_discount && discount > Number(promoCode.max_discount)) {
        discount = Number(promoCode.max_discount);
      }
    } else {
      discount = Number(promoCode.discount_value);
    }

    return {
      valid: true,
      discount,
      message: `${promoCode.discount_type === "percentage" ? promoCode.discount_value + "%" : "৳" + promoCode.discount_value} ছাড় প্রয়োগ হয়েছে`
    };
  }

  // Analytics
  async getAnalytics(eventType?: string, startDate?: string, endDate?: string): Promise<Analytics[]> {
    let query = this.db.select().from(analytics);

    const conditions = [];
    if (eventType) {
      conditions.push(eq(analytics.event_type, eventType));
    }
    if (startDate) {
      conditions.push(gte(analytics.created_at, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(analytics.created_at, new Date(endDate)));
    }

    if (conditions.length > 0) {
      const result = await query.where(and(...conditions)).orderBy(desc(analytics.created_at));
      return result;
    }

    const result = await query.orderBy(desc(analytics.created_at));
    return result;
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const result = await this.db.insert(analytics).values(analyticsData).returning();
    return result[0];
  }

  // Settings
  async getSettings(): Promise<SiteSettings[]> {
    const result = await this.db.select().from(siteSettings).orderBy(desc(siteSettings.updated_at));
    return result;
  }

  async createSetting(setting: InsertSiteSettings): Promise<SiteSettings> {
    const result = await this.db.insert(siteSettings).values(setting).returning();
    return result[0];
  }

  async updateSetting(key: string, value: string): Promise<SiteSettings> {
    const result = await this.db.update(siteSettings)
      .set({ value, updated_at: new Date() })
      .where(eq(siteSettings.key, key))
      .returning();

    if (result.length === 0) {
      // Create if doesn't exist
      return this.createSetting({ key, value });
    }

    return result[0];
  }

  // User operations (Required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async createUser(userData: { phone: string; password: string; firstName: string; lastName: string; address: string; email: string | null; profileImageUrl: string | null }): Promise<User> {
    const result = await this.db.insert(users).values({
      phone: userData.phone,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName || '',
      address: userData.address,
      email: userData.email,
      profileImageUrl: userData.profileImageUrl,
    }).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    const result = await this.db.select().from(users).orderBy(desc(users.createdAt));
    return result;
  }

  // User Cart operations
  async getUserCart(userId: string): Promise<UserCart | undefined> {
    const result = await this.db.select().from(userCarts).where(eq(userCarts.user_id, userId)).limit(1);
    return result[0];
  }

  async updateUserCart(userId: string, items: any[]): Promise<UserCart> {
    const existing = await this.getUserCart(userId);

    if (existing) {
      const result = await this.db.update(userCarts)
        .set({ items: JSON.stringify(items), updated_at: new Date() })
        .where(eq(userCarts.user_id, userId))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(userCarts)
        .values({ user_id: userId, items: JSON.stringify(items) })
        .returning();
      return result[0];
    }
  }

  // User Order operations
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const result = await this.db
        .select()
        .from(orders)
        .where(eq(orders.user_id, userId))
        .orderBy(desc(orders.created_at));

      return result.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async linkOrderToUser(orderId: string, userId: string): Promise<void> {
    await this.db.update(orders)
      .set({ user_id: userId })
      .where(eq(orders.id, orderId));
  }

  // Custom Orders operations
  async getCustomOrders(): Promise<CustomOrder[]> {
    try {
      const result = await this.db.select().from(customOrders).orderBy(desc(customOrders.createdAt));
      return result;
    } catch (error) {
      console.error('❌ Error fetching custom orders:', error);
      throw error;
    }
  }

  async getCustomOrder(id: string): Promise<CustomOrder | null> {
    try {
      const result = await this.db.select().from(customOrders).where(eq(customOrders.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('❌ Error fetching custom order:', error);
      return null;
    }
  }

  async createCustomOrder(orderData: InsertCustomOrder): Promise<CustomOrder> {
    try {
      const result = await this.db.insert(customOrders).values(orderData).returning();
      return result[0];
    } catch (error) {
      console.error('❌ Error creating custom order:', error);
      throw error;
    }
  }

  async updateCustomOrderStatus(id: string, status: string): Promise<CustomOrder> {
    try {
      const result = await this.db.update(customOrders)
        .set({ status, updatedAt: new Date() })
        .where(eq(customOrders.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('❌ Error updating custom order status:', error);
      throw error;
    }
  }

  // Admin operations
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await this.db.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await this.db.insert(admins).values(admin).returning();
    return result[0];
  }


}

export const storage = new DatabaseStorage();
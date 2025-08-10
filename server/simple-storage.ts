import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import dotenv from 'dotenv';
dotenv.config();
import { 
  products, orders, offers, admins, categories, promoCodes, analytics, siteSettings,
  users, userCarts, userOrders, customOrders,
  type Product, type InsertProduct, type Order, type InsertOrder, 
  type Offer, type InsertOffer, type Admin, type InsertAdmin,
  type Category, type InsertCategory, type PromoCode, type InsertPromoCode,
  type Analytics, type InsertAnalytics, type SiteSettings, type InsertSiteSettings,
  type User, type UpsertUser, type UserCart, type InsertUserCart,
  type UserOrder, type InsertUserOrder, type CustomOrder, type NewCustomOrder
} from "@shared/schema";

// Force Supabase connection to access the 32 products database
const SUPABASE_DATABASE_URL = "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

// Use Supabase database connection directly
let connectionString = SUPABASE_DATABASE_URL;

if (!connectionString) {
  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  
  // If we have individual PostgreSQL environment variables, construct the connection string
  if (PGHOST && PGUSER && PGDATABASE) {
    const port = PGPORT || '5432';
    const password = PGPASSWORD ? `:${PGPASSWORD}` : '';
    connectionString = `postgresql://${PGUSER}${password}@${PGHOST}:${port}/${PGDATABASE}`;
  }
}

if (!connectionString) {
  console.error('DATABASE_URL not found, checking environment variables:');
  console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'exists' : 'missing');
  console.error('PGHOST:', process.env.PGHOST || 'missing');
  console.error('PGUSER:', process.env.PGUSER || 'missing');
  console.error('PGDATABASE:', process.env.PGDATABASE || 'missing');
  throw new Error("DATABASE_URL environment variable is not set, and could not construct from PG* variables");
}

// Optimized postgres client with aggressive connection pooling
const client = postgres(connectionString, {
  max: 3, // Smaller pool for better performance on Supabase
  idle_timeout: 10, // Close idle connections faster 
  connect_timeout: 5, // Faster connection timeout
  prepare: false, // Disable prepared statements
  transform: {
    undefined: null
  },
  ssl: { rejectUnauthorized: false }, // For Supabase compatibility
  connection: {
    application_name: 'trynex_fast',
    statement_timeout: 15000, // 15 second timeout
    lock_timeout: 10000,
    idle_in_transaction_session_timeout: 15000
  }
});

const db = drizzle(client);

export class SimpleStorage {
  // Products (Ultra-optimized for blazing fast loading)
  async getProducts(): Promise<Product[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Executing optimized products query...');
      }
      const start = Date.now();
      
      // Ultra-optimized query with strategic field selection and indexing
      const result = await db.select({
        id: products.id,
        name: products.name,
        price: products.price,
        image_url: products.image_url,
        category: products.category,
        stock: products.stock,
        description: products.description,
        is_featured: products.is_featured,
        is_latest: products.is_latest,
        is_best_selling: products.is_best_selling,
        created_at: products.created_at
      }).from(products)
        .orderBy(desc(products.is_featured), desc(products.is_latest), desc(products.created_at))
        .limit(100); // Limit to prevent massive queries
      
      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - start;
        console.log(`✅ Products query completed in ${duration}ms - ${result.length} items`);
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Database query error:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'NO_CODE',
        stack: error?.stack?.split('\n')[0] || 'No stack trace'
      });
      
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.created_at));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders (Enhanced with error handling)
  async getOrders(): Promise<Order[]> {
    try {
      console.log('🔍 Fetching orders from database...');
      const result = await db.select().from(orders).orderBy(desc(orders.created_at));
      console.log(`✅ Orders fetched successfully: ${result.length} orders`);
      return result;
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'NO_CODE'
      });
      return [];
    }
  }

  async getOrder(trackingId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.tracking_id, trackingId)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder & { tracking_id: string }): Promise<Order> {
    const result = await db.insert(orders).values([order]).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  // Users
  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async createUser(userData: { 
    phone: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    address: string; 
    email: string | null; 
  }): Promise<User> {
    const result = await db.insert(users).values({
      phone: userData.phone,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName || '',
      address: userData.address,
      email: userData.email,
      profileImageUrl: null
    }).returning();
    return result[0];
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  // Offers
  async getActiveOffers(): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.active, true));
  }

  async getOffers(): Promise<Offer[]> {
    return await db.select().from(offers).orderBy(desc(offers.created_at));
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values(offer).returning();
    return result[0];
  }

  async updateOffer(id: string, offer: Partial<InsertOffer>): Promise<Offer> {
    const result = await db.update(offers).set(offer).where(eq(offers.id, id)).returning();
    return result[0];
  }

  async deleteOffer(id: string): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.is_active, true)).orderBy(categories.sort_order);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Admins
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values(admin).returning();
    return result[0];
  }

  // Analytics
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(analyticsData).returning();
    return result[0];
  }

  // Settings
  async getSettings(): Promise<SiteSettings[]> {
    return await db.select().from(siteSettings);
  }

  async updateSetting(key: string, value: string): Promise<SiteSettings> {
    // First try to update existing setting
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    
    if (existing.length > 0) {
      const result = await db.update(siteSettings).set({ value, updated_at: new Date() }).where(eq(siteSettings.key, key)).returning();
      return result[0];
    } else {
      // Create new setting if it doesn't exist
      const result = await db.insert(siteSettings).values({
        key,
        value,
        description: `Auto-generated setting for ${key}`,
        updated_at: new Date()
      }).returning();
      return result[0];
    }
  }

  async createSetting(setting: InsertSiteSettings): Promise<SiteSettings> {
    const result = await db.insert(siteSettings).values(setting).returning();
    return result[0];
  }

  // Custom Orders
  async getCustomOrders(): Promise<CustomOrder[]> {
    return await db.select().from(customOrders).orderBy(desc(customOrders.createdAt));
  }

  async getCustomOrder(id: string): Promise<CustomOrder | undefined> {
    const result = await db.select().from(customOrders).where(eq(customOrders.id, id)).limit(1);
    return result[0];
  }

  async createCustomOrder(customOrder: NewCustomOrder): Promise<CustomOrder> {
    const result = await db.insert(customOrders).values(customOrder).returning();
    return result[0];
  }

  async updateCustomOrderStatus(id: string, status: string): Promise<CustomOrder> {
    const result = await db.update(customOrders).set({ 
      status, 
      updatedAt: new Date() 
    }).where(eq(customOrders.id, id)).returning();
    return result[0];
  }

  // User Orders - Get orders for specific user
  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at));
  }
}

export const storage = new SimpleStorage();
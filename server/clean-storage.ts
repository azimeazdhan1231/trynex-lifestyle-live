import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc } from "drizzle-orm";
import dotenv from "dotenv";
import { 
  products, orders, offers, admins, categories, promoCodes, analytics, siteSettings,
  users, userCarts, userOrders, customOrders,
  type Product, type InsertProduct, type Order, type InsertOrder, 
  type Offer, type InsertOffer, type Admin, type InsertAdmin,
  type Category, type InsertCategory, type PromoCode, type InsertPromoCode,
  type Analytics, type InsertAnalytics, type SiteSettings, type InsertSiteSettings,
  type User, type UpsertUser, type UserCart, type InsertUserCart,
  type UserOrder, type InsertUserOrder
} from "@shared/schema";

// Load environment variables first
dotenv.config();

// Use the Supabase connection string
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

if (!connectionString.includes('supabase')) {
  console.error("❌ DATABASE_URL must be a valid Supabase connection string");
}

// Optimized postgres client for Supabase
const client = postgres(connectionString, {
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
  ssl: { rejectUnauthorized: false },
  transform: {
    undefined: null
  }
});

const db = drizzle(client);

export class CleanStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      console.log('🔍 Fetching products from database...');
      const result = await db.select().from(products).orderBy(desc(products.created_at));
      console.log(`✅ Products fetched successfully: ${result.length} products`);
      return result;
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const result = await db.select().from(products)
        .where(eq(products.category, category))
        .orderBy(desc(products.created_at));
      return result;
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values([product]).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      console.log('🔍 Fetching orders from database...');
      const result = await db.select().from(orders).orderBy(desc(orders.created_at));
      console.log(`✅ Orders fetched successfully: ${result.length} orders`);
      return result;
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
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

  // Offers
  async getOffers(): Promise<Offer[]> {
    try {
      const result = await db.select().from(offers).orderBy(desc(offers.created_at));
      return result;
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
      return [];
    }
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const result = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
    return result[0];
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values([offer]).returning();
    return result[0];
  }

  async updateOffer(id: string, updates: Partial<InsertOffer>): Promise<Offer> {
    const result = await db.update(offers).set(updates).where(eq(offers.id, id)).returning();
    return result[0];
  }

  async deleteOffer(id: string): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const result = await db.select().from(categories)
        .where(eq(categories.is_active, true))
        .orderBy(categories.sort_order);
      return result;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values([category]).returning();
    return result[0];
  }

  // Site Settings
  async getSiteSettings(): Promise<Record<string, string>> {
    try {
      const settings = await db.select().from(siteSettings);
      const settingsMap: Record<string, string> = {};
      settings.forEach(setting => {
        if (setting.key && setting.value) {
          settingsMap[setting.key] = setting.value;
        }
      });
      
      // Provide defaults if no settings exist
      if (Object.keys(settingsMap).length === 0) {
        return {
          site_title: "TryneX Lifestyle",
          site_description: "আপনার পছন্দের গিফট শপ",
          facebook_page: "https://facebook.com",
          whatsapp_number: "+8801747292277"
        };
      }
      
      return settingsMap;
    } catch (error) {
      console.error('❌ Error fetching site settings:', error);
      return {
        site_title: "TryneX Lifestyle", 
        site_description: "আপনার পছন্দের গিফট শপ",
        facebook_page: "https://facebook.com",
        whatsapp_number: "+8801747292277"
      };
    }
  }

  async updateSiteSettings(key: string, value: string): Promise<SiteSettings> {
    const result = await db.insert(siteSettings)
      .values([{ key, value }])
      .onConflictDoUpdate({ 
        target: siteSettings.key, 
        set: { value, updated_at: new Date() } 
      })
      .returning();
    return result[0];
  }

  // Analytics
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values([analyticsData]).returning();
    return result[0];
  }

  // Users
  async createUser(userData: UpsertUser): Promise<User> {
    const result = await db.insert(users).values([userData]).returning();
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // User Carts
  async getUserCart(userId: string): Promise<UserCart | undefined> {
    const result = await db.select().from(userCarts).where(eq(userCarts.user_id, userId)).limit(1);
    return result[0];
  }

  async updateUserCart(userId: string, items: any[]): Promise<UserCart> {
    const result = await db.insert(userCarts)
      .values([{ user_id: userId, items: JSON.stringify(items) }])
      .onConflictDoUpdate({
        target: userCarts.user_id,
        set: { items: JSON.stringify(items), updated_at: new Date() }
      })
      .returning();
    return result[0];
  }

  // User Orders
  async getUserOrders(userId: string): Promise<Order[]> {
    const userOrdersResult = await db.select().from(userOrders).where(eq(userOrders.user_id, userId));
    const orderIds = userOrdersResult.map(uo => uo.order_id).filter(id => id !== null);
    
    if (orderIds.length === 0) return [];
    
    const ordersResult = await db.select().from(orders)
      .orderBy(desc(orders.created_at));
    
    return ordersResult;
  }

  async createUserOrder(userId: string, orderId: string): Promise<UserOrder> {
    const result = await db.insert(userOrders).values([{ user_id: userId, order_id: orderId }]).returning();
    return result[0];
  }

  // Settings alias
  async getSettings(): Promise<Record<string, string>> {
    return this.getSiteSettings();
  }
}

export const storage = new CleanStorage();
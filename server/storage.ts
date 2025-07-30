import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { 
  products, orders, offers, admins, categories, promoCodes, analytics, 
  siteSettings, popupOffers, type Product, type InsertProduct, type Order, type InsertOrder, 
  type Offer, type InsertOffer, type Admin, type InsertAdmin,
  type Category, type InsertCategory, type PromoCode, type InsertPromoCode,
  type Analytics, type InsertAnalytics, type SiteSettings, type InsertSiteSettings, type InsertPopupOffer
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const client = postgres(connectionString);
const db = drizzle(client);

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

    // Popup Offers
  getPopupOffers(): Promise<any>; // Replace any with correct type
  getActivePopupOffer(): Promise<any>; // Replace any with correct type
  createPopupOffer(data: InsertPopupOffer): Promise<any>; // Replace any with correct type
  updatePopupOffer(id: string, data: Partial<InsertPopupOffer>): Promise<any>; // Replace any with correct type
  deletePopupOffer(id: string): Promise<any>; // Replace any with correct type

  // Admins
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    const result = await db.select().from(products).orderBy(desc(products.created_at));
    return result;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const result = await db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.created_at));
    return result;
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

  async getOrders(): Promise<Order[]> {
    const result = await db.select().from(orders).orderBy(desc(orders.created_at));
    return result;
  }

  async getOrder(trackingId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.tracking_id, trackingId)).limit(1);
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
    const result = await db.insert(orders).values({
      ...order,
      tracking_id: trackingId,
    }).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const result = await db.update(orders).set({ 
      status,
      updated_at: new Date() 
    }).where(eq(orders.id, id)).returning();

    if (result.length === 0) {
      throw new Error("Order not found");
    }

    return result[0];
  }

  async getActiveOffers(): Promise<Offer[]> {
    const now = new Date();
    const result = await db.select().from(offers)
      .where(and(eq(offers.active, true), gte(offers.expiry, now)))
      .orderBy(desc(offers.created_at));
    return result;
  }

  async getOffers(): Promise<Offer[]> {
    const result = await db.select().from(offers).orderBy(desc(offers.created_at));
    return result;
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

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values(admin).returning();
    return result[0];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(desc(categories.sort_order));
    return result;
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

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    const result = await db.select().from(promoCodes).orderBy(desc(promoCodes.created_at));
    return result;
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await db.insert(promoCodes).values(promoCode).returning();
    return result[0];
  }

  async updatePromoCode(id: string, promoCode: Partial<InsertPromoCode>): Promise<PromoCode> {
    const result = await db.update(promoCodes).set(promoCode).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  async deletePromoCode(id: string): Promise<void> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  async validatePromoCode(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message: string }> {
    const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase())).limit(1);
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

    if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
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
    let query = db.select().from(analytics);

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
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(analytics.created_at));
    return result;
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(analyticsData).returning();
    return result[0];
  }

  // Settings
  async getSettings(): Promise<SiteSettings[]> {
    const result = await db.select().from(siteSettings).orderBy(desc(siteSettings.updated_at));
    return result;
  }

  async createSetting(setting: InsertSiteSettings): Promise<SiteSettings> {
    const result = await db.insert(siteSettings).values(setting).returning();
    return result[0];
  }

  async updateSetting(key: string, value: string): Promise<SiteSettings> {
    const result = await db.update(siteSettings)
      .set({ value, updated_at: new Date() })
      .where(eq(siteSettings.key, key))
      .returning();

    if (result.length === 0) {
      // Create if doesn't exist
      return this.createSetting({ key, value });
    }

    return result[0];
  }

  // Popup Offers
  async getPopupOffers(): Promise<any> { // Replace any with correct type
    const result = await db.select().from(popupOffers).orderBy(desc(popupOffers.created_at));
    return result;
  }

  async getActivePopupOffer(): Promise<any> { // Replace any with correct type
    const now = new Date();
    const result = await db.select().from(popupOffers).where(and(eq(popupOffers.is_active, true), gte(popupOffers.expiry, now))).orderBy(desc(popupOffers.created_at));
    return result[0];
  }

  async createPopupOffer(data: InsertPopupOffer): Promise<any> {
    const result = await db.insert(popupOffers).values(data).returning();
    return result[0];
  }

  async updatePopupOffer(id: string, data: Partial<InsertPopupOffer>): Promise<any> {
    const result = await db.update(popupOffers).set(data).where(eq(popupOffers.id, id)).returning();
    return result[0];
  }

  async deletePopupOffer(id: string): Promise<any> {
    await db.delete(popupOffers).where(eq(popupOffers.id, id));
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values(admin).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
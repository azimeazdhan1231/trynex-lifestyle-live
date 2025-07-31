import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { 
  products, orders, offers, admins, categories, promoCodes, analytics, siteSettings,
  users, userCarts, userOrders,
  type Product, type InsertProduct, type Order, type InsertOrder, 
  type Offer, type InsertOffer, type Admin, type InsertAdmin,
  type Category, type InsertCategory, type PromoCode, type InsertPromoCode,
  type Analytics, type InsertAnalytics, type SiteSettings, type InsertSiteSettings,
  type User, type UpsertUser, type UserCart, type InsertUserCart,
  type UserOrder, type InsertUserOrder
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const client = postgres(connectionString);
const db = drizzle(client);

export class SimpleStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.created_at));
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

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.created_at));
  }

  async getOrder(trackingId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.tracking_id, trackingId)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
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
  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(analytics).returning();
    return result[0];
  }

  // Settings
  async getSettings(): Promise<SiteSettings[]> {
    return await db.select().from(siteSettings);
  }

  async updateSetting(key: string, value: string): Promise<SiteSettings> {
    const result = await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key)).returning();
    return result[0];
  }
}

export const storage = new SimpleStorage();
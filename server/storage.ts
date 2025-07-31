import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { 
  products, orders, offers, admins, categories, promoCodes, analytics, siteSettings,
  users, userCarts, userOrders, blogs, pages, customOrders,
  type Product, type InsertProduct, type Order, type InsertOrder, 
  type Offer, type InsertOffer, type Admin, type InsertAdmin,
  type Category, type InsertCategory, type PromoCode, type InsertPromoCode,
  type Analytics, type InsertAnalytics, type SiteSettings, type InsertSiteSettings,
  type User, type UpsertUser, type UserCart, type InsertUserCart,
  type UserOrder, type InsertUserOrder, type Blog, type NewBlog,
  type Page, type NewPage, type CustomOrder, type NewCustomOrder
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const client = postgres(connectionString);
const db = drizzle(client);

// Products
export async function getProducts(): Promise<Product[]> {
  return await db.select().from(products).orderBy(desc(products.created_at));
}

export async function getProduct(id: string): Promise<Product | null> {
  const result = await db.select().from(products).where(eq(products.id, id));
  return result[0] || null;
}

export async function createProduct(product: InsertProduct): Promise<Product> {
  const result = await db.insert(products).values(product).returning();
  return result[0];
}

export async function updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | null> {
  const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
  return result[0] || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.delete(products).where(eq(products.id, id));
  return result.rowCount > 0;
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return await db.select().from(orders).orderBy(desc(orders.created_at));
}

export async function getOrder(id: string): Promise<Order | null> {
  const result = await db.select().from(orders).where(eq(orders.id, id));
  return result[0] || null;
}

export async function getOrderByTrackingId(trackingId: string): Promise<Order | null> {
  const result = await db.select().from(orders).where(eq(orders.tracking_id, trackingId));
  return result[0] || null;
}

export async function createOrder(order: InsertOrder): Promise<Order> {
  const trackingId = `TN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const result = await db.insert(orders).values({ ...order, tracking_id: trackingId }).returning();
  return result[0];
}

export async function updateOrder(id: string, updates: Partial<Omit<InsertOrder, 'tracking_id'>>): Promise<Order | null> {
  const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
  return result[0] || null;
}

// Offers
export async function getOffers(): Promise<Offer[]> {
  return await db.select().from(offers).orderBy(desc(offers.created_at));
}

export async function getActiveOffers(): Promise<Offer[]> {
  return await db.select().from(offers).where(eq(offers.active, true)).orderBy(desc(offers.created_at));
}

export async function createOffer(offer: InsertOffer): Promise<Offer> {
  const result = await db.insert(offers).values(offer).returning();
  return result[0];
}

export async function updateOffer(id: string, updates: Partial<InsertOffer>): Promise<Offer | null> {
  const result = await db.update(offers).set(updates).where(eq(offers.id, id)).returning();
  return result[0] || null;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const result = await db.delete(offers).where(eq(offers.id, id));
  return result.rowCount > 0;
}

// Admins
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const result = await db.select().from(admins).where(eq(admins.email, email));
  return result[0] || null;
}

export async function createAdmin(admin: InsertAdmin): Promise<Admin> {
  const result = await db.insert(admins).values(admin).returning();
  return result[0];
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return await db.select().from(categories).orderBy(desc(categories.sort_order));
}

export async function createCategory(category: InsertCategory): Promise<Category> {
  const result = await db.insert(categories).values(category).returning();
  return result[0];
}

export async function updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | null> {
  const result = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
  return result[0] || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await db.delete(categories).where(eq(categories.id, id));
  return result.rowCount > 0;
}

// Promo Codes
export async function getPromoCodes(): Promise<PromoCode[]> {
  return await db.select().from(promoCodes).orderBy(desc(promoCodes.created_at));
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
  return result[0] || null;
}

export async function createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
  const result = await db.insert(promoCodes).values(promoCode).returning();
  return result[0];
}

export async function updatePromoCode(id: string, updates: Partial<InsertPromoCode>): Promise<PromoCode | null> {
  const result = await db.update(promoCodes).set(updates).where(eq(promoCodes.id, id)).returning();
  return result[0] || null;
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const result = await db.delete(promoCodes).where(eq(promoCodes.id, id));
  return result.rowCount > 0;
}

// Analytics
export async function createAnalyticsEvent(event: InsertAnalytics): Promise<Analytics> {
  const result = await db.insert(analytics).values(event).returning();
  return result[0];
}

export async function getAnalytics(startDate?: Date, endDate?: Date): Promise<Analytics[]> {
  let query = db.select().from(analytics);

  if (startDate && endDate) {
    query = query.where(and(
      gte(analytics.created_at, startDate),
      lte(analytics.created_at, endDate)
    ));
  }

  return await query.orderBy(desc(analytics.created_at));
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings[]> {
  return await db.select().from(siteSettings);
}

export async function getSiteSetting(key: string): Promise<SiteSettings | null> {
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return result[0] || null;
}

export async function upsertSiteSetting(setting: InsertSiteSettings): Promise<SiteSettings> {
  const existing = await getSiteSetting(setting.key);

  if (existing) {
    const result = await db.update(siteSettings)
      .set({ value: setting.value, description: setting.description, updated_at: new Date() })
      .where(eq(siteSettings.key, setting.key))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(siteSettings).values(setting).returning();
    return result[0];
  }
}

// Users
export async function getUserByPhone(phone: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.phone, phone));
  return result[0] || null;
}

export async function createUser(user: UpsertUser): Promise<User> {
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

export async function updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | null> {
  const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  return result[0] || null;
}

// User Carts
export async function getUserCart(userId: string): Promise<UserCart | null> {
  const result = await db.select().from(userCarts).where(eq(userCarts.user_id, userId));
  return result[0] || null;
}

export async function upsertUserCart(cart: InsertUserCart): Promise<UserCart> {
  const existing = await getUserCart(cart.user_id);

  if (existing) {
    const result = await db.update(userCarts)
      .set({ items: cart.items, updated_at: new Date() })
      .where(eq(userCarts.user_id, cart.user_id))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(userCarts).values(cart).returning();
    return result[0];
  }
}

// User Orders
export async function getUserOrders(userId: string): Promise<Order[]> {
  const result = await db.select({ 
    id: orders.id,
    tracking_id: orders.tracking_id,
    user_id: orders.user_id,
    customer_name: orders.customer_name,
    district: orders.district,
    thana: orders.thana,
    address: orders.address,
    phone: orders.phone,
    payment_info: orders.payment_info,
    status: orders.status,
    items: orders.items,
    total: orders.total,
    created_at: orders.created_at
  })
  .from(userOrders)
  .innerJoin(orders, eq(userOrders.order_id, orders.id))
  .where(eq(userOrders.user_id, userId))
  .orderBy(desc(orders.created_at));

  return result;
}

export async function createUserOrder(userOrder: InsertUserOrder): Promise<UserOrder> {
  const result = await db.insert(userOrders).values(userOrder).returning();
  return result[0];
}

// Blogs
export async function getBlogs(): Promise<Blog[]> {
  return await db.select().from(blogs).orderBy(desc(blogs.createdAt));
}

export async function getBlog(id: number): Promise<Blog | null> {
  const result = await db.select().from(blogs).where(eq(blogs.id, id));
  return result[0] || null;
}

export async function createBlog(blog: NewBlog): Promise<Blog> {
  const result = await db.insert(blogs).values(blog).returning();
  return result[0];
}

export async function updateBlog(id: number, updates: Partial<NewBlog>): Promise<Blog | null> {
  const result = await db.update(blogs).set(updates).where(eq(blogs.id, id)).returning();
  return result[0] || null;
}

export async function deleteBlog(id: number): Promise<boolean> {
  const result = await db.delete(blogs).where(eq(blogs.id, id));
  return result.rowCount > 0;
}

// Pages
export async function getPages(): Promise<Page[]> {
  return await db.select().from(pages).orderBy(desc(pages.createdAt));
}

export async function getPage(id: number): Promise<Page | null> {
  const result = await db.select().from(pages).where(eq(pages.id, id));
  return result[0] || null;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const result = await db.select().from(pages).where(eq(pages.slug, slug));
  return result[0] || null;
}

export async function createPage(page: NewPage): Promise<Page> {
  const result = await db.insert(pages).values(page).returning();
  return result[0];
}

export async function updatePage(id: number, updates: Partial<NewPage>): Promise<Page | null> {
  const result = await db.update(pages).set(updates).where(eq(pages.id, id)).returning();
  return result[0] || null;
}

export async function deletePage(id: number): Promise<boolean> {
  const result = await db.delete(pages).where(eq(pages.id, id));
  return result.rowCount > 0;
}

// Custom Orders
export async function getCustomOrders(): Promise<CustomOrder[]> {
  return await db.select().from(customOrders).orderBy(desc(customOrders.createdAt));
}

export async function getCustomOrder(id: number): Promise<CustomOrder | null> {
  const result = await db.select().from(customOrders).where(eq(customOrders.id, id));
  return result[0] || null;
}

export async function createCustomOrder(order: NewCustomOrder): Promise<CustomOrder> {
  const result = await db.insert(customOrders).values(order).returning();
  return result[0];
}

export async function updateCustomOrder(id: number, updates: Partial<NewCustomOrder>): Promise<CustomOrder | null> {
  const result = await db.update(customOrders).set(updates).where(eq(customOrders.id, id)).returning();
  return result[0] || null;
}

export async function deleteCustomOrder(id: number): Promise<boolean> {
  const result = await db.delete(customOrders).where(eq(customOrders.id, id));
  return result.rowCount > 0;
}
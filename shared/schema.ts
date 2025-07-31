import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, timestamp, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  image_url: text("image_url"),
  category: text("category"),
  stock: integer("stock").notNull().default(0),
  description: text("description"),
  is_featured: boolean("is_featured").default(false),
  is_latest: boolean("is_latest").default(false),
  is_best_selling: boolean("is_best_selling").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tracking_id: text("tracking_id").unique().notNull(),
  user_id: varchar("user_id"), // Optional - for registered users
  customer_name: text("customer_name").notNull(),
  district: text("district").notNull(),
  thana: text("thana").notNull(),
  address: text("address"),
  phone: text("phone").notNull(),
  payment_info: jsonb("payment_info"),
  status: text("status").default("pending"),
  items: jsonb("items").notNull(),
  total: numeric("total").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  image_url: text("image_url"),
  discount_percentage: integer("discount_percentage").default(0),
  min_order_amount: numeric("min_order_amount").default("0"),
  button_text: text("button_text").default("অর্ডার করুন"),
  button_link: text("button_link").default("/products"),
  is_popup: boolean("is_popup").default(false),
  popup_delay: integer("popup_delay").default(3000), // milliseconds
  expiry: timestamp("expiry"),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").unique().notNull(),
  name_bengali: text("name_bengali").notNull(),
  description: text("description"),
  image_url: text("image_url"),
  is_active: boolean("is_active").default(true),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").unique().notNull(),
  discount_type: text("discount_type").notNull(), // 'percentage' or 'fixed'
  discount_value: numeric("discount_value").notNull(),
  min_order_amount: numeric("min_order_amount").default("0"),
  max_discount: numeric("max_discount"),
  usage_limit: integer("usage_limit"),
  used_count: integer("used_count").default(0),
  expires_at: timestamp("expires_at"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  event_type: text("event_type").notNull(), // 'page_view', 'product_view', 'add_to_cart', 'purchase'
  page_url: text("page_url"),
  product_id: uuid("product_id"),
  user_agent: text("user_agent"),
  ip_address: text("ip_address"),
  session_id: text("session_id"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").unique().notNull(),
  value: text("value"),
  description: text("description"),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Session storage table for Replit Auth
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// User storage table  
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").unique().notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  address: text("address").notNull(),
  email: text("email"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User carts for persistent storage
export const userCarts = pgTable("user_carts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  items: jsonb("items").notNull().default('[]'),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Update orders table to include user_id for logged in users
export const userOrders = pgTable("user_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id"),
  order_id: uuid("order_id").references(() => orders.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
  tracking_id: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  created_at: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  created_at: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  created_at: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  created_at: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  created_at: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
});

export const insertUserCartSchema = createInsertSchema(userCarts).omit({
  id: true,
  updated_at: true,
});

export const insertUserOrderSchema = createInsertSchema(userOrders).omit({
  id: true,
  created_at: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type UserCart = typeof userCarts.$inferSelect;
export type InsertUserCart = z.infer<typeof insertUserCartSchema>;
export type UserOrder = typeof userOrders.$inferSelect;
export type InsertUserOrder = z.infer<typeof insertUserOrderSchema>;

// Blog table
export const customOrders = pgTable('custom_orders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 20 }).notNull(),
  address: text('address').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  customization: text('customization').notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  trxId: varchar('trx_id', { length: 100 }),
  paymentScreenshot: text('payment_screenshot'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt').notNull(),
  author: varchar('author', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  isFeatured: boolean('is_featured').notNull().default(false),
  tags: varchar('tags', { length: 255 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CustomOrder = typeof customOrders.$inferSelect;
export type NewCustomOrder = typeof customOrders.$inferInsert;
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
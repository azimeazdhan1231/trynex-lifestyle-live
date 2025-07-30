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
  created_at: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tracking_id: text("tracking_id").unique().notNull(),
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

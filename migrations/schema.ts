import { pgTable, unique, uuid, text, timestamp, jsonb, boolean, integer, numeric, varchar, foreignKey, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const admins = pgTable("admins", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("admins_email_unique").on(table.email),
]);

export const analytics = pgTable("analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventType: text("event_type").notNull(),
	pageUrl: text("page_url"),
	productId: uuid("product_id"),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	sessionId: text("session_id"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const blogs = pgTable("blogs", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	excerpt: text(),
	tags: text(),
	category: text().default('general').notNull(),
	author: text().default('Admin').notNull(),
	status: text().default('published').notNull(),
	isFeatured: boolean("is_featured").default(false),
	views: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	nameBengali: text("name_bengali").notNull(),
	description: text(),
	imageUrl: text("image_url"),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("categories_name_unique").on(table.name),
]);

export const offers = pgTable("offers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	discountPercentage: integer("discount_percentage").default(0),
	minOrderAmount: numeric("min_order_amount").default('0'),
	buttonText: text("button_text").default('অর্ডার করুন'),
	buttonLink: text("button_link").default('/products'),
	isPopup: boolean("is_popup").default(false),
	popupDelay: integer("popup_delay").default(3000),
	expiry: timestamp({ mode: 'string' }),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const pages = pgTable("pages", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("pages_slug_unique").on(table.slug),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	price: numeric().notNull(),
	imageUrl: text("image_url"),
	category: text(),
	stock: integer().default(0).notNull(),
	description: text(),
	isFeatured: boolean("is_featured").default(false),
	isLatest: boolean("is_latest").default(false),
	isBestSelling: boolean("is_best_selling").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const promoCodes = pgTable("promo_codes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	discountType: text("discount_type").notNull(),
	discountValue: numeric("discount_value").notNull(),
	minOrderAmount: numeric("min_order_amount").default('0'),
	maxDiscount: numeric("max_discount"),
	usageLimit: integer("usage_limit"),
	usedCount: integer("used_count").default(0),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("promo_codes_code_unique").on(table.code),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	trackingId: text("tracking_id").notNull(),
	userId: varchar("user_id"),
	customerName: text("customer_name").notNull(),
	district: text().notNull(),
	thana: text().notNull(),
	address: text(),
	phone: text().notNull(),
	paymentInfo: jsonb("payment_info"),
	status: text().default('pending'),
	items: jsonb().notNull(),
	total: numeric().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("orders_tracking_id_unique").on(table.trackingId),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
});

export const siteSettings = pgTable("site_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	value: text(),
	description: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("site_settings_key_unique").on(table.key),
]);

export const userCarts = pgTable("user_carts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	items: jsonb().default([]).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userOrders = pgTable("user_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id"),
	orderId: uuid("order_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "user_orders_order_id_orders_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	phone: text().notNull(),
	password: text().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name"),
	address: text().notNull(),
	email: text(),
	profileImageUrl: text("profile_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_phone_unique").on(table.phone),
]);

export const customOrders = pgTable("custom_orders", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	whatsapp: varchar({ length: 20 }).notNull(),
	address: text().notNull(),
	productName: varchar("product_name", { length: 255 }).notNull(),
	customization: text().notNull(),
	quantity: integer().default(1).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
	trxId: varchar("trx_id", { length: 100 }),
	paymentScreenshot: text("payment_screenshot"),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

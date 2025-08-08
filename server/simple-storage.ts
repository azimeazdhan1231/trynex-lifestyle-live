
import Database from "better-sqlite3";
import type { 
  InsertProduct, Product, InsertOrder, Order, InsertOffer, Offer,
  InsertCategory, Category, InsertAnalytics, Analytics, InsertSetting, Setting,
  InsertUser, User, InsertBlog, Blog
} from "@shared/schema";

const db = new Database("simple.db");

// Enable performance optimizations
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 268435456'); // 256MB

// Performance monitoring
const logQuery = (operation: string, startTime: number) => {
  const duration = Date.now() - startTime;
  if (duration > 100) {
    console.warn(`⚠️ Slow query: ${operation} took ${duration}ms`);
  } else {
    console.log(`✅ Fast query: ${operation} took ${duration}ms`);
  }
};

// Create tables with optimized indexes
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    description TEXT,
    is_featured INTEGER DEFAULT 0,
    is_latest INTEGER DEFAULT 0,
    is_best_selling INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Optimized indexes for fast queries
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
  CREATE INDEX IF NOT EXISTS idx_products_latest ON products(is_latest);
  CREATE INDEX IF NOT EXISTS idx_products_best_selling ON products(is_best_selling);
  CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    tracking_id TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash_on_delivery',
    payment_info TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
  CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    discount_percentage INTEGER,
    start_date TEXT,
    end_date TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
  CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
  CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data TEXT,
    user_session TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
  CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics(user_session);
  CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

  CREATE TABLE IF NOT EXISTS blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    slug TEXT UNIQUE,
    status TEXT DEFAULT 'draft',
    author_id TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
  CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
  CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
`);

// Prepared statements for better performance
const getProductsStmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
const getProductsByCategoryStmt = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC');
const getProductByIdStmt = db.prepare('SELECT * FROM products WHERE id = ?');
const insertProductStmt = db.prepare(`
  INSERT INTO products (id, name, price, image_url, category, stock, description, is_featured, is_latest, is_best_selling)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getOrdersStmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
const getOrderByIdStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
const getOrderByTrackingStmt = db.prepare('SELECT * FROM orders WHERE tracking_id = ?');
const insertOrderStmt = db.prepare(`
  INSERT INTO orders (id, tracking_id, customer_name, phone, address, items, total_amount, payment_method, payment_info, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getCategoriesStmt = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name');
const getOffersStmt = db.prepare('SELECT * FROM offers WHERE is_active = 1 ORDER BY created_at DESC');
const getSettingsStmt = db.prepare('SELECT * FROM settings');

export const storage = {
  // Products
  async getProducts(): Promise<Product[]> {
    const startTime = Date.now();
    try {
      const products = getProductsStmt.all() as Product[];
      logQuery('getProducts', startTime);
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const startTime = Date.now();
    try {
      const products = getProductsByCategoryStmt.all(category) as Product[];
      logQuery(`getProductsByCategory(${category})`, startTime);
      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  },

  async getProduct(id: string): Promise<Product | null> {
    const startTime = Date.now();
    try {
      const product = getProductByIdStmt.get(id) as Product | undefined;
      logQuery(`getProduct(${id})`, startTime);
      return product || null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  async createProduct(data: InsertProduct): Promise<Product> {
    const startTime = Date.now();
    try {
      const id = crypto.randomUUID();
      insertProductStmt.run(
        id, data.name, data.price, data.image_url, data.category,
        data.stock, data.description, data.is_featured ? 1 : 0,
        data.is_latest ? 1 : 0, data.is_best_selling ? 1 : 0
      );
      const product = this.getProduct(id);
      logQuery('createProduct', startTime);
      return product!;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const startTime = Date.now();
    try {
      const orders = getOrdersStmt.all() as Order[];
      logQuery('getOrders', startTime);
      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async getOrder(id: string): Promise<Order | null> {
    const startTime = Date.now();
    try {
      const order = getOrderByIdStmt.get(id) as Order | undefined;
      logQuery(`getOrder(${id})`, startTime);
      return order || null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  async getOrderByTracking(trackingId: string): Promise<Order | null> {
    const startTime = Date.now();
    try {
      const order = getOrderByTrackingStmt.get(trackingId) as Order | undefined;
      logQuery(`getOrderByTracking(${trackingId})`, startTime);
      return order || null;
    } catch (error) {
      console.error('Error getting order by tracking:', error);
      throw error;
    }
  },

  async createOrder(data: InsertOrder): Promise<Order> {
    const startTime = Date.now();
    try {
      const id = crypto.randomUUID();
      insertOrderStmt.run(
        id, data.tracking_id, data.customer_name, data.phone,
        data.address, data.items, data.total_amount, data.payment_method,
        data.payment_info, data.status
      );
      const order = this.getOrder(id);
      logQuery('createOrder', startTime);
      return order!;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const startTime = Date.now();
    try {
      const updateStmt = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(status, id);
      const order = this.getOrder(id);
      logQuery('updateOrderStatus', startTime);
      return order!;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const startTime = Date.now();
    try {
      const categories = getCategoriesStmt.all() as Category[];
      logQuery('getCategories', startTime);
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Offers
  async getOffers(): Promise<Offer[]> {
    const startTime = Date.now();
    try {
      const offers = getOffersStmt.all() as Offer[];
      logQuery('getOffers', startTime);
      return offers;
    } catch (error) {
      console.error('Error getting offers:', error);
      throw error;
    }
  },

  // Settings
  async getSettings(): Promise<Setting[]> {
    const startTime = Date.now();
    try {
      const settings = getSettingsStmt.all() as Setting[];
      logQuery('getSettings', startTime);
      return settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  },

  // Analytics
  async createAnalytics(data: InsertAnalytics): Promise<void> {
    const startTime = Date.now();
    try {
      const insertAnalyticsStmt = db.prepare(`
        INSERT INTO analytics (id, event_type, event_data, user_session, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertAnalyticsStmt.run(
        crypto.randomUUID(), data.event_type, data.event_data,
        data.user_session, data.ip_address, data.user_agent
      );
      logQuery('createAnalytics', startTime);
    } catch (error) {
      console.error('Error creating analytics:', error);
    }
  }
};

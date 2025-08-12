import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, like } from "drizzle-orm";
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

// Direct Supabase connection
const connectionString = "postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

// Supabase optimized client
const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 10,
  prepare: false
});

const db = drizzle(client);

// Initialize database with sample data if needed
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database...');
    
    // Check if products exist
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length === 0) {
      // Insert sample products
      await db.insert(products).values([
        {
          name: "কাস্টমাইজড মগ",
          price: "350",
          description: "আপনার পছন্দের ছবি এবং টেক্সট সহ বিশেষ মগ",
          category: "mugs",
          image_url: "/images/mug.jpg",
          stock: 50,
          is_featured: true,
          is_best_selling: true
        },
        {
          name: "ফটো ফ্রেম",
          price: "500", 
          description: "সুন্দর কাঠের ফ্রেম আপনার প্রিয় ছবির জন্য",
          category: "frames",
          image_url: "/images/frame.jpg",
          stock: 30,
          is_latest: true,
          is_best_selling: true
        },
        {
          name: "কাস্টম টি-শার্ট",
          price: "650",
          description: "আপনার ডিজাইনে প্রিমিয়াম কোয়ালিটি টি-শার্ট", 
          category: "t-shirts",
          image_url: "/images/tshirt.jpg",
          stock: 25,
          is_featured: true
        },
        {
          name: "কী-চেইন",
          price: "150",
          description: "পার্সোনালাইজড কী-চেইন বিভিন্ন ডিজাইনে",
          category: "keychains", 
          image_url: "/images/keychain.jpg",
          stock: 100,
          is_best_selling: true
        }
      ]);
      console.log('✅ Sample products inserted');
    }

    // Initialize categories
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length === 0) {
      await db.insert(categories).values([
        { name: "mugs", name_bengali: "মগ", description: "কাস্টমাইজড মগের কালেকশন", is_active: true, sort_order: 1 },
        { name: "frames", name_bengali: "ফটো ফ্রেম", description: "সুন্দর ফটো ফ্রেমের সংগ্রহ", is_active: true, sort_order: 2 },
        { name: "t-shirts", name_bengali: "টি-শার্ট", description: "কাস্টম টি-শার্ট কালেকশন", is_active: true, sort_order: 3 },
        { name: "keychains", name_bengali: "কী-চেইন", description: "পার্সোনালাইজড কী-চেইন", is_active: true, sort_order: 4 }
      ]);
      console.log('✅ Sample categories inserted');
    }

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

export class SupabaseStorage {
  constructor() {
    // Initialize database on startup
    initializeDatabase();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      console.log('🔍 Fetching products from Supabase...');
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

  // Orders with enhanced tracking
  async getOrders(): Promise<Order[]> {
    try {
      console.log('🔍 Fetching orders from Supabase...');
      const result = await db.select().from(orders).orderBy(desc(orders.created_at));
      console.log(`✅ Orders fetched successfully: ${result.length} orders`);
      return result;
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | undefined> {
    try {
      console.log(`🔍 Searching for order with tracking ID: ${trackingId}`);
      const result = await db.select().from(orders).where(eq(orders.tracking_id, trackingId)).limit(1);
      return result[0];
    } catch (error) {
      console.error('❌ Error fetching order by tracking ID:', error);
      return undefined;
    }
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    const result = await db.select().from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.created_at));
    return result;
  }

  async searchOrders(query: string): Promise<Order[]> {
    const result = await db.select().from(orders)
      .where(
        like(orders.customer_name, `%${query}%`)
        // Add more search fields as needed
      )
      .orderBy(desc(orders.created_at));
    return result;
  }

  async createOrder(order: InsertOrder & { tracking_id: string }): Promise<Order> {
    const result = await db.insert(orders).values([order]).returning();
    console.log(`✅ Order created in Supabase: ${result[0].tracking_id}`);
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order> {
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
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

  // Offers
  async getOffers(): Promise<Offer[]> {
    try {
      const result = await db.select().from(offers)
        .where(eq(offers.active, true))
        .orderBy(desc(offers.created_at));
      return result;
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
      return [];
    }
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values([offer]).returning();
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
          facebook_page: "https://facebook.com/trynex",
          whatsapp_number: "+8801747292277"
        };
      }
      
      return settingsMap;
    } catch (error) {
      console.error('❌ Error fetching site settings:', error);
      return {
        site_title: "TryneX Lifestyle", 
        site_description: "আপনার পছন্দের গিফট শপ",
        facebook_page: "https://facebook.com/trynex",
        whatsapp_number: "+8801747292277"
      };
    }
  }

  async getSettings(): Promise<Record<string, string>> {
    return this.getSiteSettings();
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

  // Admin functions
  async getAdmins(): Promise<Admin[]> {
    const result = await db.select().from(admins);
    return result;
  }

  async getAdmin(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values([admin]).returning();
    return result[0];
  }

  // Custom Orders
  async getCustomOrders(): Promise<CustomOrder[]> {
    try {
      return await db.select().from(customOrders).orderBy(desc(customOrders.createdAt));
    } catch (error) {
      console.error('Error fetching custom orders:', error);
      return [];
    }
  }

  async getCustomOrder(id: string): Promise<CustomOrder | undefined> {
    try {
      const result = await db.select().from(customOrders).where(eq(customOrders.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching custom order:', error);
      return undefined;
    }
  }

  async createCustomOrder(customOrderData: InsertCustomOrder): Promise<CustomOrder> {
    try {
      const result = await db.insert(customOrders).values(customOrderData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating custom order:', error);
      throw new Error('Failed to create custom order');
    }
  }

  async updateCustomOrderStatus(id: string, status: string): Promise<CustomOrder> {
    try {
      const result = await db.update(customOrders).set({ 
        status, 
        updatedAt: new Date() 
      }).where(eq(customOrders.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating custom order status:', error);
      throw new Error('Failed to update custom order status');
    }
  }
}

export const supabaseStorage = new SupabaseStorage();
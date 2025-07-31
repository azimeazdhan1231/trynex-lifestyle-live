
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { 
  InsertProduct, InsertOrder, InsertOffer, InsertCategory, 
  InsertPromoCode, InsertAnalytics, InsertSiteSettings, User 
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

export const storage = {
  // Users
  async createOrUpdateUser(userData: { id: string; name: string; email: string; avatar_url?: string }) {
    try {
      const existingUser = await db.select().from(schema.users).where(eq(schema.users.id, userData.id)).limit(1);
      
      if (existingUser.length > 0) {
        // Update existing user
        const [updatedUser] = await db
          .update(schema.users)
          .set({
            name: userData.name,
            email: userData.email,
            avatar_url: userData.avatar_url,
            updated_at: new Date(),
          })
          .where(eq(schema.users.id, userData.id))
          .returning();
        return updatedUser;
      } else {
        // Create new user
        const [newUser] = await db
          .insert(schema.users)
          .values({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar_url: userData.avatar_url,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();
        return newUser;
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  },

  async getUser(userId: string) {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  async getUsers() {
    try {
      return await db.select().from(schema.users).orderBy(desc(schema.users.created_at));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // User Cart
  async getUserCart(userId: string) {
    try {
      const [cart] = await db.select().from(schema.userCarts).where(eq(schema.userCarts.user_id, userId)).limit(1);
      return cart;
    } catch (error) {
      console.error("Error fetching user cart:", error);
      return null;
    }
  },

  async updateUserCart(userId: string, items: any[]) {
    try {
      const existingCart = await this.getUserCart(userId);
      
      if (existingCart) {
        const [updatedCart] = await db
          .update(schema.userCarts)
          .set({
            items: JSON.stringify(items),
            updated_at: new Date(),
          })
          .where(eq(schema.userCarts.user_id, userId))
          .returning();
        return updatedCart;
      } else {
        const [newCart] = await db
          .insert(schema.userCarts)
          .values({
            user_id: userId,
            items: JSON.stringify(items),
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();
        return newCart;
      }
    } catch (error) {
      console.error("Error updating user cart:", error);
      throw error;
    }
  },

  // User Orders
  async getUserOrders(userId: string) {
    try {
      const userOrderLinks = await db
        .select()
        .from(schema.userOrders)
        .where(eq(schema.userOrders.user_id, userId));
      
      if (userOrderLinks.length === 0) return [];
      
      const orderIds = userOrderLinks.map(link => link.order_id);
      const orders = await db
        .select()
        .from(schema.orders)
        .where(sql`id = ANY(${orderIds})`)
        .orderBy(desc(schema.orders.created_at));
      
      return orders;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  async linkOrderToUser(orderId: string, userId: string) {
    try {
      await db.insert(schema.userOrders).values({
        user_id: userId,
        order_id: orderId,
        created_at: new Date(),
      });
    } catch (error) {
      console.error("Error linking order to user:", error);
      throw error;
    }
  },

  // Products
  async getProducts() {
    try {
      return await db.select().from(schema.products).orderBy(desc(schema.products.created_at));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProduct(id: string) {
    try {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async getProductsByCategory(category: string) {
    try {
      return await db.select().from(schema.products).where(eq(schema.products.category, category));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  async createProduct(product: InsertProduct) {
    try {
      const [newProduct] = await db.insert(schema.products).values({
        ...product,
        created_at: new Date(),
      }).returning();
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(id: string, product: Partial<InsertProduct>) {
    try {
      const [updatedProduct] = await db
        .update(schema.products)
        .set(product)
        .where(eq(schema.products.id, id))
        .returning();
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Orders
  async getOrders() {
    try {
      return await db.select().from(schema.orders).orderBy(desc(schema.orders.created_at));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  async getOrder(trackingId: string) {
    try {
      const [order] = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.tracking_id, trackingId))
        .limit(1);
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  async createOrder(order: InsertOrder) {
    try {
      const trackingId = `TN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const [newOrder] = await db.insert(schema.orders).values({
        ...order,
        tracking_id: trackingId,
        status: "pending",
        created_at: new Date(),
      }).returning();
      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async updateOrderStatus(id: string, status: string) {
    try {
      const [updatedOrder] = await db
        .update(schema.orders)
        .set({ status })
        .where(eq(schema.orders.id, id))
        .returning();
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Categories
  async getCategories() {
    try {
      return await db.select().from(schema.categories).orderBy(schema.categories.sort_order);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async createCategory(category: InsertCategory) {
    try {
      const [newCategory] = await db.insert(schema.categories).values({
        ...category,
        created_at: new Date(),
      }).returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<InsertCategory>) {
    try {
      const [updatedCategory] = await db
        .update(schema.categories)
        .set(category)
        .where(eq(schema.categories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      await db.delete(schema.categories).where(eq(schema.categories.id, id));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // Offers
  async getOffers() {
    try {
      return await db.select().from(schema.offers).orderBy(desc(schema.offers.created_at));
    } catch (error) {
      console.error("Error fetching offers:", error);
      throw error;
    }
  },

  async getActiveOffers() {
    try {
      return await db
        .select()
        .from(schema.offers)
        .where(eq(schema.offers.active, true))
        .orderBy(desc(schema.offers.created_at));
    } catch (error) {
      console.error("Error fetching active offers:", error);
      throw error;
    }
  },

  async createOffer(offer: InsertOffer) {
    try {
      const [newOffer] = await db.insert(schema.offers).values({
        ...offer,
        created_at: new Date(),
      }).returning();
      return newOffer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  },

  async updateOffer(id: string, offer: Partial<InsertOffer>) {
    try {
      const [updatedOffer] = await db
        .update(schema.offers)
        .set(offer)
        .where(eq(schema.offers.id, id))
        .returning();
      return updatedOffer;
    } catch (error) {
      console.error("Error updating offer:", error);
      throw error;
    }
  },

  async deleteOffer(id: string) {
    try {
      await db.delete(schema.offers).where(eq(schema.offers.id, id));
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw error;
    }
  },

  // Promo Codes
  async getPromoCodes() {
    try {
      return await db.select().from(schema.promoCodes).orderBy(desc(schema.promoCodes.created_at));
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      throw error;
    }
  },

  async createPromoCode(promoCode: InsertPromoCode) {
    try {
      const [newPromoCode] = await db.insert(schema.promoCodes).values({
        ...promoCode,
        created_at: new Date(),
      }).returning();
      return newPromoCode;
    } catch (error) {
      console.error("Error creating promo code:", error);
      throw error;
    }
  },

  async updatePromoCode(id: string, promoCode: Partial<InsertPromoCode>) {
    try {
      const [updatedPromoCode] = await db
        .update(schema.promoCodes)
        .set(promoCode)
        .where(eq(schema.promoCodes.id, id))
        .returning();
      return updatedPromoCode;
    } catch (error) {
      console.error("Error updating promo code:", error);
      throw error;
    }
  },

  async deletePromoCode(id: string) {
    try {
      await db.delete(schema.promoCodes).where(eq(schema.promoCodes.id, id));
    } catch (error) {
      console.error("Error deleting promo code:", error);
      throw error;
    }
  },

  async validatePromoCode(code: string, orderAmount: number) {
    try {
      const [promoCode] = await db
        .select()
        .from(schema.promoCodes)
        .where(and(
          eq(schema.promoCodes.code, code),
          eq(schema.promoCodes.is_active, true)
        ))
        .limit(1);

      if (!promoCode) {
        return { valid: false, message: "Invalid promo code" };
      }

      if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
        return { valid: false, message: "Promo code has expired" };
      }

      if (promoCode.min_order_amount && orderAmount < promoCode.min_order_amount) {
        return { 
          valid: false, 
          message: `Minimum order amount is ${promoCode.min_order_amount}` 
        };
      }

      if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
        return { valid: false, message: "Promo code usage limit reached" };
      }

      const discount = promoCode.discount_type === "percentage" 
        ? (orderAmount * promoCode.discount_value) / 100
        : promoCode.discount_value;

      const finalDiscount = promoCode.max_discount_amount 
        ? Math.min(discount, promoCode.max_discount_amount)
        : discount;

      return {
        valid: true,
        discount: finalDiscount,
        promoCode: promoCode
      };
    } catch (error) {
      console.error("Error validating promo code:", error);
      throw error;
    }
  },

  // Analytics
  async getAnalytics(eventType?: string, startDate?: string, endDate?: string) {
    try {
      let query = db.select().from(schema.analytics);
      
      if (eventType || startDate || endDate) {
        const conditions = [];
        if (eventType) conditions.push(eq(schema.analytics.event_type, eventType));
        if (startDate) conditions.push(gte(schema.analytics.created_at, new Date(startDate)));
        if (endDate) conditions.push(lte(schema.analytics.created_at, new Date(endDate)));
        
        query = query.where(and(...conditions));
      }
      
      return await query.orderBy(desc(schema.analytics.created_at));
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },

  async createAnalytics(analytics: InsertAnalytics) {
    try {
      const [newAnalytics] = await db.insert(schema.analytics).values({
        ...analytics,
        created_at: new Date(),
      }).returning();
      return newAnalytics;
    } catch (error) {
      console.error("Error creating analytics:", error);
      throw error;
    }
  },

  // Site Settings
  async getSettings() {
    try {
      return await db.select().from(schema.siteSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },

  async createSetting(setting: InsertSiteSettings) {
    try {
      const [newSetting] = await db.insert(schema.siteSettings).values({
        ...setting,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning();
      return newSetting;
    } catch (error) {
      console.error("Error creating setting:", error);
      throw error;
    }
  },

  async updateSetting(key: string, value: string) {
    try {
      const [updatedSetting] = await db
        .update(schema.siteSettings)
        .set({ 
          value, 
          updated_at: new Date() 
        })
        .where(eq(schema.siteSettings.key, key))
        .returning();
      return updatedSetting;
    } catch (error) {
      console.error("Error updating setting:", error);
      throw error;
    }
  },

  // Admin
  async getAdminByEmail(email: string) {
    try {
      if (email === "admin@trynex.com") {
        return {
          id: "admin-1",
          email: "admin@trynex.com",
          password: "admin123"
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching admin:", error);
      throw error;
    }
  },
};

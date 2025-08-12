// In-memory storage fallback for when database is not available
import type { Product, Order, Offer, Category } from "@shared/schema";

const generateTrackingId = () => {
  return 'TRY' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

class MemoryStorage {
  private products: Product[] = [];
  private orders: Order[] = [];
  private offers: Offer[] = [];
  private categories: Category[] = [];
  private settings: Record<string, string> = {
    site_title: "TryneX Lifestyle",
    site_description: "আপনার পছন্দের গিফট শপ",
    facebook_page: "https://facebook.com",
    whatsapp_number: "+8801747292277"
  };

  // Initialize with sample data
  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    this.products = [
      {
        id: "1",
        name: "কাস্টমাইজড মগ",
        price: "350",
        description: "আপনার পছন্দের ছবি এবং টেক্সট সহ বিশেষ মগ",
        category: "mugs",
        image_url: "/images/mug.jpg",
        stock: 50,
        is_featured: true,
        is_latest: false,
        is_best_selling: true,
        created_at: new Date()
      },
      {
        id: "2",
        name: "ফটো ফ্রেম",
        price: "500",
        description: "সুন্দর কাঠের ফ্রেম আপনার প্রিয় ছবির জন্য",
        category: "frames",
        image_url: "/images/frame.jpg",
        stock: 30,
        is_featured: false,
        is_latest: true,
        is_best_selling: false,
        created_at: new Date()
      }
    ];

    this.categories = [
      {
        id: "1",
        name: "mugs",
        name_bengali: "মগ",
        description: "কাস্টমাইজড মগের কালেকশন",
        image_url: "/images/category-mugs.jpg",
        is_active: true,
        sort_order: 1,
        created_at: new Date()
      }
    ];
  }

  async getProducts(): Promise<Product[]> {
    console.log('✅ Memory storage: Fetched products');
    return this.products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  async createOrder(orderData: any): Promise<Order> {
    const order: Order = {
      id: Date.now().toString(),
      tracking_id: generateTrackingId(),
      user_id: orderData.user_id || null,
      customer_name: orderData.customer_name,
      district: orderData.district,
      thana: orderData.thana,
      address: orderData.address,
      phone: orderData.phone,
      payment_info: orderData.payment_info,
      status: orderData.status || "pending",
      items: orderData.items,
      total: String(orderData.total),
      custom_instructions: orderData.custom_instructions || null,
      custom_images: orderData.custom_images || null,
      created_at: new Date()
    };

    this.orders.push(order);
    console.log(`✅ Memory storage: Order created with ID ${order.tracking_id}`);
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrder(trackingId: string): Promise<Order | undefined> {
    return this.orders.find(o => o.tracking_id === trackingId);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return order;
    }
    throw new Error('Order not found');
  }

  async getOffers(): Promise<Offer[]> {
    return this.offers;
  }

  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getSiteSettings(): Promise<Record<string, string>> {
    return this.settings;
  }

  async getSettings(): Promise<Record<string, string>> {
    return this.getSiteSettings();
  }

  async createAnalytics(data: any): Promise<any> {
    console.log('✅ Memory storage: Analytics tracked');
    return { id: Date.now().toString(), ...data };
  }
}

export const memoryStorage = new MemoryStorage();
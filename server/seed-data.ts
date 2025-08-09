import { SimpleStorage } from "./simple-storage";

const storage = new SimpleStorage();

const sampleCategories = [
  {
    name: "gift-for-him",
    name_bengali: "তার জন্য উপহার",
    description: "পুরুষদের জন্য বিশেষ উপহার",
    image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    is_active: true,
    sort_order: 1
  },
  {
    name: "gift-for-her", 
    name_bengali: "তাঁর জন্য উপহার",
    description: "মহিলাদের জন্য বিশেষ উপহার",
    image_url: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=400&h=300&fit=crop",
    is_active: true,
    sort_order: 2
  },
  {
    name: "mugs",
    name_bengali: "মগ",
    description: "কাস্টম মগ এবং কাপ",
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop",
    is_active: true,
    sort_order: 3
  },
  {
    name: "t-shirts",
    name_bengali: "টি-শার্ট",
    description: "কাস্টম টি-শার্ট এবং পোশাক",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
    is_active: true,
    sort_order: 4
  }
];

const sampleProducts = [
  {
    name: "কাস্টম ফটো মগ",
    price: "450",
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop",
    category: "mugs",
    stock: 50,
    description: "আপনার প্রিয় ছবি দিয়ে তৈরি বিশেষ মগ। উচ্চমানের সিরামিক এবং টেকসই প্রিন্ট।",
    is_featured: true,
    is_latest: true,
    is_best_selling: false
  },
  {
    name: "ব্যক্তিগত টি-শার্ট",
    price: "650",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "t-shirts",
    stock: 30,
    description: "আপনার পছন্দের ডিজাইন সহ প্রিমিয়াম কোয়ালিটি টি-শার্ট। ১০০% কটন।",
    is_featured: true,
    is_latest: false,
    is_best_selling: true
  },
  {
    name: "কাস্টম কিচেইন",
    price: "200",
    image_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop",
    category: "gift-for-him", 
    stock: 100,
    description: "ব্যক্তিগত ছবি বা নাম সহ আকর্ষণীয় কিচেইন। দৈনন্দিন ব্যবহারের জন্য উপযুক্ত।",
    is_featured: false,
    is_latest: true,
    is_best_selling: false
  },
  {
    name: "ফটো ফ্রেম গিফট",
    price: "350",
    image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
    category: "gift-for-her",
    stock: 25,
    description: "সুন্দর কাঠের ফ্রেমে আপনার স্মৃতির ছবি। বিশেষ উপহারের জন্য আদর্শ।",
    is_featured: true,
    is_latest: false,
    is_best_selling: true
  },
  {
    name: "কাস্টম ওয়াটার বোতল",
    price: "550",
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    category: "gift-for-him",
    stock: 40,
    description: "স্টেইনলেস স্টিল ওয়াটার বোতল আপনার পছন্দের ডিজাইন সহ। ২৪ ঘন্টা ঠান্ডা রাখে।",
    is_featured: false,
    is_latest: true,
    is_best_selling: false
  },
  {
    name: "বার্থডে কেক টপার",
    price: "250",
    image_url: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=400&h=400&fit=crop",
    category: "gift-for-her",
    stock: 60,
    description: "জন্মদিনের কেকের জন্য বিশেষ কাস্টম টপার। যেকোনো নাম বা বয়স দিয়ে তৈরি।",
    is_featured: false,
    is_latest: false,
    is_best_selling: true
  }
];

const sampleOffers = [
  {
    title: "বিশেষ ছাড় - ৩০% পর্যন্ত",
    description: "সব ধরনের কাস্টম পণ্যে বিশেষ ছাড়! সীমিত সময়ের জন্য।",
    image_url: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop",
    discount_percentage: 30,
    min_order_amount: "500",
    button_text: "এখনই অর্ডার করুন",
    button_link: "/products",
    is_popup: true,
    popup_delay: 5000,
    active: true,
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Add categories first
    for (const category of sampleCategories) {
      try {
        await storage.createCategory(category);
        console.log(`✅ Added category: ${category.name_bengali}`);
      } catch (error) {
        console.log(`⚠️  Category ${category.name_bengali} might already exist`);
      }
    }
    
    // Add products
    for (const product of sampleProducts) {
      try {
        await storage.createProduct(product);
        console.log(`✅ Added product: ${product.name}`);
      } catch (error) {
        console.log(`⚠️  Product ${product.name} might already exist`);
      }
    }
    
    // Add offers  
    for (const offer of sampleOffers) {
      try {
        await storage.createOffer(offer);
        console.log(`✅ Added offer: ${offer.title}`);
      } catch (error) {
        console.log(`⚠️  Offer ${offer.title} might already exist`);
      }
    }
    
    console.log("🎉 Database seeding completed!");
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  }
}
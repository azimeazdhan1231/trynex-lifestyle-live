// Static data for faster initial load and better performance
export const STATIC_CATEGORIES = [
  { id: "electronics", name: "ইলেকট্রনিক্স", image: "/categories/electronics.jpg" },
  { id: "fashion", name: "ফ্যাশন", image: "/categories/fashion.jpg" },
  { id: "home", name: "হোম ডেকোর", image: "/categories/home.jpg" },
  { id: "beauty", name: "বিউটি", image: "/categories/beauty.jpg" },
  { id: "sports", name: "স্পোর্টস", image: "/categories/sports.jpg" },
  { id: "books", name: "বই", image: "/categories/books.jpg" },
  { id: "toys", name: "খেলনা", image: "/categories/toys.jpg" },
  { id: "jewelry", name: "গহনা", image: "/categories/jewelry.jpg" },
];

export const TRUST_INDICATORS = [
  {
    icon: "shield",
    title: "নিরাপদ পেমেন্ট",
    description: "১০০% সুরক্ষিত লেনদেন"
  },
  {
    icon: "truck",
    title: "দ্রুত ডেলিভারি",
    description: "ঢাকায় ২৪ ঘন্টা, বাইরে ৪৮ ঘন্টা"
  },
  {
    icon: "refresh",
    title: "৭ দিন রিটার্ন",
    description: "সহজ রিটার্ন ও এক্সচেঞ্জ"
  },
  {
    icon: "phone",
    title: "২৪/৭ সাপোর্ট",
    description: "যেকোনো সময় সহায়তা"
  },
];

export const POPULAR_SEARCHES = [
  "মোবাইল ফোন",
  "ল্যাপটপ",
  "স্মার্ট ওয়াচ",
  "হেডফোন",
  "পাওয়ার ব্যাংক",
  "ব্লুটুথ স্পিকার",
  "চার্জার",
  "ক্যামেরা",
];

export const PRICE_RANGES = [
  { min: 0, max: 500, label: "৫০০ টাকার নিচে" },
  { min: 500, max: 1000, label: "৫০০ - ১০০০ টাকা" },
  { min: 1000, max: 2000, label: "১০০০ - ২০০০ টাকা" },
  { min: 2000, max: 5000, label: "২০০০ - ৫০০০ টাকা" },
  { min: 5000, max: 10000, label: "৫০০০ - ১০০০০ টাকা" },
  { min: 10000, max: Infinity, label: "১০০০০ টাকার উপরে" },
];

export const FEATURED_BADGES = {
  featured: { color: "bg-red-500", text: "ফিচারড", icon: "star" },
  new: { color: "bg-green-500", text: "নতুন", icon: "zap" },
  bestseller: { color: "bg-blue-500", text: "বেস্ট সেলার", icon: "trending-up" },
  sale: { color: "bg-orange-500", text: "সেল", icon: "tag" },
  hot: { color: "bg-purple-500", text: "হট", icon: "flame" },
};

// Cache keys for consistent cache management
export const CACHE_KEYS = {
  products: '/api/products',
  categories: '/api/categories',
  settings: '/api/settings',
  orders: '/api/orders',
  user: '/api/user',
} as const;

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 15 * 60 * 1000, // 15 minutes
  long: 60 * 60 * 1000, // 1 hour
  static: 24 * 60 * 60 * 1000, // 24 hours
} as const;
// Price formatting utility
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// WhatsApp URL creation utility
export const createWhatsAppUrl = (message: string): string => {
  const phoneNumber = '+8801234567890'; // Replace with your actual WhatsApp number
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

// Company and contact constants
export const COMPANY_NAME = 'TryneX Lifestyle Shop';
export const COMPANY_TAGLINE = 'Your Premium Lifestyle Destination';
export const WHATSAPP_NUMBER = '+8801234567890';
export const PHONE_NUMBER = '+880 1234-567890';

// App constants
export const APP_NAME = 'TryneX Lifestyle Shop';
export const APP_DESCRIPTION = 'Your premium lifestyle destination';
export const APP_VERSION = '1.0.0';

// Contact information
export const CONTACT_PHONE = '+880 1234-567890';
export const CONTACT_EMAIL = 'support@trynexlifestyle.com';
export const CONTACT_ADDRESS = 'Dhaka, Bangladesh';

// Social media links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/trynexlifestyle',
  instagram: 'https://instagram.com/trynexlifestyle',
  twitter: 'https://twitter.com/trynexlifestyle',
  youtube: 'https://youtube.com/trynexlifestyle',
};

// Social media page URLs
export const FACEBOOK_PAGE = 'https://facebook.com/trynexlifestyle';
export const INSTAGRAM_PAGE = 'https://instagram.com/trynexlifestyle';
export const TWITTER_PAGE = 'https://twitter.com/trynexlifestyle';
export const YOUTUBE_PAGE = 'https://youtube.com/trynexlifestyle';

// API endpoints
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com/api' 
  : 'http://localhost:5000/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PRODUCT_NAME_LENGTH = 100;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 1000;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  CART: 24 * 60 * 60 * 1000, // 24 hours
};

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'cash_on_delivery',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_BANKING: 'mobile_banking',
  CREDIT_CARD: 'credit_card',
} as const;

// Delivery zones
export const DELIVERY_ZONES = {
  DHAKA_CITY: {
    name: 'ঢাকা সিটি',
    deliveryTime: '1-2 দিন',
    deliveryFee: 60,
  },
  DHAKA_OUTSIDE: {
    name: 'ঢাকার বাইরে',
    deliveryTime: '3-5 দিন',
    deliveryFee: 120,
  },
  OTHER_CITIES: {
    name: 'অন্যান্য শহর',
    deliveryTime: '5-7 দিন',
    deliveryFee: 200,
  },
} as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  'Gifts',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty & Health',
  'Sports & Outdoor',
  'Books & Stationery',
  'Automotive',
  'Toys & Games',
  'Food & Beverages',
] as const;

// Product badges
export const PRODUCT_BADGES = {
  FEATURED: 'featured',
  NEW: 'new',
  BEST_SELLING: 'best_selling',
  SALE: 'sale',
  LIMITED_EDITION: 'limited_edition',
  PREMIUM: 'premium',
} as const;

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'order_update',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
  SECURITY: 'security',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'নেটওয়ার্ক সমস্যা। অনুগ্রহ করে আবার চেষ্টা করুন।',
  UNAUTHORIZED: 'আপনার অ্যাক্সেস নেই। অনুগ্রহ করে লগইন করুন।',
  FORBIDDEN: 'এই কাজটি করার অনুমতি নেই।',
  NOT_FOUND: 'অনুরোধকৃত তথ্য পাওয়া যায়নি।',
  VALIDATION_ERROR: 'অনুগ্রহ করে সঠিক তথ্য দিন।',
  SERVER_ERROR: 'সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
  TIMEOUT_ERROR: 'অনুরোধ সময় শেষ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'আপনার অর্ডার সফলভাবে দেওয়া হয়েছে!',
  PRODUCT_ADDED: 'পণ্য কার্টে যোগ করা হয়েছে!',
  PROFILE_UPDATED: 'প্রোফাইল আপডেট করা হয়েছে!',
  PASSWORD_CHANGED: 'পাসওয়ার্ড পরিবর্তন করা হয়েছে!',
  ACCOUNT_CREATED: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
  LOGIN_SUCCESS: 'সফলভাবে লগইন হয়েছে!',
  LOGOUT_SUCCESS: 'সফলভাবে লগআউট হয়েছে!',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  LOADING_PRODUCTS: 'পণ্য লোড হচ্ছে...',
  LOADING_CART: 'কার্ট লোড হচ্ছে...',
  PROCESSING_ORDER: 'অর্ডার প্রক্রিয়া হচ্ছে...',
  UPLOADING_FILE: 'ফাইল আপলোড হচ্ছে...',
  SAVING_CHANGES: 'পরিবর্তন সংরক্ষণ হচ্ছে...',
  SEARCHING: 'অনুসন্ধান হচ্ছে...',
} as const;

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_PRODUCTS: 'কোনো পণ্য পাওয়া যায়নি।',
  NO_ORDERS: 'কোনো অর্ডার নেই।',
  NO_WISHLIST: 'উইশলিস্টে কোনো পণ্য নেই।',
  NO_SEARCH_RESULTS: 'অনুসন্ধানের ফলাফল পাওয়া যায়নি।',
  CART_EMPTY: 'আপনার কার্ট খালি।',
} as const;
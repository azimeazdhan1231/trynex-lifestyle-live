// Company Information
export const COMPANY_NAME = "TryneX Lifestyle";
export const COMPANY_TAGLINE = "Premium Customization Shop";
export const COMPANY_DESCRIPTION = "Your premium destination for personalized lifestyle products";

// Contact Information
export const WHATSAPP_NUMBER = "+880 1234-567890";
export const PHONE_NUMBER = "+880 1234-567890";
export const EMAIL = "support@trynex.com";
export const ADDRESS = "Dhaka, Bangladesh";

// Social Media
export const FACEBOOK_PAGE = "https://facebook.com/trynexlifestyle";
export const INSTAGRAM_PAGE = "https://instagram.com/trynexlifestyle";
export const TWITTER_PAGE = "https://twitter.com/trynexlifestyle";
export const YOUTUBE_PAGE = "https://youtube.com/trynexlifestyle";

// Business Information
export const BUSINESS_HOURS = "9:00 AM - 6:00 PM (GMT+6)";
export const SHIPPING_TIME = "2-3 business days";
export const RETURN_POLICY = "30 days return policy";

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'drinkware', name: 'Drinkware', icon: '☕' },
  { id: 'artwork', name: 'Artwork', icon: '🎨' },
  { id: 'accessories', name: 'Accessories', icon: '📱' }
];

// Customization Options
export const CUSTOMIZATION_TYPES = {
  clothing: {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: ['White', 'Black', 'Navy', 'Gray', 'Red', 'Blue', 'Green'],
    materials: ['100% Cotton', 'Polyester Blend', 'Premium Cotton', 'Organic Cotton']
  },
  drinkware: {
    sizes: ['12oz', '16oz', '20oz', '24oz', '32oz'],
    colors: ['White', 'Black', 'Stainless Steel', 'Clear', 'Colored'],
    materials: ['Ceramic', 'Stainless Steel', 'Glass', 'Plastic']
  },
  artwork: {
    sizes: ['8x10"', '11x14"', '16x20"', '20x24"', '24x36"'],
    colors: ['Full Color', 'Black & White', 'Sepia', 'Vintage'],
    materials: ['Canvas', 'Photo Paper', 'Vinyl', 'Fabric']
  }
};

// Pricing
export const CUSTOMIZATION_FEES = {
  clothing: 15,
  drinkware: 8,
  artwork: 12,
  accessories: 10
};

// Utility Functions
export const createWhatsAppUrl = (message: string): string => {
  const phoneNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numPrice);
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
};

// API Endpoints
export const API_ENDPOINTS = {
  products: '/api/products',
  categories: '/api/categories',
  orders: '/api/orders',
  users: '/api/users',
  auth: '/api/auth',
  health: '/api/health'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: 'trynex_cart',
  WISHLIST: 'trynex_wishlist',
  USER: 'trynex_user',
  THEME: 'trynex_theme',
  LANGUAGE: 'trynex_language'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

// Language Options
export const LANGUAGES = {
  EN: 'en',
  BN: 'bn'
} as const;

// Order Statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_TOO_LONG: 'Password must be less than 128 characters',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Please upload a valid image file (JPEG, PNG, WebP)',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED_TO_CART: 'Product added to cart successfully!',
  PRODUCT_ADDED_TO_WISHLIST: 'Product added to wishlist successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTRATION_SUCCESS: 'Account created successfully!'
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  LAPTOP: 1024,
  DESKTOP: 1280,
  WIDE: 1536
} as const;

// Z-Index Scale
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;
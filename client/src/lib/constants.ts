export const WHATSAPP_NUMBER = "+8801940689487";
export const COMPANY_NAME = "TryneX Shop";
export const COMPANY_TAGLINE = "আপনার পছন্দের গিফট শপ";

export const DISTRICTS = [
  "ঢাকা",
  "চট্টগ্রাম", 
  "সিলেট",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ"
];

export const PRODUCT_CATEGORIES = [
  { id: "all", name: "All Products", icon: "🛍️" },
  { id: "gift-for-him", name: "Gift for Him", icon: "🎁" },
  { id: "gift-for-her", name: "Gift for Her", icon: "💝" },
  { id: "baby-gifts", name: "Baby Gifts", icon: "👶" },
  { id: "men-gifts", name: "Men Gifts", icon: "👨" },
  { id: "women-gifts", name: "Women Gifts", icon: "👩" },
  { id: "kids-gifts", name: "Kids Gifts", icon: "🧒" },
  { id: "mugs", name: "Mugs", icon: "☕" },
  { id: "t-shirts", name: "T-Shirts", icon: "👕" },
  { id: "keychains", name: "Keychains", icon: "🔑" },
  { id: "water-bottles", name: "Water Bottles", icon: "🍶" },
  { id: "personalized-gifts", name: "Personalized Gifts", icon: "✨" },
  { id: "corporate-gifts", name: "Corporate Gifts", icon: "💼" },
  { id: "anniversary-gifts", name: "Anniversary Gifts", icon: "💖" },
  { id: "birthday-gifts", name: "Birthday Gifts", icon: "🎂" },
  { id: "holiday-gifts", name: "Holiday Gifts", icon: "🎄" },
  { id: "custom-prints", name: "Custom Prints", icon: "🖨️" },
  { id: "gift-packages", name: "Gift Packages", icon: "📦" },
  { id: "home-decor-gifts", name: "Home Decor Gifts", icon: "🏠" },
  { id: "fashion-accessories", name: "Fashion Accessories", icon: "👜" },
  { id: "seasonal-specials", name: "Seasonal Specials", icon: "🌟" },
];

export const ORDER_STATUSES = [
  { id: "pending", name: "অপেক্ষমান", color: "text-yellow-600" },
  { id: "processing", name: "প্রসেসিং", color: "text-blue-600" },
  { id: "shipped", name: "পাঠানো হয়েছে", color: "text-purple-600" },
  { id: "delivered", name: "ডেলিভার হয়েছে", color: "text-green-600" },
  { id: "cancelled", name: "বাতিল", color: "text-red-600" }
];

export const formatPrice = (price: number | string): string => {
  return `${price} ৳`;
};

export const createWhatsAppUrl = (message: string): string => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const calculateDeliveryFee = (district: string, orderAmount: number): number => {
  const dhakaDistricts = ["ঢাকা"];
  const baseFee = dhakaDistricts.includes(district) ? 80 : 120;
  
  // Free delivery for orders above 2000tk
  return orderAmount >= 2000 ? 0 : baseFee;
};

export const FREE_DELIVERY_THRESHOLD = 2000;

export const THANAS_BY_DISTRICT: Record<string, string[]> = {
  "ঢাকা": [
    "ধানমন্ডি", "গুলশান", "বনানী", "উত্তরা", "মিরপুর", "রামনা", "তেজগাঁও", "ওয়ারী", 
    "সূত্রাপুর", "কোতোয়ালী", "শাহবাগ", "নিউমার্কেট", "হাজারীবাগ", "লালবাগ", "চকবাজার"
  ],
  "চট্টগ্রাম": [
    "কোতোয়ালী", "পাঁচলাইশ", "ডবলমুরিং", "চান্দগাঁও", "বায়েজিদ", "হালিশহর", "আগ্রাবাদ", 
    "সীতাকুণ্ড", "মীরসরাই", "সন্দ্বীপ", "বোয়ালখালী", "আনোয়ারা", "চন্দনাইশ", "সাতকানিয়া"
  ],
  "সিলেট": [
    "সিলেট সদর", "জৈন্তাপুর", "কানাইঘাট", "বিশ্বনাথ", "বালাগঞ্জ", "বেলাইছড়ি", 
    "ফেঞ্চুগঞ্জ", "গোলাপগঞ্জ", "গোয়াইনঘাট", "হবিগঞ্জ", "লাখাই", "নবীগঞ্জ"
  ],
  "রাজশাহী": [
    "রাজশাহী সদর", "বাগমারা", "চারঘাট", "দুর্গাপুর", "গোদাগাড়ী", "মোহনপুর", 
    "পুঠিয়া", "তানোর", "নাটোর", "সিংড়া", "বড়াইগ্রাম", "গুরুদাসপুর"
  ],
  "খুলনা": [
    "খুলনা সদর", "সোনাডাঙ্গা", "খান জাহান আলী", "কয়রা", "পাইকগাছা", "রূপসা", 
    "তেরখাদা", "বটিয়াঘাটা", "দাকোপ", "ডুমুরিয়া", "ফকিরহাট", "মোল্লাহাট"
  ],
  "বরিশাল": [
    "বরিশাল সদর", "আগৈলঝাড়া", "বাবুগঞ্জ", "বাকেরগঞ্জ", "বানারীপাড়া", "গৌরনদী", 
    "হিজলা", "মেহেন্দিগঞ্জ", "মুলাদী", "উজিরপুর", "ভোলা", "চরফ্যাশন"
  ],
  "রংপুর": [
    "রংপুর সদর", "বদরগঞ্জ", "গঙ্গাচড়া", "কাউনিয়া", "মিঠাপুকুর", "পীরগঞ্জ", 
    "পীরগাছা", "তারাগঞ্জ", "কুড়িগ্রাম", "ভুরুঙ্গামারী", "চিলমারী", "রাজারহাট"
  ],
  "ময়মনসিংহ": [
    "ময়মনসিংহ সদর", "ভালুকা", "ত্রিশাল", "মুক্তাগাছা", "নান্দাইল", "তারাকান্দা", 
    "গৌরীপুর", "গফরগাঁও", "ঈশ্বরগঞ্জ", "হালুয়াঘাট", "ফুলবাড়ীয়া", "ধোবাউড়া"
  ]
};
export const PHONE_NUMBER = "+8801940689487";
export const BKASH_NUMBER = "01747292277";
export const NAGAD_NUMBER = "01747292277";
export const FACEBOOK_PAGE = "https://www.facebook.com/profile.php?id=61576151563336";
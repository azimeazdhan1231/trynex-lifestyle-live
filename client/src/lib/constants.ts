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
  { id: "all", name: "সব পণ্য", bengaliName: "সব পণ্য", icon: "🛍️" },
  { id: "gift-for-her", name: "Gift for Her", bengaliName: "তার জন্য উপহার", icon: "💝" },
  { id: "gift-for-him", name: "Gift for Him", bengaliName: "তার জন্য উপহার", icon: "🎁" },
  { id: "gift-for-babies", name: "Gift for Babies", bengaliName: "শিশুদের জন্য উপহার", icon: "👶" },
  { id: "gift-for-parents", name: "Gift for Parents", bengaliName: "বাবা-মায়ের জন্য উপহার", icon: "👨‍👩‍👧‍👦" },
  { id: "birthday-gift", name: "Birthday Gift", bengaliName: "জন্মদিনের উপহার", icon: "🎂" },
  { id: "anniversary-gift", name: "Anniversary Gift", bengaliName: "বার্ষিকীর উপহার", icon: "💖" },
  { id: "wedding-gift", name: "Wedding Gift", bengaliName: "বিয়ের উপহার", icon: "💒" },
  { id: "valentine-gift", name: "Valentine Gift", bengaliName: "ভালোবাসা দিবসের উপহার", icon: "💕" },
  { id: "friendship-gift", name: "Friendship Gift", bengaliName: "বন্ধুত্বের উপহার", icon: "🤝" },
  { id: "graduation-gift", name: "Graduation Gift", bengaliName: "স্নাতকের উপহার", icon: "🎓" },
  { id: "corporate-gift", name: "Corporate Gift", bengaliName: "কর্পোরেট উপহার", icon: "💼" },
  { id: "mugs", name: "Mugs", bengaliName: "মগ", icon: "☕" },
  { id: "t-shirts", name: "T-Shirts", bengaliName: "টি-শার্ট", icon: "👕" },
  { id: "frames", name: "Photo Frames", bengaliName: "ফটো ফ্রেম", icon: "🖼️" },
  { id: "keychains", name: "Keychains", bengaliName: "চাবির রিং", icon: "🔑" },
  { id: "personalized-gifts", name: "Personalized Gifts", bengaliName: "ব্যক্তিগত উপহার", icon: "✨" },
  { id: "home-decor", name: "Home Decor", bengaliName: "ঘর সাজানোর জিনিস", icon: "🏠" },
  { id: "accessories", name: "Accessories", bengaliName: "এক্সেসরিজ", icon: "👜" },
  { id: "seasonal-gifts", name: "Seasonal Gifts", bengaliName: "মৌসুমী উপহার", icon: "🌟" },
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
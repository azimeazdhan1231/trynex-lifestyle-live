export const WHATSAPP_NUMBER = "8801904068947";
export const COMPANY_NAME = "Trynex Lifestyle";
export const COMPANY_TAGLINE = "কাস্টম গিফট স্টোর";

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
  { id: "all", name: "সকল পণ্য" },
  { id: "gifts", name: "গিফট আইটেম" },
  { id: "lifestyle", name: "লাইফস্টাইল" },
  { id: "accessories", name: "এক্সেসরিজ" }
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

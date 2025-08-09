import { useState, useEffect, Component, ErrorInfo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, MessageCircle, Upload, X } from "lucide-react";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
  productVariant?: string;
}

interface CustomizationData {
  text?: string;
  images?: File[];
  options?: Record<string, string>;
}

interface ProductVariant {
  id: string;
  name: string;
  basePrice: number;
}

// Error boundary component for the customize modal
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Caught error in CustomizeModal: ", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">দুঃখিত, একটি ত্রুটি ঘটেছে!</h2>
          <p className="text-sm text-gray-600 mb-4">
            {this.state.error?.message || "অজানা ত্রুটি"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            পুনরায় লোড করুন
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}


const formatPrice = (price: number): string => {
  return `৳${price.toFixed(0)}`;
};

const createWhatsAppUrl = (message: string): string => {
  const phoneNumber = "8801700000000"; // Replace with actual WhatsApp number
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

const CUSTOMIZATION_OPTIONS = {
  "T-Shirts": {
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["সাদা", "কালো", "নেভি", "গ্রে", "লাল", "নীল"],
    printAreas: ["সামনে", "পিছনে", "উভয় পাশে"]
  },
  "Mugs": {
    sizes: ["৩০০মিলি", "৪৫০মিলি"],
    colors: ["সাদা", "কালো", "নীল", "লাল"],
    printAreas: ["সামনে", "পিছনে", "চারপাশে"]
  },
  "Water Bottles": {
    sizes: ["৫০০মিলি", "৭৫০মিলি", "১ লিটার"],
    colors: ["সাদা", "কালো", "নীল", "সিলভার"],
    printAreas: ["সামনে", "চারপাশে"]
  },
  "Keychains": {
    sizes: ["স্ট্যান্ডার্ড"],
    colors: ["সাদা", "কালো", "স্বচ্ছ"],
    printAreas: ["একপাশে", "দুইপাশে"]
  }
};

// Helper function to convert File to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function CustomizeModalFixed({ product, isOpen, onClose, onAddToCart, productVariant }: CustomizeModalProps) {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL BEFORE ANY CONDITIONAL RETURNS
  const [customization, setCustomization] = useState({
    size: "",
    color: "",
    printArea: "",
    customText: "",
    customImage: null as File | null,
    instructions: "",
    specialInstructions: "",
    quantity: 1,
    urgency: "normal",
    deliveryPreference: "standard",
    additionalRequests: ""
  });

  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [showDirectOrder, setShowDirectOrder] = useState(false);

  // Early return after ALL hooks are called
  if (!product) return null;

  const getProductType = (productName: string | undefined): keyof typeof CUSTOMIZATION_OPTIONS => {
    if (!productName) return "T-Shirts"; // Default fallback
    const name = productName.toLowerCase();
    if (name.includes("t-shirt") || name.includes("tshirt") || name.includes("shirt")) return "T-Shirts";
    if (name.includes("mug")) return "Mugs";
    if (name.includes("bottle") || name.includes("tumbler")) return "Water Bottles";
    if (name.includes("keychain") || name.includes("key")) return "Keychains";
    return "T-Shirts"; // Default
  };

  // Support product variants from same page - add null checks
  const currentProductName = productVariant || product?.name || "";
  const productType = getProductType(currentProductName);
  const options = CUSTOMIZATION_OPTIONS[productType];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ফাইল খুব বড়",
          description: "দয়া করে ৫MB এর কম সাইজের ছবি আপলোড করুন",
          variant: "destructive",
        });
        return;
      }
      setCustomization(prev => ({ ...prev, customImage: file }));

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = async () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    // Convert File to base64 string for storage
    let customImageBase64 = null;
    let customImageName = null;

    if (customization.customImage && customization.customImage instanceof File) {
      try {
        customImageBase64 = await convertFileToBase64(customization.customImage);
        customImageName = customization.customImage.name;
        console.log('Image converted to base64 successfully');
      } catch (error) {
        console.error('Failed to convert image:', error);
        toast({
          title: "ছবি আপলোড সমস্যা",
          description: "ছবি প্রক্রিয়া করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          variant: "destructive",
        });
        return;
      }
    }

    const customizationData = {
      size: customization.size,
      color: customization.color,
      printArea: customization.printArea,
      quantity: customization.quantity,
      customText: customization.customText?.trim() || "",
      specialInstructions: customization.specialInstructions?.trim() || "",
      customImage: customImageBase64, // Store as base64 string
      customImageName: customImageName,
      urgency: customization.urgency,
      deliveryPreference: customization.deliveryPreference,
      additionalRequests: customization.additionalRequests?.trim() || ""
    };

    console.log('Sending customization data:', customizationData);

    await onAddToCart(product, customizationData);
    toast({
      title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে",
      description: `${product.name} আপনার পছন্দমতো কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
    });
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const customDetails = `
📝 কাস্টমাইজেশন বিবরণ:
• পণ্য: ${product.name}
• সাইজ: ${customization.size}
• রং: ${customization.color}
• প্রিন্ট এরিয়া: ${customization.printArea}
• কাস্টম টেক্সট: ${customization.customText || "নেই"}
• বিশেষ নির্দেশনা: ${customization.specialInstructions || "নেই"}
• পরিমাণ: ${customization.quantity}
• মূল্য: ${formatPrice(parseFloat((product?.price || 0).toString()) * customization.quantity)}
    `;

    window.open(createWhatsAppUrl(customDetails.trim()), '_blank');
  };

  const totalPrice = parseFloat((product?.price || 0).toString()) * customization.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 flex flex-col [&>button]:hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {product?.name || "প্রোডাক্ট"} কাস্টমাইজ করুন
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              পণ্যটি আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Product Preview */}
          <div className="space-y-6">
            <div className="relative">
              <img 
                src={product.image_url || '/placeholder-product.jpg'} 
                alt={product.name}
                className="w-full h-72 lg:h-80 object-cover rounded-xl shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product?.name || "প্রোডাক্ট"}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-600">মোট দাম:</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">পরিমাণ: {customization.quantity}টি</p>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-6 lg:overflow-y-auto lg:max-h-[600px] lg:pr-2">
            {/* Size Selection */}
            <div>
              <Label htmlFor="size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                সাইজ নির্বাচন করুন *
              </Label>
              <Select value={customization.size} onValueChange={(value) => 
                setCustomization(prev => ({ ...prev, size: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="সাইজ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {options.sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div>
              <Label htmlFor="color" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                রং নির্বাচন করুন *
              </Label>
              <Select value={customization.color} onValueChange={(value) => 
                setCustomization(prev => ({ ...prev, color: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="রং নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {options.colors.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Print Area */}
            <div>
              <Label htmlFor="printArea" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                প্রিন্ট এরিয়া
              </Label>
              <Select value={customization.printArea} onValueChange={(value) => 
                setCustomization(prev => ({ ...prev, printArea: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="প্রিন্ট এরিয়া নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {options.printAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Text */}
            <div>
              <Label htmlFor="customText" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                কাস্টম টেক্সট
              </Label>
              <Textarea
                id="customText"
                placeholder="আপনার পছন্দের টেক্সট লিখুন..."
                value={customization.customText}
                onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                কাস্টম ইমেজ আপলোড
              </Label>
              <div className="mt-1 flex items-center space-x-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>ছবি আপলোড করুন</span>
                </Button>
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                      onClick={() => {
                        setImagePreview(null);
                        setCustomization(prev => ({ ...prev, customImage: null }));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                পরিমাণ
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomization(prev => ({ 
                    ...prev, 
                    quantity: Math.max(1, prev.quantity - 1) 
                  }))}
                >
                  -
                </Button>
                <span className="px-4 py-2 border rounded text-center min-w-[60px]">
                  {customization.quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomization(prev => ({ 
                    ...prev, 
                    quantity: prev.quantity + 1 
                  }))}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="specialInstructions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                বিশেষ নির্দেশনা
              </Label>
              <Textarea
                id="specialInstructions"
                placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                value={customization.specialInstructions}
                onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t bg-white p-6 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              কার্টে যোগ করুন
            </Button>
            <Button
              onClick={() => {
                handleAddToCart().then(() => {
                  // Navigate to checkout after adding to cart
                  window.location.href = '/checkout';
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              সরাসরি অর্ডার ({formatPrice(totalPrice)})
            </Button>
            <Button
              onClick={handleWhatsAppOrder}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp অর্ডার
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
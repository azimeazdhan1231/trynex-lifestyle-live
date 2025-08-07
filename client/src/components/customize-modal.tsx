import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface ProductVariant {
  id: string;
  name: string;
  basePrice: number;
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

  const getProductType = (productName: string): keyof typeof CUSTOMIZATION_OPTIONS => {
    const name = productName.toLowerCase();
    if (name.includes("t-shirt") || name.includes("tshirt") || name.includes("shirt")) return "T-Shirts";
    if (name.includes("mug")) return "Mugs";
    if (name.includes("bottle") || name.includes("tumbler")) return "Water Bottles";
    if (name.includes("keychain") || name.includes("key")) return "Keychains";
    return "T-Shirts"; // Default
  };

  // Support product variants from same page
  const currentProductName = productVariant || product.name;
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
• মূল্য: ${formatPrice(parseFloat(product.price.toString()) * customization.quantity)}
    `;

    window.open(createWhatsAppUrl(customDetails.trim()), '_blank');
  };

  const totalPrice = parseFloat(product.price.toString()) * customization.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Preview */}
          <div className="space-y-4">
            <img 
              src={product.image_url || '/placeholder-product.jpg'} 
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                কার্টে যোগ করুন
              </Button>
              <Button
                onClick={handleWhatsAppOrder}
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp অর্ডার
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
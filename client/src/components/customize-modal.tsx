
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ShoppingCart, MessageCircle, Palette, Type, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: any) => void;
}

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

export default function CustomizeModal({ product, isOpen, onClose, onAddToCart }: CustomizeModalProps) {
  const [customization, setCustomization] = useState({
    size: "",
    color: "",
    printArea: "",
    customText: "",
    customImage: null as File | null,
    specialInstructions: "",
    quantity: 1
  });

  const { toast } = useToast();

  if (!product) return null;

  const getProductType = (productName: string): keyof typeof CUSTOMIZATION_OPTIONS => {
    const name = productName.toLowerCase();
    if (name.includes("t-shirt") || name.includes("tshirt") || name.includes("shirt")) return "T-Shirts";
    if (name.includes("mug")) return "Mugs";
    if (name.includes("bottle") || name.includes("tumbler")) return "Water Bottles";
    if (name.includes("keychain") || name.includes("key")) return "Keychains";
    return "T-Shirts"; // Default
  };

  const productType = getProductType(product.name);
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
    }
  };

  const handleAddToCart = () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    onAddToCart(product, customization);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Palette className="w-6 h-6 text-primary" />
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Preview */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2">
                  <h4 className="font-semibold">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                    <Badge>স্টক: {product.stock}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization Preview */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-3">আপনার কাস্টমাইজেশন</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>সাইজ:</span>
                    <span className="font-medium">{customization.size || "নির্বাচন করুন"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>রং:</span>
                    <span className="font-medium">{customization.color || "নির্বাচন করুন"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>প্রিন্ট এরিয়া:</span>
                    <span className="font-medium">{customization.printArea || "নির্বাচন করুন"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>পরিমাণ:</span>
                    <span className="font-medium">{customization.quantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-base">
                      <span>মোট:</span>
                      <span className="text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            {/* Basic Options */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">সাইজ নির্বাচন করুন *</Label>
                <Select value={customization.size} onValueChange={(value) => setCustomization(prev => ({ ...prev, size: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="সাইজ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">রং নির্বাচন করুন *</Label>
                <Select value={customization.color} onValueChange={(value) => setCustomization(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="রং নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.colors.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">প্রিন্ট এরিয়া</Label>
                <Select value={customization.printArea} onValueChange={(value) => setCustomization(prev => ({ ...prev, printArea: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="প্রিন্ট এরিয়া নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.printAreas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-base font-semibold">পরিমাণ</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomization(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    className="w-10 h-10 p-0"
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold min-w-[3rem] text-center">
                    {customization.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomization(prev => ({ ...prev, quantity: Math.min(product.stock, prev.quantity + 1) }))}
                    className="w-10 h-10 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Custom Text */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <Type className="w-4 h-4" />
                কাস্টম টেক্সট
              </Label>
              <Input
                value={customization.customText}
                onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                placeholder="আপনার নাম, বার্তা বা যেকোনো টেক্সট লিখুন"
                className="mt-2"
              />
            </div>

            {/* Custom Image */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                কাস্টম ছবি আপলোড
              </Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-2"
                />
                {customization.customImage && (
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {customization.customImage.name}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCustomization(prev => ({ ...prev, customImage: null }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">সর্বোচ্চ ৫MB, JPG/PNG ফরম্যাট</p>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label className="text-base font-semibold">বিশেষ নির্দেশনা</Label>
              <Textarea
                value={customization.specialInstructions}
                onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="আপনার যেকোনো বিশেষ চাহিদা বা নির্দেশনা লিখুন"
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t">
              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
                disabled={!customization.size || !customization.color}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                কার্টে যোগ করুন ({formatPrice(totalPrice)})
              </Button>
              <Button
                onClick={handleWhatsAppOrder}
                variant="outline"
                className="w-full bg-green-500 text-white hover:bg-green-600 border-green-500"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                হোয়াটসঅ্যাপে কাস্টম অর্ডার
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

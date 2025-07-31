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
  onAddToCart: (product: Product, customization: any) => Promise<void>;
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
    instructions: "",
    specialInstructions: "",
    quantity: 1,
    urgency: "normal",
    deliveryPreference: "standard",
    additionalRequests: ""
  });

  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    // Clean up customization data - remove empty values
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

    // Remove empty fields to avoid confusion
    Object.keys(customizationData).forEach(key => {
      const value = customizationData[key as keyof typeof customizationData];
      if (value === "" || value === null || value === undefined) {
        delete customizationData[key as keyof typeof customizationData];
      }
    });

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomization(prev => ({ ...prev, customImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setCustomization(prev => ({ ...prev, customImage: null }));
            setImagePreview(null);
        }
    };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Palette className="w-6 h-6 text-primary" />
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">সাইজ</Label>
                  <Select value={customization.size} onValueChange={(value) => 
                    setCustomization({...customization, size: value})
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="সাইজ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                      <SelectItem value="XXXL">XXXL</SelectItem>
                      <SelectItem value="custom">কাস্টম সাইজ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">রঙ</Label>
                  <Select value={customization.color} onValueChange={(value) => 
                    setCustomization({...customization, color: value})
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="রঙ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">লাল</SelectItem>
                      <SelectItem value="blue">নীল</SelectItem>
                      <SelectItem value="green">সবুজ</SelectItem>
                      <SelectItem value="black">কালো</SelectItem>
                      <SelectItem value="white">সাদা</SelectItem>
                      <SelectItem value="yellow">হলুদ</SelectItem>
                      <SelectItem value="pink">গোলাপী</SelectItem>
                      <SelectItem value="purple">বেগুনী</SelectItem>
                      <SelectItem value="orange">কমলা</SelectItem>
                      <SelectItem value="gray">ধূসর</SelectItem>
                      <SelectItem value="custom">কাস্টম রঙ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="urgency" className="text-base font-semibold">জরুরী প্রয়োজন</Label>
                  <Select value={customization.urgency} onValueChange={(value) => 
                    setCustomization({...customization, urgency: value})
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="জরুরীতা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">সাধারণ</SelectItem>
                      <SelectItem value="urgent">জরুরী (২-৩ দিন)</SelectItem>
                      <SelectItem value="express">অতি জরুরী (১-২ দিন)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            </div>

            {/* Custom Text */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <Type className="w-4 h-4" />
                কাস্টম টেক্সট / ডিজাইন
              </Label>
              <Input
                value={customization.customText}
                onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                placeholder="আপনার পছন্দের টেক্সট বা ডিজাইনের বর্ণনা লিখুন"
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
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">প্রিভিউ:</p>
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                  </div>
                )}
                <p className="text-xs text-gray-500">সর্বোচ্চ ৫MB, JPG/PNG ফরম্যাট</p>
              </div>
            </div>

            <div>
                <Label htmlFor="deliveryPreference" className="text-base font-semibold">ডেলিভারি পছন্দ</Label>
                <Select value={customization.deliveryPreference} onValueChange={(value) => 
                  setCustomization({...customization, deliveryPreference: value})
                }>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="ডেলিভারি পছন্দ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">স্ট্যান্ডার্ড (৫-৭ দিন)</SelectItem>
                    <SelectItem value="fast">দ্রুত (৩-৪ দিন)</SelectItem>
                    <SelectItem value="express">এক্সপ্রেস (১-২ দিন)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            {/* Special Instructions */}
            <div>
              <Label className="text-base font-semibold">বিশেষ নির্দেশনা</Label>
              <Textarea
                value={customization.specialInstructions}
                onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="অতিরিক্ত নির্দেশনা, পছন্দের রঙের কোড, মাপের বিস্তারিত, ডিজাইনের বিশেষত্ব ইত্যাদি লিখুন..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="additionalRequests" className="text-base font-semibold">অতিরিক্ত অনুরোধ</Label>
              <Textarea
                id="additionalRequests"
                value={customization.additionalRequests}
                onChange={(e) => setCustomization({...customization, additionalRequests: e.target.value})}
                placeholder="প্যাকেজিং, গিফট র‍্যাপিং, বিশেষ কোনো অনুরোধ থাকলে লিখুন..."
                className="min-h-[80px] mt-2"
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
import React, { useState } from "react";
import { X, ShoppingCart, MessageCircle, Plus, Minus, Upload, Palette, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
}

interface CustomizationState {
  size: string;
  color: string;
  printArea: string;
  customText: string;
  quantity: number;
  specialInstructions: string;
  uploadedImages: File[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["সাদা", "কালো", "লাল", "নীল", "সবুজ", "হলুদ", "গোলাপী", "বেগুনী"];
const PRINT_AREAS = ["সামনে", "পেছনে", "উভয় পাশে", "হাতায়", "কাস্টম"];

export default function CustomizeModalRedesigned({ isOpen, onClose, product, onAddToCart }: CustomizeModalProps) {
  const { toast } = useToast();
  
  const [customization, setCustomization] = useState<CustomizationState>({
    size: "M",
    color: "সাদা",
    printArea: "সামনে",
    customText: "",
    quantity: 1,
    specialInstructions: "",
    uploadedImages: []
  });

  const totalPrice = parseFloat((product?.price || 0).toString()) * customization.quantity;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCustomization(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...files].slice(0, 3) // Max 3 images
    }));
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  const handleAddToCart = async () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive"
      });
      return;
    }

    const customizationData = {
      ...customization,
      imageUrls: customization.uploadedImages.map(file => URL.createObjectURL(file))
    };

    await onAddToCart(product, customizationData);
    toast({
      title: "সফল!",
      description: `${product.name} কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
    });
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const orderDetails = `
🎨 কাস্টম অর্ডার:
📦 পণ্য: ${product.name}
👕 সাইজ: ${customization.size}
🎨 রং: ${customization.color}
📍 প্রিন্ট: ${customization.printArea}
✏️ টেক্সট: ${customization.customText || "নেই"}
📝 নির্দেশনা: ${customization.specialInstructions || "নেই"}
📊 পরিমাণ: ${customization.quantity}টি
💰 মূল্য: ${formatPrice(totalPrice)}
${customization.uploadedImages.length > 0 ? `📸 ছবি: ${customization.uploadedImages.length}টি আপলোড করা হয়েছে` : ""}
    `.trim();

    window.open(createWhatsAppUrl(orderDetails), '_blank');
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-none h-[98vh] max-h-none p-0 overflow-hidden flex flex-col md:w-[90vw] md:h-[90vh] lg:w-[85vw] xl:w-[80vw] 2xl:w-[75vw] [&>button]:hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-green-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Palette className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {product.name} কাস্টমাইজ করুন
              </h2>
              <p className="text-sm text-gray-600">
                আপনার পছন্দমত ডিজাইন করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 md:p-6">
            
            {/* Product Preview - Takes 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative group">
                <img
                  src={product.image_url || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl" />
                <Badge className="absolute top-3 left-3 bg-green-600">
                  কাস্টমাইজেবল
                </Badge>
              </div>
              
              {/* Price Display */}
              <div className="bg-gradient-to-r from-green-50 to-orange-50 p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">মোট মূল্য</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {customization.quantity}টি × {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {customization.uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">আপলোডকৃত ছবি</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {customization.uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customization Options - Takes 3 columns on large screens */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Size Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  সাইজ নির্বাচন করুন *
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setCustomization(prev => ({ ...prev, size }))}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        customization.size === size
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  রং নির্বাচন করুন *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setCustomization(prev => ({ ...prev, color }))}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        customization.color === color
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Area */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">প্রিন্ট এরিয়া</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRINT_AREAS.map(area => (
                    <button
                      key={area}
                      onClick={() => setCustomization(prev => ({ ...prev, printArea: area }))}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        customization.printArea === area
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Text */}
              <div className="space-y-2">
                <Label htmlFor="customText" className="text-sm font-medium">
                  কাস্টম টেক্সট
                </Label>
                <Input
                  id="customText"
                  placeholder="আপনার পছন্দের টেক্সট লিখুন..."
                  value={customization.customText}
                  onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                  className="h-12"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ছবি আপলোড করুন (সর্বোচ্চ ৩টি)</Label>
                <div className="relative">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={customization.uploadedImages.length >= 3}
                  />
                  <label
                    htmlFor="imageUpload"
                    className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      customization.uploadedImages.length >= 3
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                    }`}
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {customization.uploadedImages.length >= 3 
                        ? "সর্বোচ্চ ৩টি ছবি আপলোড করা যাবে" 
                        : "ছবি আপলোড করুন"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">পরিমাণ</Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    className="p-2 border rounded-lg hover:bg-gray-50"
                    disabled={customization.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-center min-w-[60px] px-4 py-2 border rounded-lg bg-gray-50">
                    {customization.quantity}
                  </div>
                  <button
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                    className="p-2 border rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-medium">
                  বিশেষ নির্দেশনা
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                  value={customization.specialInstructions}
                  onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-white p-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-12"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              কার্টে যোগ করুন ({formatPrice(totalPrice)})
            </Button>
            <Button
              onClick={handleWhatsAppOrder}
              variant="outline"
              className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 h-12"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp অর্ডার
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
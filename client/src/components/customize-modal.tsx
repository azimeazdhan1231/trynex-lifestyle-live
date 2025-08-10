import { useState, useRef } from "react";
import UnifiedModalBase from "./unified-modal-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Upload, 
  X, 
  Plus, 
  Minus, 
  MessageCircle, 
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { value: 'white', label: 'সাদা', color: '#ffffff' },
  { value: 'black', label: 'কালো', color: '#000000' },
  { value: 'red', label: 'লাল', color: '#ef4444' },
  { value: 'blue', label: 'নীল', color: '#3b82f6' },
  { value: 'green', label: 'সবুজ', color: '#10b981' },
  { value: 'yellow', label: 'হলুদ', color: '#f59e0b' }
];

const formatPrice = (price: number): string => {
  return `৳${price.toFixed(0)}`;
};

export default function CustomizeModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart
}: CustomizeModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customization, setCustomization] = useState({
    size: '',
    color: '',
    quantity: 1,
    customText: '',
    specialInstructions: '',
    customImage: null as File | null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!product) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ফাইল খুব বড়",
          description: "৫MB এর কম সাইজের ছবি আপলোড করুন",
          variant: "destructive",
        });
        return;
      }

      setCustomization(prev => ({ ...prev, customImage: file }));

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
        description: "সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddToCart(product, customization);
      toast({
        title: "কার্টে যোগ হয়েছে!",
        description: `${product.name} কার্টে যোগ করা হয়েছে`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `🛍️ অর্ডার: ${product.name}\n💰 দাম: ${formatPrice(Number(product.price))}\n📏 সাইজ: ${customization.size}\n🎨 রং: ${customization.color}\n🔢 পরিমাণ: ${customization.quantity}\n\nঅর্ডার করতে চাই!`;
    window.open(`https://wa.me/8801700000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  const totalPrice = Number(product.price) * customization.quantity;

  return (
    <UnifiedModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`${product.name} কাস্টমাইজ করুন`}
      description="আপনার পছন্দ অনুযায়ী ডিজাইন করুন"
      size="xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Image & Info */}
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={product.image_url || '/placeholder.jpg'} 
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-xl border"
                />
                <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                  কাস্টমাইজেশন
                </Badge>
              </div>

              <Card className="p-4 bg-gray-50">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">মোট দাম:</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">পরিমাণ:</p>
                      <p className="text-lg font-semibold">{customization.quantity}টি</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  সাইজ নির্বাচন করুন *
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={customization.size === size ? "default" : "outline"}
                      onClick={() => setCustomization(prev => ({ ...prev, size }))}
                      className="h-12 font-medium"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  রং নির্বাচন করুন *
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {COLORS.map((color) => (
                    <Button
                      key={color.value}
                      variant={customization.color === color.value ? "default" : "outline"}
                      onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                      className="h-12 flex items-center gap-2 font-medium"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.color }}
                      />
                      {color.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Text */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-2 block">
                  কাস্টম টেক্সট
                </Label>
                <Textarea
                  placeholder="আপনার পছন্দের টেক্সট লিখুন..."
                  value={customization.customText}
                  onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-2 block">
                  ছবি আপলোড করুন (ঐচ্ছিক)
                </Label>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-12 border-dashed"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    ছবি আপলোড করুন
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded border" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 w-6 h-6 p-0"
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
                <Label className="text-base font-medium text-gray-700 mb-2 block">
                  পরিমাণ
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    disabled={customization.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {customization.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-2 block">
                  বিশেষ নির্দেশনা
                </Label>
                <Textarea
                  placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                  value={customization.specialInstructions}
                  onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t bg-white p-6 -m-3 sm:-m-4 lg:-m-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !customization.size || !customization.color}
              className="bg-green-600 hover:bg-green-700 text-white h-12 font-medium"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isLoading ? "যোগ করা হচ্ছে..." : `কার্টে যোগ করুন (${formatPrice(totalPrice)})`}
            </Button>

            <Button
              onClick={handleWhatsAppOrder}
              disabled={isLoading || !customization.size || !customization.color}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 h-12 font-medium"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp অর্ডার
            </Button>
          </div>
        </div>
      </div>
    </UnifiedModalBase>
  );
}
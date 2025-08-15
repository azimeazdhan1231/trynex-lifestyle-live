import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Palette, 
  MessageCircle, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Heart
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ImprovedCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ImprovedCustomizeModal({
  isOpen,
  onClose,
  product,
  onAddToCart
}: ImprovedCustomizeModalProps) {
  const [customization, setCustomization] = useState({
    text: "",
    color: "#FF6B35",
    size: "",
    material: "",
    specialInstructions: "",
    referenceImage: null as File | null,
    quantity: 1
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  const productPrice = parseFloat(product.price) || 0;
  const customizationFee = productPrice * 0.15; // 15% customization fee
  const totalPrice = productPrice + customizationFee;

  const handleInputChange = (field: string, value: string | number) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ফাইল খুব বড়",
          description: "অনুগ্রহ করে 5MB এর কম ফাইল আপলোড করুন।",
          variant: "destructive",
        });
        return;
      }
      
      setCustomization(prev => ({
        ...prev,
        referenceImage: file
      }));
      
      toast({
        title: "ছবি আপলোড হয়েছে!",
        description: "রেফারেন্স ছবি সফলভাবে আপলোড হয়েছে।",
      });
    }
  };

  const handleSubmit = async () => {
    if (!customization.text && !customization.referenceImage) {
      toast({
        title: "কাস্টমাইজেশন প্রয়োজন",
        description: "অনুগ্রহ করে টেক্সট বা রেফারেন্স ছবি যোগ করুন।",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "কাস্টমাইজেশন অর্ডার সফল!",
        description: "আপনার কাস্টমাইজেশন অর্ডার গ্রহণ করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।",
      });

      // Close modal after success
      setTimeout(() => {
        onClose();
        setCustomization({
          text: "",
          color: "#FF6B35",
          size: "",
          material: "",
          specialInstructions: "",
          referenceImage: null,
          quantity: 1
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: "কাস্টমাইজেশন অর্ডার করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      toast({
        title: "পণ্য যোগ করা হয়েছে!",
        description: `${product.name} কার্টে যোগ করা হয়েছে।`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                কাস্টমাইজ করুন
              </DialogTitle>
              <p className="text-sm text-gray-600">
                আপনার স্বপ্নের ডিজাইন তৈরি করুন
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 pt-0 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Product Info */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Palette className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-lg font-bold text-orange-600">
                        {formatPrice(productPrice)}
                      </span>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        বেস প্রাইস
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>কাস্টমাইজেশন অপশন</span>
              </h3>

              {/* Text Customization */}
              <div className="space-y-2">
                <Label htmlFor="custom-text" className="text-sm font-medium text-gray-700">
                  কাস্টম টেক্সট
                </Label>
                <Input
                  id="custom-text"
                  placeholder="আপনার কাস্টম টেক্সট লিখুন..."
                  value={customization.text}
                  onChange={(e) => handleInputChange("text", e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-gray-500">
                  সর্বোচ্চ 50 অক্ষর পর্যন্ত টেক্সট যোগ করতে পারবেন
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  রঙ নির্বাচন
                </Label>
                <div className="flex space-x-2">
                  {["#FF6B35", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleInputChange("color", color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        customization.color === color 
                          ? 'border-gray-800 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Size and Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-sm font-medium text-gray-700">
                    সাইজ
                  </Label>
                  <Input
                    id="size"
                    placeholder="সাইজ (ঐচ্ছিক)"
                    value={customization.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material" className="text-sm font-medium text-gray-700">
                    উপাদান
                  </Label>
                  <Input
                    id="material"
                    placeholder="উপাদান (ঐচ্ছিক)"
                    value={customization.material}
                    onChange={(e) => handleInputChange("material", e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Reference Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  রেফারেন্স ছবি
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="reference-image"
                  />
                  <label htmlFor="reference-image" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-orange-600 font-medium">ক্লিক করুন</span> অথবা ছবি টেনে আনুন
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF সর্বোচ্চ 5MB
                    </p>
                  </label>
                </div>
                {customization.referenceImage && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>{customization.referenceImage.name} আপলোড হয়েছে</span>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                  বিশেষ নির্দেশনা
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="আপনার বিশেষ প্রয়োজনীয়তা বা নির্দেশনা লিখুন..."
                  value={customization.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  পরিমাণ
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={customization.quantity}
                  onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                  className="h-10 w-24"
                />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">মূল্য বিবরণ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>বেস প্রাইস:</span>
                  <span>{formatPrice(productPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>কাস্টমাইজেশন ফি (15%):</span>
                  <span>{formatPrice(customizationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>পরিমাণ:</span>
                  <span>{customization.quantity} টি</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-orange-600">
                  <span>মোট মূল্য:</span>
                  <span>{formatPrice(totalPrice * customization.quantity)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার করা হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>কাস্টমাইজেশন অর্ডার করুন</span>
                  </div>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleAddToCart}
                  className="h-12"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  কার্টে যোগ করুন
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-12"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  পরামর্শ নিন
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">কাস্টমাইজেশন প্রক্রিয়া:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• আপনার অর্ডার গ্রহণ করার পর আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব</li>
                    <li>• কাস্টমাইজেশন সম্পূর্ণ হতে ৩-৭ কার্যদিবস সময় লাগতে পারে</li>
                    <li>• ডেলিভারি আগে ফাইনাল অ্যাপ্রুভাল নেওয়া হবে</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
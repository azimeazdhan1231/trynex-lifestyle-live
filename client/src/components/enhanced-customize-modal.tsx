import React, { useState } from "react";
import { X, ShoppingCart, MessageCircle, Plus, Minus, Upload, Palette, Shirt, CreditCard, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DynamicResponsiveModal from "./dynamic-responsive-modal";
import type { Product } from "@shared/schema";

interface EnhancedCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onOrderComplete?: () => void;
}

interface CustomizationState {
  size: string;
  color: string;
  printArea: string;
  customText: string;
  quantity: number;
  specialInstructions: string;
  uploadedImages: File[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "সাদা", value: "white", color: "#ffffff" },
  { name: "কালো", value: "black", color: "#000000" },
  { name: "লাল", value: "red", color: "#ef4444" },
  { name: "নীল", value: "blue", color: "#3b82f6" },
  { name: "সবুজ", value: "green", color: "#22c55e" },
  { name: "হলুদ", value: "yellow", color: "#eab308" },
  { name: "গোলাপী", value: "pink", color: "#ec4899" },
  { name: "বেগুনী", value: "purple", color: "#a855f7" },
];
const PRINT_AREAS = ["সামনে", "পেছনে", "উভয় পাশে", "হাতায়", "কাস্টম"];

export default function EnhancedCustomizeModal({ 
  isOpen, 
  onClose, 
  product, 
  onOrderComplete 
}: EnhancedCustomizeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customization, setCustomization] = useState<CustomizationState>({
    size: "M",
    color: "white",
    printArea: "সামনে",
    customText: "",
    quantity: 1,
    specialInstructions: "",
    uploadedImages: [],
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: ""
  });

  const basePrice = product ? parseFloat((product.price || 0).toString()) : 0;
  const customizationFee = 50; // Additional customization fee
  const totalPrice = (basePrice + customizationFee) * customization.quantity;
  const advancePayment = 100; // Fixed 100tk advance payment

  if (!product) {
    return null; // Don't render if no product
  }

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

  const validateStep1 = () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!customization.customerName.trim() || !customization.customerPhone.trim()) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে নাম এবং ফোন নম্বর দিন",
        variant: "destructive"
      });
      return false;
    }
    if (customization.customerPhone.length < 11) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক ফোন নম্বর দিন",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    
    try {
      const orderData = {
        productId: product.id,
        customerName: customization.customerName,
        customerPhone: customization.customerPhone,
        customerEmail: customization.customerEmail || null,
        customerAddress: customization.customerAddress || null,
        customizationData: {
          size: customization.size,
          color: customization.color,
          printArea: customization.printArea,
          customText: customization.customText,
          specialInstructions: customization.specialInstructions,
          uploadedImages: customization.uploadedImages.map(file => file.name)
        },
        totalPrice: totalPrice.toString(),
        status: "pending_advance_payment"
      };

      const result = await apiRequest('POST', '/api/custom-orders', orderData);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/custom-orders'] });

      toast({
        title: "অর্ডার সফল!",
        description: `আপনার কাস্টম অর্ডার গৃহীত হয়েছে। অর্ডার আইডি: ${result.id}`,
      });

      // Create WhatsApp message for advance payment
      const whatsappMessage = `আসসালামু আলাইকুম! আমি একটি কাস্টম অর্ডার দিয়েছি।

📋 অর্ডার তথ্য:
পণ্য: ${product.name}
সাইজ: ${customization.size}
রং: ${COLORS.find(c => c.value === customization.color)?.name}
পরিমাণ: ${customization.quantity}
মোট দাম: ৳${totalPrice}
অ্যাডভান্স: ৳${advancePayment}

👤 গ্রাহক তথ্য:
নাম: ${customization.customerName}
ফোন: ${customization.customerPhone}
${customization.customerEmail ? `ইমেইল: ${customization.customerEmail}` : ''}

📝 কাস্টমাইজেশন:
প্রিন্ট এলাকা: ${customization.printArea}
${customization.customText ? `টেক্সট: ${customization.customText}` : ''}
${customization.specialInstructions ? `বিশেষ নির্দেশনা: ${customization.specialInstructions}` : ''}

অর্ডার আইডি: ${result.id}

দয়া করে ১০০ টাকা অ্যাডভান্স পেমেন্ট করে অর্ডার কনফার্ম করুন।`;

      // Open WhatsApp with the message
      const whatsappUrl = createWhatsAppUrl(whatsappMessage);
      window.open(whatsappUrl, '_blank');

      onClose();
      if (onOrderComplete) onOrderComplete();

    } catch (error: any) {
      console.error('Error creating custom order:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Product Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">পণ্য প্রিভিউ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">বেস প্রাইস: ৳{basePrice}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">কাস্টমাইজেশন ফি: ৳{customizationFee}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          <Shirt className="w-4 h-4 inline mr-2" />
          সাইজ নির্বাচন করুন
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={customization.size === size ? "default" : "outline"}
              size="sm"
              onClick={() => setCustomization(prev => ({ ...prev, size }))}
              className={customization.size === size ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          <Palette className="w-4 h-4 inline mr-2" />
          রং নির্বাচন করুন
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              size="sm"
              onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
              className={`flex items-center gap-2 ${
                customization.color === color.value 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.color }}
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">{color.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Print Area */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">প্রিন্ট এলাকা</Label>
        <Select value={customization.printArea} onValueChange={(value) => 
          setCustomization(prev => ({ ...prev, printArea: value }))
        }>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="প্রিন্ট এলাকা নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {PRINT_AREAS.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Text */}
      <div className="space-y-3">
        <Label htmlFor="customText" className="text-sm font-medium text-gray-900 dark:text-white">
          কাস্টম টেক্সট (ঐচ্ছিক)
        </Label>
        <Textarea
          id="customText"
          placeholder="আপনার পছন্দের টেক্সট লিখুন..."
          value={customization.customText}
          onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
          className="min-h-[80px]"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          <Upload className="w-4 h-4 inline mr-2" />
          ইমেজ আপলোড (সর্বোচ্চ ৩টি)
        </Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-500 dark:text-gray-400"
          />
          {customization.uploadedImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {customization.uploadedImages.map((file, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {file.name}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeImage(index)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">পরিমাণ</Label>
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
          <span className="font-semibold text-lg min-w-[3rem] text-center text-gray-900 dark:text-white">
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5" />
            যোগাযোগের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium text-gray-900 dark:text-white">
              নাম *
            </Label>
            <Input
              id="customerName"
              placeholder="আপনার নাম লিখুন"
              value={customization.customerName}
              onChange={(e) => setCustomization(prev => ({ ...prev, customerName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-900 dark:text-white">
              ফোন নম্বর *
            </Label>
            <Input
              id="customerPhone"
              placeholder="01XXXXXXXXX"
              value={customization.customerPhone}
              onChange={(e) => setCustomization(prev => ({ ...prev, customerPhone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-900 dark:text-white">
              ইমেইল (ঐচ্ছিক)
            </Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="example@email.com"
              value={customization.customerEmail}
              onChange={(e) => setCustomization(prev => ({ ...prev, customerEmail: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress" className="text-sm font-medium text-gray-900 dark:text-white">
              ঠিকানা (ঐচ্ছিক)
            </Label>
            <Textarea
              id="customerAddress"
              placeholder="আপনার ঠিকানা লিখুন..."
              value={customization.customerAddress}
              onChange={(e) => setCustomization(prev => ({ ...prev, customerAddress: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Label htmlFor="specialInstructions" className="text-sm font-medium text-gray-900 dark:text-white">
          বিশেষ নির্দেশনা (ঐচ্ছিক)
        </Label>
        <Textarea
          id="specialInstructions"
          placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
          value={customization.specialInstructions}
          onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            অর্ডার সারাংশ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">পণ্য:</span>
              <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">সাইজ:</span>
              <span className="font-medium text-gray-900 dark:text-white">{customization.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">রং:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {COLORS.find(c => c.value === customization.color)?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">পরিমাণ:</span>
              <span className="font-medium text-gray-900 dark:text-white">{customization.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">বেস প্রাইস:</span>
              <span className="font-medium text-gray-900 dark:text-white">৳{basePrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">কাস্টমাইজেশন ফি:</span>
              <span className="font-medium text-gray-900 dark:text-white">৳{customizationFee}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900 dark:text-white">মোট দাম:</span>
                <span className="text-green-600">৳{totalPrice}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            অ্যাডভান্স পেমেন্ট
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-700 dark:text-yellow-300">এখনই দিতে হবে:</span>
              <span className="font-bold text-2xl text-yellow-800 dark:text-yellow-200">৳{advancePayment}</span>
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              <p>• প্রোডাকশন শুরু করতে ১০০ টাকা অ্যাডভান্স প্রয়োজন</p>
              <p>• বাকি টাকা ডেলিভারির সময় দিতে হবে</p>
              <p>• হোয়াটসঅ্যাপে পেমেন্ট তথ্য পাঠানো হবে</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "কাস্টমাইজেশন";
      case 2: return "যোগাযোগের তথ্য";
      case 3: return "অর্ডার কনফার্ম";
      default: return "কাস্টমাইজেশন";
    }
  };

  return (
    <DynamicResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${getStepTitle()} - ${product.name}`}
      description={`ধাপ ${currentStep}/3`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step <= currentStep 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step < currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              পূর্ববর্তী
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button onClick={handleNextStep}>
              পরবর্তী
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitOrder} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  প্রসেসিং...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  অর্ডার কনফার্ম করুন
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DynamicResponsiveModal>
  );
}
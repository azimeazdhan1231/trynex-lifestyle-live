import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import DynamicResponsiveModal from "@/components/dynamic-responsive-modal";
import {
  Package,
  Shirt,
  Palette,
  Type,
  Upload,
  MessageCircle,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle
} from "lucide-react";
import type { Product } from "@shared/schema";

interface EnhancedCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart?: (product: Product, customization: any) => Promise<void>;
  onOrderComplete?: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { value: "red", name: "লাল", color: "#EF4444" },
  { value: "blue", name: "নীল", color: "#3B82F6" },
  { value: "green", name: "সবুজ", color: "#10B981" },
  { value: "black", name: "কালো", color: "#1F2937" },
  { value: "white", name: "সাদা", color: "#F9FAFB" },
  { value: "yellow", name: "হলুদ", color: "#F59E0B" },
];
const PRINT_AREAS = ["সামনে", "পেছনে", "উভয় পাশ", "হাতা"];

export default function EnhancedCustomizeModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onOrderComplete
}: EnhancedCustomizeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [customization, setCustomization] = useState({
    size: "",
    color: "",
    printArea: "",
    customText: "",
    specialInstructions: "",
    uploadedImages: [] as File[],
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: ""
  });

  const basePrice = parseFloat(product.price) || 0;
  const customizationFee = 50;
  const totalPrice = (basePrice + customizationFee) * customization.quantity;
  const advancePayment = 100;

  const validateStep1 = () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!customization.customerName || !customization.customerPhone) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "নাম এবং ফোন নম্বর প্রয়োজন",
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
      const whatsappUrl = `https://wa.me/8801765555593?text=${encodeURIComponent(whatsappMessage)}`;
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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">পণ্য প্রিভিউ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-600"
              />
            )}
            <div>
              <h3 className="font-semibold text-white">{product.name}</h3>
              <p className="text-gray-300">বেস প্রাইস: ৳{basePrice}</p>
              <p className="text-sm text-gray-400">কাস্টমাইজেশন ফি: ৳{customizationFee}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">
          <Shirt className="w-4 h-4 inline mr-2" />
          সাইজ নির্বাচন করুন *
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={customization.size === size ? "default" : "outline"}
              size="sm"
              onClick={() => setCustomization(prev => ({ ...prev, size }))}
              className={customization.size === size 
                ? "bg-blue-600 text-white" 
                : "text-white border-gray-600 hover:bg-gray-700"
              }
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">
          <Palette className="w-4 h-4 inline mr-2" />
          রং নির্বাচন করুন *
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {COLORS.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              size="sm"
              onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
              className={`h-12 border-2 text-white ${
                customization.color === color.value 
                  ? "border-blue-500 bg-blue-600/20" 
                  : "border-gray-600 hover:bg-gray-700"
              }`}
            >
              <div 
                className="w-6 h-6 rounded-full mr-2"
                style={{ backgroundColor: color.color }}
              />
              {color.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Print Area */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">প্রিন্ট এলাকা</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRINT_AREAS.map((area) => (
            <Button
              key={area}
              variant={customization.printArea === area ? "default" : "outline"}
              size="sm"
              onClick={() => setCustomization(prev => ({ ...prev, printArea: area }))}
              className={customization.printArea === area 
                ? "bg-blue-600 text-white" 
                : "text-white border-gray-600 hover:bg-gray-700"
              }
            >
              {area}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Text */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">
          <Type className="w-4 h-4 inline mr-2" />
          কাস্টম টেক্সট
        </Label>
        <Input
          value={customization.customText}
          onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="আপনার পছন্দের টেক্সট লিখুন..."
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
        />
      </div>

      {/* Special Instructions */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">বিশেষ নির্দেশনা</Label>
        <Textarea
          value={customization.specialInstructions}
          onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
          placeholder="অতিরিক্ত নির্দেশনা লিখুন..."
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            যোগাযোগের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-white">নাম *</Label>
              <Input
                value={customization.customerName}
                onChange={(e) => setCustomization(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-white">ফোন নম্বর *</Label>
              <Input
                value={customization.customerPhone}
                onChange={(e) => setCustomization(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-white">ইমেইল (ঐচ্ছিক)</Label>
            <Input
              value={customization.customerEmail}
              onChange={(e) => setCustomization(prev => ({ ...prev, customerEmail: e.target.value }))}
              placeholder="your@email.com"
              type="email"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-white">ঠিকানা *</Label>
            <Textarea
              value={customization.customerAddress}
              onChange={(e) => setCustomization(prev => ({ ...prev, customerAddress: e.target.value }))}
              placeholder="সম্পূর্ণ ঠিকানা লিখুন (বাড়ি নং, রাস্তা, থানা, জেলা)"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            অর্ডার সামারি
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-white">
              <span>পণ্যের দাম:</span>
              <span>৳{basePrice}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>কাস্টমাইজেশন ফি:</span>
              <span>৳{customizationFee}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>পরিমাণ:</span>
              <span>{customization.quantity}</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between font-bold text-lg text-white">
                <span>মোট দাম:</span>
                <span className="text-green-400">৳{totalPrice}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-yellow-600 bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            অ্যাডভান্স পেমেন্ট
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300">এখনই দিতে হবে:</span>
              <span className="font-bold text-2xl text-yellow-300">৳{advancePayment}</span>
            </div>
            <div className="text-sm text-yellow-300">
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
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6 text-white">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step <= currentStep 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-400"
                }
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step < currentStep ? "bg-blue-600" : "bg-gray-700"}
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
        <div className="flex justify-between pt-6 border-t border-gray-700">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              পূর্ববর্তী
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
              পরবর্তী
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitOrder} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
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
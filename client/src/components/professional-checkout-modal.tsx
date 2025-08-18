import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  MapPin,
  Phone,
  User,
  Package,
  Truck,
  Clock,
  ShieldCheck
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import EnhancedOrderSuccessModal from "./enhanced-order-success-modal";


interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  customization?: any;
}

interface ProfessionalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CheckoutItem[];
  totalAmount: number;
  onOrderComplete: () => void;
}

export default function ProfessionalCheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onOrderComplete
}: ProfessionalCheckoutModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'summary' | 'details' | 'success'>('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ order_id: string; tracking_id?: string } | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    upazila: '',
    deliveryType: 'standard', // standard, express
    paymentMethod: 'bkash', // bkash, nagad, cash
    specialInstructions: ''
  });

  const districts = [
    'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
    'গাজীপুর', 'নারায়ণগঞ্জ', 'কুমিল্লা', 'ফেনী', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'লক্ষ্মীপুর',
    'নোয়াখালী', 'কক্সবাজার', 'বান্দরবান', 'রাঙ্গামাটি', 'খাগড়াছড়ি'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.address || !formData.district) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique tracking ID
      const generateTrackingId = () => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
        return `TRK${timestamp}${randomStr}`;
      };

      const trackingId = generateTrackingId();

      // Create order object
      const orderPayload = {
        customer_name: formData.name,
        phone: formData.phone,
        district: formData.district,
        thana: formData.upazila || formData.district,
        address: formData.address,
        tracking_id: trackingId,
        payment_info: {
          method: formData.paymentMethod,
          type: formData.deliveryType
        },
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          customization: item.customization ? {
            customText: item.customization.customText || item.customization.text,
            specialInstructions: item.customization.specialInstructions || item.customization.instructions,
            uploadedImages: item.customization.uploadedImages || item.customization.customizationImages || item.customization.custom_images || [],
            color: item.customization.color,
            size: item.customization.size,
            font: item.customization.font
          } : null
        })),
        total: totalAmount,
        total_amount: totalAmount,
        delivery_fee: totalAmount - cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        custom_instructions: formData.specialInstructions
      };

      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const result = await response.json();
        const successOrderData = {
          tracking_id: trackingId,
          customer_name: formData.name,
          phone: formData.phone,
          total_amount: totalAmount,
          items: cartItems,
          address: formData.address,
          district: formData.district,
          thana: formData.upazila || formData.district,
          payment_info: {
            method: formData.paymentMethod,
            type: formData.deliveryType
          },
          estimated_delivery: "৩-৫ কার্যদিবস"
        };
        setOrderData(successOrderData);
        setOrderResult({
          order_id: result.order_id || result.id || trackingId,
          tracking_id: trackingId
        });
        setCurrentStep('success');
        toast({
          title: "অর্ডার সফল হয়েছে",
          description: `আপনার অর্ডার আইডি: ${result.order_id || result.id || trackingId}`,
        });
      } else {
        throw new Error('Order submission failed');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "অর্ডার ব্যর্থ হয়েছে",
        description: "দয়া করে আবার চেষ্টা করুন বা হোয়াটসঅ্যাপে যোগাযোগ করুন",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setCurrentStep('summary');
    setOrderResult(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      district: '',
      upazila: '',
      deliveryType: 'standard',
      paymentMethod: 'bkash',
      specialInstructions: ''
    });
    onClose();
  };

  // Step 1: Order Summary
  if (currentStep === 'summary') {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-[95vw] max-w-3xl h-[90vh] max-h-[900px] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b p-4">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              অর্ডার সারাংশ
            </DialogTitle>
            <DialogDescription>
              আপনার অর্ডারের বিস্তারিত দেখুন এবং এগিয়ে যান
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4" />
                পণ্যসমূহ ({cartItems.length}টি)
              </h3>

              {cartItems.map((item, index) => (
                <Card key={item.id || index} className="border border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">পণ্যের মূল্য:</span>
                <span className="font-medium">
                  {formatPrice(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  ডেলিভারি চার্জ:
                </span>
                <span className="font-medium">
                  {formatPrice(totalAmount - cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">সর্বমোট:</span>
                <span className="text-green-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm">ডেলিভারি সময়</span>
                </div>
                <p className="text-xs text-blue-700">
                  ঢাকার ভিতরে: ১-২ দিন | ঢাকার বাইরে: ৩-৫ দিন
                </p>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              onClick={() => setCurrentStep('details')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3"
            >
              তথ্য দিয়ে এগিয়ে যান
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Customer Details
  if (currentStep === 'details') {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[950px] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b p-4">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                ডেলিভারি ও পেমেন্ট তথ্য
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('summary')}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              অর্ডার সম্পূর্ণ করতে আপনার তথ্য দিন
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                ব্যক্তিগত তথ্য
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    নাম <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    ফোন নম্বর <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="০১xxxxxxxxx"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  ইমেইল (ঐচ্ছিক)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="h-11"
                />
              </div>
            </div>

            <Separator />

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                ডেলিভারি ঠিকানা
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="বাড়ি/ফ্ল্যাট নং, রোড নং, এলাকার নাম"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium">
                    জেলা <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upazila" className="text-sm font-medium">
                    উপজেলা (ঐচ্ছিক)
                  </Label>
                  <Input
                    id="upazila"
                    value={formData.upazila}
                    onChange={(e) => handleInputChange('upazila', e.target.value)}
                    placeholder="উপজেলার নাম"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                পেমেন্ট পদ্ধতি
              </h3>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="bkash" id="bkash" />
                  <Label htmlFor="bkash" className="flex-1 cursor-pointer">
                    <div className="font-medium text-pink-600">বিকাশ</div>
                    <div className="text-xs text-gray-600">মোবাইল ব্যাংকিং</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="nagad" id="nagad" />
                  <Label htmlFor="nagad" className="flex-1 cursor-pointer">
                    <div className="font-medium text-orange-600">নগদ</div>
                    <div className="text-xs text-gray-600">মোবাইল ব্যাংকিং</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div className="font-medium text-green-600">ক্যাশ অন ডেলিভারি</div>
                    <div className="text-xs text-gray-600">পণ্য পেয়ে টাকা দিন</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Special Instructions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">বিশেষ নির্দেশনা (ঐচ্ছিক)</h3>
              <Textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-green-800">মোট প্রদেয় অর্থ:</span>
                  <span className="text-xl font-bold text-green-600">{formatPrice(totalAmount)}</span>
                </div>
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      অর্ডার করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      অর্ডার সম্পন্ন করুন
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 3: Success
  return (
    <EnhancedOrderSuccessModal
      isOpen={isOpen}
      orderData={orderData}
      onClose={() => {
        onOrderComplete();
        handleCloseModal();
      }}
    />
  );
}
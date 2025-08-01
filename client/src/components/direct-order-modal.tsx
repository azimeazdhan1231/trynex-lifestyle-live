import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  ArrowRight,
  Package,
  EyeOff,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface DirectOrderModalProps {
  product: Product | null;
  customization: any;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

const DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "বরিশাল", "রংপুর", "খুলনা", "ময়মনসিংহ"
];

const THANAS = {
  "ঢাকা": ["ধানমন্ডি", "গুলশান", "বনানী", "মিরপুর", "উত্তরা", "মোহাম্মদপুর", "রমনা", "তেজগাঁও"],
  "চট্টগ্রাম": ["কোতোয়ালী", "পাঁচলাইশ", "ডাবল মুরিং", "চান্দগাঁও", "হালিশহর", "বায়েজিদ"],
  // Add more thanas for other districts as needed
};

export default function DirectOrderModal({ 
  product, 
  customization, 
  isOpen, 
  onClose, 
  onOrderSuccess 
}: DirectOrderModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [orderData, setOrderData] = useState({
    customerName: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    deliveryInstructions: "",
    paymentMethod: "cod", // cod, bkash, nagad
    advancePayment: false,
    urgentDelivery: false
  });

  const [pricing, setPricing] = useState({
    productPrice: 0,
    deliveryFee: 0,
    urgencyFee: 0,
    total: 0
  });

  useEffect(() => {
    if (product) {
      const basePrice = parseFloat(product.price.toString()) * (customization?.quantity || 1);
      const deliveryFee = orderData.district === "ঢাকা" ? 80 : 120;
      const urgencyFee = orderData.urgentDelivery ? 50 : 0;

      setPricing({
        productPrice: basePrice,
        deliveryFee,
        urgencyFee,
        total: basePrice + deliveryFee + urgencyFee
      });
    }
  }, [product, customization, orderData.district, orderData.urgentDelivery]);

  if (!product) return null;

  const handleInputChange = (field: keyof typeof orderData, value: string | boolean) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return orderData.customerName && orderData.phone;
      case 2:
        return orderData.district && orderData.thana && orderData.address;
      case 3:
        return orderData.paymentMethod;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive",
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(3)) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সকল তথ্য সম্পূর্ণ করুন",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order object
      const orderPayload = {
        customer_name: orderData.customerName,
        phone: orderData.phone,
        district: orderData.district,
        thana: orderData.thana,
        address: orderData.address,
        payment_info: {
          method: orderData.paymentMethod,
          advance_payment: orderData.advancePayment,
          delivery_instructions: orderData.deliveryInstructions
        },
        items: [{
          product_id: product.id,
          product_name: product.name,
          price: parseFloat(product.price.toString()),
          quantity: customization?.quantity || 1,
          customization: customization
        }],
        total: pricing.total,
        delivery_fee: pricing.deliveryFee,
        urgent_delivery: orderData.urgentDelivery
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "অর্ডার সফল!",
          description: `অর্ডার ID: ${result.tracking_id}`,
        });
        onOrderSuccess(result.tracking_id);
        onClose();
      } else {
        throw new Error(result.message || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "আবার চেষ্টা করুন অথবা WhatsApp এ অর্ডার করুন",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const orderDetails = `
🛍️ *নতুন অর্ডার*

📦 *পণ্যের তথ্য:*
• পণ্য: ${product.name}
• দাম: ${formatPrice(product.price)}
• পরিমাণ: ${customization?.quantity || 1}

🎨 *কাস্টমাইজেশন:*
${customization?.size ? `• সাইজ: ${customization.size}` : ''}
${customization?.color ? `• রং: ${customization.color}` : ''}
${customization?.customText ? `• টেক্সট: ${customization.customText}` : ''}

👤 *গ্রাহকের তথ্য:*
• নাম: ${orderData.customerName}
• ফোন: ${orderData.phone}

📍 *ঠিকানা:*
• জেলা: ${orderData.district}
• থানা: ${orderData.thana}
• ঠিকানা: ${orderData.address}

💰 *মূল্য বিবরণ:*
• পণ্যের মূল্য: ${formatPrice(pricing.productPrice)}
• ডেলিভারি ফি: ${formatPrice(pricing.deliveryFee)}
${pricing.urgencyFee > 0 ? `• জরুরি ডেলিভারি: ${formatPrice(pricing.urgencyFee)}` : ''}
• *মোট: ${formatPrice(pricing.total)}*

💳 পেমেন্ট: ${orderData.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : orderData.paymentMethod.toUpperCase()}
    `;

    window.open(createWhatsAppUrl(orderDetails.trim()), '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto p-4 sm:p-6" style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '95vw',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-primary" />
            সরাসরি অর্ডার করুন
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNumber
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Customer Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              ব্যক্তিগত তথ্য
            </h3>

            <div>
              <Label htmlFor="customerName">পূর্ণ নাম *</Label>
              <Input
                id="customerName"
                placeholder="আপনার পূর্ণ নাম"
                value={orderData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">ফোন নম্বর *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={orderData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              ডেলিভারি ঠিকানা
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>জেলা *</Label>
                <Select value={orderData.district} onValueChange={(value) => handleInputChange("district", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>থানা *</Label>
                <Select 
                  value={orderData.thana} 
                  onValueChange={(value) => handleInputChange("thana", value)}
                  disabled={!orderData.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="থানা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {(THANAS[orderData.district as keyof typeof THANAS] || []).map((thana) => (
                      <SelectItem key={thana} value={thana}>
                        {thana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">বিস্তারিত ঠিকানা *</Label>
              <Textarea
                id="address"
                placeholder="বাড়ি/অফিস নম্বর, রাস্তার নাম, এলাকা"
                value={orderData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="deliveryInstructions">ডেলিভারি নির্দেশনা (ঐচ্ছিক)</Label>
              <Input
                id="deliveryInstructions"
                placeholder="বিশেষ নির্দেশনা বা ল্যান্ডমার্ক"
                value={orderData.deliveryInstructions}
                onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment & Delivery Options */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              পেমেন্ট ও ডেলিভারি
            </h3>

            <div>
              <Label>পেমেন্ট পদ্ধতি *</Label>
              <Select value={orderData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">ক্যাশ অন ডেলিভারি</SelectItem>
                  <SelectItem value="bkash">বিকাশ</SelectItem>
                  <SelectItem value="nagad">নগদ</SelectItem>
                  <SelectItem value="rocket">রকেট</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgentDelivery"
                checked={orderData.urgentDelivery}
                onChange={(e) => handleInputChange("urgentDelivery", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="urgentDelivery">
                জরুরি ডেলিভারি (+৫০ টাকা) - ২৪ ঘন্টার মধ্যে
              </Label>
            </div>

            {orderData.paymentMethod !== 'cod' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="advancePayment"
                  checked={orderData.advancePayment}
                  onChange={(e) => handleInputChange("advancePayment", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="advancePayment">
                  অগ্রিম পেমেন্ট (১০০ টাকা)
                </Label>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Order Summary */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              অর্ডার সারাংশ
            </h3>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img 
                    src={product.image_url || "/placeholder.jpg"} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      পরিমাণ: {customization?.quantity || 1}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>পণ্যের মূল্য:</span>
                  <span>{formatPrice(pricing.productPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি ফি:</span>
                  <span>{formatPrice(pricing.deliveryFee)}</span>
                </div>
                {pricing.urgencyFee > 0 && (
                  <div className="flex justify-between">
                    <span>জরুরি ডেলিভারি:</span>
                    <span>{formatPrice(pricing.urgencyFee)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>মোট:</span>
                  <span>{formatPrice(pricing.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h5 className="font-semibold mb-2">ডেলিভারি ঠিকানা:</h5>
                <p className="text-sm">
                  {orderData.customerName}<br />
                  {orderData.phone}<br />
                  {orderData.address}<br />
                  {orderData.thana}, {orderData.district}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step > 1 ? 'পূর্ববর্তী' : 'বাতিল'}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleWhatsAppOrder}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              WhatsApp এ অর্ডার
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext}>
                পরবর্তী <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
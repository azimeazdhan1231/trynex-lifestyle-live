import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { User, MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import PerfectModalBase from "./perfect-modal-base";
import PerfectOrderSuccessModal from "./perfect-order-success-modal";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface PerfectCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderComplete: () => void;
}

export default function PerfectCheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderComplete
}: PerfectCheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    payment_method: "cash_on_delivery",
    payment_number: "",
    trx_id: ""
  });
  const [orderResult, setOrderResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = totalAmount < 500 ? 120 : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        items: cart,
        customer_name: formData.customer_name,
        phone: formData.phone,
        district: formData.district,
        thana: formData.thana,
        address: formData.address,
        total_amount: finalTotal,
        delivery_fee: deliveryFee,
        payment_info: {
          method: formData.payment_method,
          payment_number: formData.payment_number,
          trx_id: formData.trx_id,
          amount_paid: finalTotal
        },
        custom_instructions: "",
        custom_images: [],
        is_custom_order: false,
        advance_payment_amount: null
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setOrderResult(result);
        onClose();
        setShowSuccess(true);
      } else {
        throw new Error("Order failed");
      }
    } catch (error) {
      toast({
        title: "অর্ডার ব্যর্থ হয়েছে",
        description: "আবার চেষ্টা করুন",
        variant: "destructive"
      });
    }
  };

  const stepTitles = [
    "গ্রাহকের তথ্য",
    "ডেলিভারি ঠিকানা", 
    "পেমেন্ট তথ্য",
    "অর্ডার নিশ্চিত করুন"
  ];

  return (
    <>
      <PerfectModalBase
        isOpen={isOpen}
        onClose={onClose}
        title={`অর্ডার সম্পূর্ণ করুন - ধাপ ${step}/4`}
        maxWidth="max-w-md"
      >
        {/* Progress */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{stepTitles[step - 1]}</span>
            <span className="text-xs text-gray-500">{step}/4</span>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="p-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">আপনার তথ্য দিন</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">পূর্ণ নাম *</Label>
                  <Input
                    id="name"
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">মোবাইল নম্বর *</Label>
                  <Input
                    id="phone"
                    placeholder="০১৭xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">ডেলিভারি ঠিকানা</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">জেলা *</Label>
                    <Select 
                      value={formData.district} 
                      onValueChange={(value) => setFormData({...formData, district: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="জেলা" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ঢাকা">ঢাকা</SelectItem>
                        <SelectItem value="চট্টগ্রাম">চট্টগ্রাম</SelectItem>
                        <SelectItem value="সিলেট">সিলেট</SelectItem>
                        <SelectItem value="রাজশাহী">রাজশাহী</SelectItem>
                        <SelectItem value="খুলনা">খুলনা</SelectItem>
                        <SelectItem value="বরিশাল">বরিশাল</SelectItem>
                        <SelectItem value="রংপুর">রংপুর</SelectItem>
                        <SelectItem value="ময়মনসিংহ">ময়মনসিংহ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">থানা *</Label>
                    <Input
                      placeholder="থানা"
                      value={formData.thana}
                      onChange={(e) => setFormData({...formData, thana: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">বিস্তারিত ঠিকানা *</Label>
                  <Input
                    placeholder="গ্রাম/পাড়া, রাস্তা, বাড়ি নং"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">পেমেন্ট তথ্য</h3>
              </div>
              
              <RadioGroup 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({...formData, payment_method: value})}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="cash_on_delivery" id="cod" />
                  <Label htmlFor="cod" className="font-medium">ক্যাশ অন ডেলিভারি</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="bkash" id="bkash" />
                  <Label htmlFor="bkash" className="font-medium">বিকাশ</Label>
                </div>
              </RadioGroup>

              {formData.payment_method !== "cash_on_delivery" && (
                <div className="space-y-3">
                  <Input
                    placeholder="পেমেন্ট নম্বর"
                    value={formData.payment_number}
                    onChange={(e) => setFormData({...formData, payment_number: e.target.value})}
                  />
                  <Input
                    placeholder="লেনদেন আইডি"
                    value={formData.trx_id}
                    onChange={(e) => setFormData({...formData, trx_id: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">অর্ডার সম্পূর্ণ করুন</h3>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>পণ্যের মূল্য:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : "ফ্রি"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>মোট:</span>
                  <span className="text-orange-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-900">সব তথ্য ঠিক করে অর্ডার সম্পূর্ণ করুন</p>
                <p className="text-blue-700 mt-1">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t p-4">
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : handleBack}
              className="flex-1"
              size="sm"
            >
              {step === 1 ? "বাতিল" : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  পূর্ববর্তী
                </>
              )}
            </Button>
            
            <Button
              onClick={step === 4 ? handleSubmitOrder : handleNext}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              size="sm"
              disabled={
                (step === 1 && (!formData.customer_name || !formData.phone)) ||
                (step === 2 && (!formData.district || !formData.thana || !formData.address)) ||
                (step === 3 && formData.payment_method !== "cash_on_delivery" && (!formData.payment_number || !formData.trx_id))
              }
            >
              {step === 4 ? "অর্ডার করুন" : (
                <>
                  পরবর্তী
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </PerfectModalBase>

      <PerfectOrderSuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onOrderComplete();
        }}
        orderData={orderResult}
      />
    </>
  );
}
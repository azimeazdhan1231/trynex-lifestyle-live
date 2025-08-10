import { useState, useEffect } from "react";
import PerfectModalBase from "./perfect-modal-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Phone, 
  User, 
  Package,
  Truck,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DISTRICTS } from "@/lib/constants";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: any;
}

interface PerfectCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onPlaceOrder: (orderData: any) => Promise<void>;
}

export default function PerfectCheckoutModal({
  isOpen,
  onClose,
  cartItems,
  total,
  onPlaceOrder
}: PerfectCheckoutModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    payment_number: "",
    trx_id: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Calculate delivery fee based on district
  useEffect(() => {
    if (formData.district === "ঢাকা") {
      setDeliveryFee(total >= 2000 ? 0 : 60);
    } else {
      setDeliveryFee(total >= 2000 ? 0 : 120);
    }
  }, [formData.district, total]);

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.customer_name.trim()) newErrors.customer_name = "নাম লিখুন";
      if (!formData.phone.trim()) newErrors.phone = "ফোন নম্বর লিখুন";
      if (!/^01[3-9]\d{8}$/.test(formData.phone)) newErrors.phone = "সঠিক ফোন নম্বর লিখুন";
      if (!formData.district) newErrors.district = "জেলা নির্বাচন করুন";
      if (!formData.thana.trim()) newErrors.thana = "থানা লিখুন";
      if (!formData.address.trim()) newErrors.address = "ঠিকানা লিখুন";
    }

    if (stepNumber === 2) {
      if (!formData.payment_number.trim()) newErrors.payment_number = "পেমেন্ট নম্বর লিখুন";
      if (!formData.trx_id.trim()) newErrors.trx_id = "লেনদেন আইডি লিখুন";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          ...item,
          delivery_fee: deliveryFee / cartItems.length
        })),
        total: (total + deliveryFee).toString(),
        delivery_fee: deliveryFee,
        payment_info: {
          payment_number: formData.payment_number,
          trx_id: formData.trx_id,
          payment_method: "bKash/Nagad",
          amount_paid: total + deliveryFee
        }
      };

      await onPlaceOrder(orderData);
      onClose();
    } catch (error) {
      console.error("Order placement error:", error);
      toast({
        title: "অর্ডার সমস্যা",
        description: "অর্ডার দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalTotal = total + deliveryFee;

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="চেকআউট"
      description="আপনার অর্ডার সম্পূর্ণ করুন"
      maxWidth="4xl"
      data-testid="modal-checkout"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="ml-2 font-medium">ব্যক্তিগত তথ্য</span>
          </div>
          
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="ml-2 font-medium">পেমেন্ট তথ্য</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    ব্যক্তিগত ও ঠিকানার তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">পূর্ণ নাম *</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="আপনার পূর্ণ নাম"
                        className={errors.customer_name ? 'border-red-500' : ''}
                        data-testid="input-customer-name"
                      />
                      {errors.customer_name && (
                        <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.customer_name}
                        </span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">ফোন নম্বর *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className={errors.phone ? 'border-red-500' : ''}
                        data-testid="input-phone"
                      />
                      {errors.phone && (
                        <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">জেলা *</Label>
                      <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)}>
                        <SelectTrigger className={errors.district ? 'border-red-500' : ''} data-testid="select-district">
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
                      {errors.district && (
                        <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.district}
                        </span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="thana">উপজেলা/থানা *</Label>
                      <Input
                        id="thana"
                        value={formData.thana}
                        onChange={(e) => handleInputChange('thana', e.target.value)}
                        placeholder="উপজেলা/থানা নাম"
                        className={errors.thana ? 'border-red-500' : ''}
                        data-testid="input-thana"
                      />
                      {errors.thana && (
                        <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.thana}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">বিস্তারিত ঠিকানা *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="বাড়ি/রোড/এলাকার নাম"
                      className={errors.address ? 'border-red-500' : ''}
                      data-testid="input-address"
                    />
                    {errors.address && (
                      <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.address}
                      </span>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">ডেলিভারি তথ্য</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <span>ডেলিভারি চার্জ: ৳{deliveryFee}</span>
                      {total >= 2000 && (
                        <span className="block text-green-600 font-medium">
                          ২০০০ টাকার উপরে ফ্রি ডেলিভারি!
                        </span>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleNext} className="w-full" data-testid="button-next-step">
                    পরবর্তী ধাপ
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    পেমেন্ট তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Instructions */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">পেমেন্ট নির্দেশনা:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                      <li>bKash বা Nagad এ ৳{finalTotal} টাকা পাঠান: <strong>01765555593</strong></li>
                      <li>পেমেন্ট সম্পূর্ণ করার পর তথ্য নিচে দিন</li>
                      <li>আমরা যাচাই করে অর্ডার কনফার্ম করব</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_number">পেমেন্ট করা নম্বর *</Label>
                      <Input
                        id="payment_number"
                        value={formData.payment_number}
                        onChange={(e) => handleInputChange('payment_number', e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className={errors.payment_number ? 'border-red-500' : ''}
                        data-testid="input-payment-number"
                      />
                      {errors.payment_number && (
                        <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.payment_number}
                        </span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="trx_id">লেনদেন আইডি (TrxID) *</Label>
                      <Input
                        id="trx_id"
                        value={formData.trx_id}
                        onChange={(e) => handleInputChange('trx_id', e.target.value)}
                        placeholder="TrxID/Transaction ID"
                        className={errors.trx_id ? 'border-red-500' : ''}
                        data-testid="input-trx-id"
                      />
                      {errors.trx_id && (
                        <span className="text-red-500 text-sm flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.trx_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrevious} className="flex-1" data-testid="button-previous">
                      পূর্ববর্তী
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="button-place-order"
                    >
                      {isLoading ? "অর্ডার দেওয়া হচ্ছে..." : "অর্ডার সম্পূর্ণ করুন"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  অর্ডার সারাংশ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h5>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <span>৳{item.price}</span>
                          <span>×</span>
                          <span>{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ৳{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>পণ্যের দাম:</span>
                    <span>৳{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>মোট:</span>
                    <span className="text-green-600">৳{finalTotal}</span>
                  </div>
                </div>

                {/* Free delivery badge */}
                {total >= 2000 && (
                  <Badge className="w-full justify-center bg-green-100 text-green-800 border-green-300">
                    ফ্রি ডেলিভারি পেয়েছেন!
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PerfectModalBase>
  );
}
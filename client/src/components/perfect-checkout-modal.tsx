import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DISTRICTS, THANAS_BY_DISTRICT, formatPrice, calculateDeliveryFee } from "@/lib/constants";
import OrderSuccessModal from "@/components/order-success-modal";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics";
import { ShoppingCart, MapPin, Phone, User, CreditCard, Package, Truck, AlertCircle, CheckCircle } from "lucide-react";
import type { Order } from "@shared/schema";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  customization?: any;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderComplete: () => void;
}

function PerfectCheckoutModal({ isOpen, onClose, cart, onOrderComplete }: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    payment_number: "",
    trx_id: "",
    special_instructions: ""
  });
  const [deliveryFee, setDeliveryFee] = useState(80);
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if this is a custom order from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isCustomOrder = urlParams.get('customOrder') === 'true';
  const customAdvancePayment = urlParams.get('advancePayment') ? parseInt(urlParams.get('advancePayment')!) : 100;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subtotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const totalPrice = subtotal + deliveryFee;
  const finalPayment = isCustomOrder ? customAdvancePayment : totalPrice;

  // Update delivery fee and available thanas when district changes
  useEffect(() => {
    if (formData.district && THANAS_BY_DISTRICT[formData.district]) {
      const fee = calculateDeliveryFee(formData.district, subtotal);
      setDeliveryFee(fee);
      setAvailableThanas(THANAS_BY_DISTRICT[formData.district]);
      // Clear thana selection when district changes
      if (formData.thana && !THANAS_BY_DISTRICT[formData.district].includes(formData.thana)) {
        setFormData(prev => ({ ...prev, thana: "" }));
      }
      // Clear any district-related errors
      setErrors(prev => ({...prev, district: ""}));
    } else if (formData.district) {
      // If district is selected but no thanas available, clear thana
      setAvailableThanas([]);
      setFormData(prev => ({ ...prev, thana: "" }));
      setDeliveryFee(calculateDeliveryFee(formData.district, subtotal));
    } else {
      // No district selected
      setAvailableThanas([]);
      setDeliveryFee(80);
      setFormData(prev => ({ ...prev, thana: "" }));
    }
  }, [formData.district, subtotal]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.customer_name.trim()) newErrors.customer_name = "নাম লিখুন";
      if (!formData.phone.trim()) newErrors.phone = "ফোন নম্বর লিখুন";
      else if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
        newErrors.phone = "সঠিক বাংলাদেশি ফোন নম্বর লিখুন";
      }
    }

    if (step === 2) {
      if (!formData.district) newErrors.district = "জেলা নির্বাচন করুন";
      if (!formData.thana && availableThanas.length > 0) newErrors.thana = "থানা নির্বাচন করুন";
      if (!formData.address.trim()) newErrors.address = "বিস্তারিত ঠিকানা লিখুন";
    }

    if (step === 3) {
      if (!formData.payment_number.trim()) newErrors.payment_number = "পেমেন্ট নম্বর লিখুন";
      if (!formData.trx_id.trim()) newErrors.trx_id = "ট্রানজেকশন আইডি লিখুন";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("/api/orders", "POST", orderData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order creation failed: ${response.status} - ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: (order) => {
      setCompletedOrder(order);
      setShowSuccessModal(true);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Note: Cart clearing is handled by parent component
      
      toast({
        title: "✅ অর্ডার সফল হয়েছে!",
        description: `ট্র্যাকিং আইডি: ${order.tracking_id || order.id}\n\nআমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`,
        duration: 8000,
      });

      // Auto redirect to tracking page after 3 seconds
      setTimeout(() => {
        window.location.href = `/tracking?id=${order.tracking_id || order.id}`;
      }, 3000);

      onOrderComplete();
      onClose();
    },
    onError: (error: Error) => {
      console.error('Order creation error:', error);
      toast({
        title: "অর্ডার সমস্যা",
        description: "দয়া করে আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    // Extract custom images from cart items
    const allCustomImages: string[] = [];
    let customInstructions = '';
    
    cart.forEach(item => {
      if (item.customization) {
        if (item.customization.custom_images && Array.isArray(item.customization.custom_images)) {
          allCustomImages.push(...item.customization.custom_images);
        }
        if (item.customization.instructions) {
          customInstructions += `${item.name}: ${item.customization.instructions}\n`;
        }
      }
    });

    const orderData = {
      items: JSON.stringify(cart.map(item => ({
        productId: item.id,
        productName: item.name,
        productPrice: item.price,
        quantity: item.quantity,
        customization: item.customization || null
      }))),
      customer_name: formData.customer_name,
      phone: formData.phone,
      district: formData.district,
      thana: formData.thana,
      address: formData.address,
      total: finalPayment.toString(),
      payment_info: JSON.stringify({
        method: isCustomOrder ? "advance_payment" : "cash_on_delivery",
        payment_number: formData.payment_number,
        trx_id: formData.trx_id,
        amount_paid: finalPayment
      }),
      custom_instructions: customInstructions + (formData.special_instructions || ''),
      custom_images: allCustomImages.length > 0 ? JSON.stringify(allCustomImages) : null,
      status: "pending"
    };

    // trackInitiateCheckout(totalPrice, cart.length);
    createOrderMutation.mutate(orderData);
  };

  const stepTitles = [
    "ব্যক্তিগত তথ্য",
    "ডেলিভারি ঠিকানা", 
    "পেমেন্ট তথ্য",
    "অর্ডার সম্পূর্ণ করুন"
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <User className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">আপনার তথ্য দিন</h3>
              <p className="text-gray-600">অর্ডার সম্পূর্ণ করতে প্রয়োজনীয় তথ্য প্রদান করুন</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name" className="text-gray-700 font-medium">পূর্ণ নাম *</Label>
                <Input
                  id="customer_name"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  className={`mt-1 ${errors.customer_name ? 'border-red-500' : ''}`}
                  data-testid="input-customer-name"
                />
                {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">ফোন নম্বর *</Label>
                <Input
                  id="phone"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                  data-testid="input-phone"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <MapPin className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">ডেলিভারি ঠিকানা</h3>
              <p className="text-gray-600">পণ্য পৌঁছানোর ঠিকানা দিন</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">জেলা *</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}>
                    <SelectTrigger className={`mt-1 ${errors.district ? 'border-red-500' : ''}`} data-testid="select-district">
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">থানা *</Label>
                  <Select value={formData.thana} onValueChange={(value) => setFormData(prev => ({ ...prev, thana: value }))} disabled={!formData.district}>
                    <SelectTrigger className={`mt-1 ${errors.thana ? 'border-red-500' : ''}`} data-testid="select-thana">
                      <SelectValue placeholder="থানা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableThanas.map((thana) => (
                        <SelectItem key={thana} value={thana}>{thana}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.thana && <p className="text-red-500 text-sm mt-1">{errors.thana}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-700 font-medium">বিস্তারিত ঠিকানা *</Label>
                <Textarea
                  id="address"
                  placeholder="বাড়ির নম্বর, রাস্তার নাম, এলাকার নাম লিখুন"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                  rows={3}
                  data-testid="textarea-address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Delivery Fee Display */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-blue-700 font-medium">ডেলিভারি চার্জ</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {formatPrice(deliveryFee)}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {formData.district === "ঢাকা" ? "ঢাকার মধ্যে" : "ঢাকার বাইরে"} ডেলিভারি
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <CreditCard className="w-12 h-12 mx-auto text-purple-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">পেমেন্ট করুন</h3>
              <p className="text-gray-600">
                {isCustomOrder 
                  ? `অ্যাডভান্স পেমেন্ট: ${formatPrice(customAdvancePayment)}`
                  : "bKash/Nagad দিয়ে পেমেন্ট সম্পূর্ণ করুন"
                }
              </p>
            </div>

            {/* Payment Instructions */}
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-800 text-base">পেমেন্ট নির্দেশনা</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm text-orange-700">
                  <p><strong>bKash Personal:</strong> 01712345678</p>
                  <p><strong>Nagad Personal:</strong> 01812345678</p>
                  <div className="flex items-start space-x-2 mt-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600" />
                    <div>
                      <p className="font-medium">পেমেন্ট করার পদ্ধতি:</p>
                      <ol className="list-decimal list-inside space-y-1 mt-1">
                        <li>"Send Money" নির্বাচন করুন</li>
                        <li>উপরের নম্বরে {formatPrice(finalPayment)} টাকা পাঠান</li>
                        <li>Transaction ID কপি করুন</li>
                        <li>নিচের ফর্মে তথ্য দিন</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="payment_number" className="text-gray-700 font-medium">যে নম্বর থেকে পেমেন্ট করেছেন *</Label>
                <Input
                  id="payment_number"
                  placeholder="01XXXXXXXXX"
                  value={formData.payment_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_number: e.target.value }))}
                  className={`mt-1 ${errors.payment_number ? 'border-red-500' : ''}`}
                  data-testid="input-payment-number"
                />
                {errors.payment_number && <p className="text-red-500 text-sm mt-1">{errors.payment_number}</p>}
              </div>

              <div>
                <Label htmlFor="trx_id" className="text-gray-700 font-medium">Transaction ID *</Label>
                <Input
                  id="trx_id"
                  placeholder="যেমন: 8G5A7X9B1C"
                  value={formData.trx_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, trx_id: e.target.value }))}
                  className={`mt-1 ${errors.trx_id ? 'border-red-500' : ''}`}
                  data-testid="input-transaction-id"
                />
                {errors.trx_id && <p className="text-red-500 text-sm mt-1">{errors.trx_id}</p>}
              </div>

              <div>
                <Label htmlFor="special_instructions" className="text-gray-700 font-medium">বিশেষ নির্দেশনা (ঐচ্ছিক)</Label>
                <Textarea
                  id="special_instructions"
                  placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  className="mt-1"
                  rows={3}
                  data-testid="textarea-special-instructions"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">অর্ডার সম্পূর্ণ করুন</h3>
              <p className="text-gray-600">সব তথ্য চেক করে অর্ডার কনফার্ম করুন</p>
            </div>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">অর্ডার সামারি</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">পরিমাণ: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>সাবটোটাল:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  {isCustomOrder && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>অ্যাডভান্স পেমেন্ট:</span>
                      <span>{formatPrice(customAdvancePayment)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>মোট প্রদেয় অর্থ:</span>
                    <span className="text-green-600">{formatPrice(finalPayment)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">গ্রাহকের তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <p><strong>নাম:</strong> {formData.customer_name}</p>
                  <p><strong>ফোন:</strong> {formData.phone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">ডেলিভারি ঠিকানা</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <p>{formData.address}</p>
                  <p>{formData.thana}, {formData.district}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] w-[95vw] md:w-[90vw] lg:w-[85vw] overflow-y-auto p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              অর্ডার সম্পূর্ণ করুন
            </DialogTitle>
            <DialogDescription>
              {stepTitles[currentStep - 1]} - ধাপ {currentStep}/4
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          <div className="py-4">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              data-testid="button-prev-step"
            >
              পূর্ববর্তী
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                data-testid="button-next-step"
              >
                পরবর্তী
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createOrderMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                data-testid="button-confirm-order"
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    অর্ডার করা হচ্ছে...
                  </div>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    অর্ডার কনফার্ম করুন
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessModal && completedOrder && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          order={completedOrder}
        />
      )}
    </>
  );
}

export default PerfectCheckoutModal;
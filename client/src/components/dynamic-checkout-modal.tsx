import { useState, useEffect } from "react";
import DynamicResponsiveModal from "./dynamic-responsive-modal";
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
import { DISTRICTS, THANAS_BY_DISTRICT, formatPrice, calculateDeliveryFee, BKASH_NUMBER, NAGAD_NUMBER } from "@/lib/constants";
import DynamicOrderSuccessModal from "./dynamic-order-success-modal";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics";
import { 
  ShoppingCart, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Package, 
  Truck, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from "lucide-react";
import type { Order } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  customization?: any;
}

interface DynamicCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderComplete: () => void;
}

export default function DynamicCheckoutModal({ isOpen, onClose, cart, onOrderComplete }: DynamicCheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      const response = await apiRequest("POST", "/api/orders", orderData);
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
      
      toast({
        title: "অর্ডার সফল হয়েছে!",
        description: `ট্র্যাকিং নম্বর: ${order.tracking_number}`,
      });

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
      items: cart,
      customer_name: formData.customer_name,
      phone: formData.phone,
      district: formData.district,
      thana: formData.thana,
      address: formData.address,
      total: finalPayment.toString(), // Convert to string as expected by backend
      payment_info: {
        method: isCustomOrder ? "advance_payment" : "cash_on_delivery",
        payment_number: formData.payment_number,
        trx_id: formData.trx_id,
        amount_paid: finalPayment,
        delivery_fee: deliveryFee
      },
      custom_instructions: customInstructions + (formData.special_instructions || ''),
      custom_images: allCustomImages,
      is_custom_order: isCustomOrder,
      advance_payment_amount: isCustomOrder ? customAdvancePayment : null
    };

    createOrderMutation.mutate(orderData);
  };

  const stepTitles = [
    "ব্যক্তিগত তথ্য",
    "ডেলিভারি ঠিকানা", 
    "পেমেন্ট তথ্য",
    "অর্ডার সম্পূর্ণ করুন"
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {stepTitles.map((title, index) => (
        <div key={index} className="flex items-center">
          <div className={cn(
            "flex items-center justify-center rounded-full transition-colors",
            isMobile ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm",
            currentStep > index + 1 ? "bg-green-500 text-white" :
            currentStep === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
          )}>
            {currentStep > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          {!isMobile && index < stepTitles.length - 1 && (
            <div className={cn(
              "w-16 h-0.5 mx-2",
              currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4">
              <User className={cn("mx-auto text-blue-500 mb-2", isMobile ? "w-10 h-10" : "w-12 h-12")} />
              <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-base" : "text-lg")}>
                আপনার তথ্য দিন
              </h3>
              <p className={cn("text-gray-600", isMobile ? "text-sm" : "text-base")}>
                অর্ডার সম্পূর্ণ করতে প্রয়োজনীয় তথ্য প্রদান করুন
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name" className="text-gray-700 font-medium">পূর্ণ নাম *</Label>
                <Input
                  id="customer_name"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  className={cn("mt-1", errors.customer_name && "border-red-500")}
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
                  className={cn("mt-1", errors.phone && "border-red-500")}
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
              <MapPin className={cn("mx-auto text-green-500 mb-2", isMobile ? "w-10 h-10" : "w-12 h-12")} />
              <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-base" : "text-lg")}>
                ডেলিভারি ঠিকানা
              </h3>
              <p className={cn("text-gray-600", isMobile ? "text-sm" : "text-base")}>
                পণ্য পৌঁছানোর ঠিকানা দিন
              </p>
            </div>

            <div className="space-y-4">
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <div>
                  <Label className="text-gray-700 font-medium">জেলা *</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}>
                    <SelectTrigger className={cn("mt-1", errors.district && "border-red-500")} data-testid="select-district">
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
                  <Select value={formData.thana} onValueChange={(value) => setFormData(prev => ({ ...prev, thana: value }))} disabled={!formData.district || availableThanas.length === 0}>
                    <SelectTrigger className={cn("mt-1", errors.thana && "border-red-500")} data-testid="select-thana">
                      <SelectValue placeholder={
                        !formData.district 
                          ? "প্রথমে জেলা নির্বাচন করুন" 
                          : availableThanas.length === 0
                          ? "এই জেলায় থানা পাওয়া যায়নি"
                          : "থানা নির্বাচন করুন"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableThanas.map((thana) => (
                        <SelectItem key={thana} value={thana}>{thana}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.thana && <p className="text-red-500 text-sm mt-1">{errors.thana}</p>}
                  {formData.district && availableThanas.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">এই জেলার জন্য থানা তথ্য পাওয়া যায়নি</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-700 font-medium">বিস্তারিত ঠিকানা *</Label>
                <Textarea
                  id="address"
                  placeholder="বাড়ির নম্বর, রাস্তার নাম, এলাকার নাম লিখুন"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={cn("mt-1", errors.address && "border-red-500")}
                  rows={isMobile ? 2 : 3}
                  data-testid="textarea-address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Delivery Fee Display */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-blue-700 font-medium text-sm">ডেলিভারি চার্জ</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {formatPrice(deliveryFee)}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
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
              <CreditCard className={cn("mx-auto text-purple-500 mb-2", isMobile ? "w-10 h-10" : "w-12 h-12")} />
              <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-base" : "text-lg")}>
                পেমেন্ট করুন
              </h3>
              <p className={cn("text-gray-600", isMobile ? "text-sm" : "text-base")}>
                {isCustomOrder 
                  ? `অ্যাডভান্স পেমেন্ট: ${formatPrice(customAdvancePayment)}`
                  : "bKash/Nagad দিয়ে পেমেন্ট সম্পূর্ণ করুন"
                }
              </p>
            </div>

            {/* Payment Instructions */}
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-orange-800", isMobile ? "text-sm" : "text-base")}>
                  পেমেন্ট নির্দেশনা
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={cn("space-y-2 text-orange-700", isMobile ? "text-sm" : "text-sm")}>
                  <p><strong>bKash Personal:</strong> {BKASH_NUMBER}</p>
                  <p><strong>Nagad Personal:</strong> {NAGAD_NUMBER}</p>
                  <div className="flex items-start space-x-2 mt-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600 shrink-0" />
                    <div>
                      <p className="font-medium">পেমেন্ট করার পদ্ধতি:</p>
                      <ol className="list-decimal list-inside space-y-1 mt-1 text-xs">
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
                  className={cn("mt-1", errors.payment_number && "border-red-500")}
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
                  className={cn("mt-1", errors.trx_id && "border-red-500")}
                  data-testid="input-transaction-id"
                />
                {errors.trx_id && <p className="text-red-500 text-sm mt-1">{errors.trx_id}</p>}
              </div>

              <div>
                <Label htmlFor="special_instructions" className="text-gray-700 font-medium">বিশেষ নির্দেশনা (ঐচ্ছিক)</Label>
                <Textarea
                  id="special_instructions"
                  placeholder="কোন বিশেষ প্রয়োজন থাকলে লিখুন"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  className="mt-1"
                  rows={isMobile ? 2 : 3}
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
              <Package className={cn("mx-auto text-green-500 mb-2", isMobile ? "w-10 h-10" : "w-12 h-12")} />
              <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-base" : "text-lg")}>
                অর্ডার সম্পূর্ণ করুন
              </h3>
              <p className={cn("text-gray-600", isMobile ? "text-sm" : "text-base")}>
                সব তথ্য সঠিক হলে অর্ডার নিশ্চিত করুন
              </p>
            </div>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isMobile ? "text-base" : "text-lg")}>অর্ডার সারাংশ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className={cn("object-cover rounded border border-gray-200", 
                          isMobile ? "w-10 h-10" : "w-12 h-12"
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className={cn("font-medium text-gray-900 truncate", isMobile ? "text-sm" : "text-base")}>
                        {item.name}
                      </h5>
                      <div className={cn("text-gray-600", isMobile ? "text-xs" : "text-sm")}>
                        পরিমাণ: {item.quantity} • দাম: ৳{item.price}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-semibold text-gray-900", isMobile ? "text-sm" : "text-base")}>
                        ৳{(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>পণ্যের মূল্য:</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>সর্বমোট:</span>
                    <span className="text-green-600">৳{finalPayment}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details Summary */}
            <Card>
              <CardContent className="p-4">
                <h4 className={cn("font-semibold text-gray-900 mb-3", isMobile ? "text-sm" : "text-base")}>
                  গ্রাহক তথ্য
                </h4>
                <div className={cn("space-y-2", isMobile ? "text-sm" : "text-base")}>
                  <p><strong>নাম:</strong> {formData.customer_name}</p>
                  <p><strong>ফোন:</strong> {formData.phone}</p>
                  <p><strong>ঠিকানা:</strong> {formData.address}, {formData.thana}, {formData.district}</p>
                  <p><strong>পেমেন্ট:</strong> {formData.trx_id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DynamicResponsiveModal
        isOpen={isOpen}
        onClose={onClose}
        title={`চেকআউট (${currentStep}/${stepTitles.length})`}
        description={stepTitles[currentStep - 1]}
        size={isMobile ? "full" : "lg"}
        preventClose={createOrderMutation.isPending}
      >
        <div className="space-y-6">
          {renderStepIndicator()}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className={cn("flex gap-3 pt-6 border-t border-gray-200", isMobile && "flex-col")}>
            {currentStep > 1 && (
              <Button
                onClick={handlePrevStep}
                variant="outline"
                disabled={createOrderMutation.isPending}
                className="flex-1"
                size={isMobile ? "lg" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                পূর্ববর্তী
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                className="flex-1"
                disabled={createOrderMutation.isPending}
                size={isMobile ? "lg" : "default"}
              >
                পরবর্তী
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={createOrderMutation.isPending}
                size={isMobile ? "lg" : "default"}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    অর্ডার করা হচ্ছে...
                  </>
                ) : (
                  <>
                    অর্ডার নিশ্চিত করুন
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DynamicResponsiveModal>

      {/* Success Modal */}
      {completedOrder && (
        <DynamicOrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          orderData={{
            id: completedOrder.id,
            tracking_id: completedOrder.tracking_id || '',
            customer_name: completedOrder.customer_name,
            phone: completedOrder.phone,
            district: completedOrder.district,
            thana: completedOrder.thana,
            address: completedOrder.address || '',
            items: cart,
            total: completedOrder.total?.toString() || '0',
            delivery_fee: deliveryFee,
            payment_info: {
              payment_method: formData.payment_number ? "bKash/Nagad" : "Mobile Banking",
              payment_number: formData.payment_number,
              trx_id: formData.trx_id,
              amount_paid: finalPayment
            },
            status: completedOrder.status || 'pending',
            created_at: completedOrder.created_at?.toString() || new Date().toISOString()
          }}
        />
      )}
    </>
  );
}
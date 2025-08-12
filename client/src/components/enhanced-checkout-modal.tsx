import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { 
  ShoppingCart, CreditCard, MapPin, Phone, User, 
  Package, Clock, CheckCircle, Truck, AlertCircle,
  Edit, Trash2, Plus, Minus, Heart, Star,
  Shield, Lock, Gift
} from "lucide-react";
import { formatPrice } from "@/lib/constants";

// Enhanced form validation schema
const checkoutSchema = z.object({
  customerName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন").regex(/^[0-9]+$/, "শুধুমাত্র সংখ্যা দিন"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন").optional().or(z.literal("")),
  district: z.string().min(2, "জেলা নির্বাচন করুন"),
  thana: z.string().min(2, "থানা নির্বাচন করুন"),
  address: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন (কমপক্ষে ১০ অক্ষর)"),
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "upay", "cod"], {
    required_error: "পেমেন্ট পদ্ধতি নির্বাচন করুন"
  }),
  paymentNumber: z.string().optional(),
  trxId: z.string().optional(),
  specialInstructions: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, "শর্তাবলী মেনে নিতে হবে"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface EnhancedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
}

// Sample districts and thanas data
const districtThanaData = {
  "ঢাকা": ["ধানমণ্ডি", "গুলশান", "বনানী", "উত্তরা", "মিরপুর", "রমনা", "তেজগাঁও", "মোহাম্মদপুর"],
  "চট্টগ্রাম": ["পতেঙ্গা", "আগ্রাবাদ", "নাসিরাবাদ", "হালিশহর", "চন্দনাইশ", "সীতাকুণ্ড"],
  "সিলেট": ["সিলেট সদর", "বিয়ানীবাজার", "বালাগঞ্জ", "বিশ্বনাথ", "ফেঞ্চুগঞ্জ"],
  "রাজশাহী": ["রাজশাহী সদর", "গোদাগাড়ী", "তানোর", "পবা", "চারঘাট"],
  "খুলনা": ["খুলনা সদর", "ডুমুরিয়া", "রূপসা", "ফুলতলা", "তেরখাদা"],
  "বরিশাল": ["বরিশাল সদর", "উজিরপুর", "বাকেরগঞ্জ", "বানারীপাড়া"],
  "রংপুর": ["রংপুর সদর", "গঙ্গাচড়া", "কাউনিয়া", "মিঠাপুকুর"],
  "ময়মনসিংহ": ["ময়মনসিংহ সদর", "মুক্তাগাছা", "ত্রিশাল", "ভালুকা"],
};

const paymentMethods = [
  { id: "bkash", name: "বিকাশ", icon: "💳", color: "bg-pink-500" },
  { id: "nagad", name: "নগদ", icon: "💰", color: "bg-orange-500" },
  { id: "rocket", name: "রকেট", icon: "🚀", color: "bg-purple-500" },
  { id: "upay", name: "উপায়", icon: "💵", color: "bg-blue-500" },
  { id: "cod", name: "ক্যাশ অন ডেলিভারি", icon: "🏠", color: "bg-green-500" },
];

export default function EnhancedCheckoutModal({ isOpen, onClose, onSuccess }: EnhancedCheckoutModalProps) {
  const { cart: items, totalPrice, totalItems, clearCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      district: "",
      thana: "",
      address: "",
      paymentMethod: undefined,
      paymentNumber: "",
      trxId: "",
      specialInstructions: "",
      agreeToTerms: false,
    },
  });

  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedDistrict = form.watch("district");

  // Update thana options when district changes
  React.useEffect(() => {
    if (watchedDistrict !== selectedDistrict) {
      setSelectedDistrict(watchedDistrict);
      form.setValue("thana", "");
    }
  }, [watchedDistrict, selectedDistrict, form]);

  const deliveryCharge = totalPrice > 1000 ? 0 : 60;
  const finalTotal = totalPrice + deliveryCharge;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare order data
      const orderData = {
        customer_name: data.customerName,
        phone: data.phone,
        email: data.email || null,
        district: data.district,
        thana: data.thana,
        address: data.address,
        payment_info: {
          method: data.paymentMethod,
          payment_number: data.paymentNumber || null,
          trx_id: data.trxId || null,
        },
        special_instructions: data.specialInstructions || null,
        items: items.map((item: any) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          customization: item.customization || null,
        })),
        total_amount: finalTotal,
        delivery_charge: deliveryCharge,
      };

      // Submit order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "অর্ডার সাবমিট করতে সমস্যা হয়েছে");
      }

      const result = await response.json();
      
      // Clear cart and notify success
      clearCart();
      toast({
        title: "অর্ডার সফল!",
        description: `আপনার অর্ডার সফলভাবে সাবমিট হয়েছে। ট্র্যাকিং আইডি: ${result.tracking_id}`,
      });

      // Call success callback
      onSuccess?.(result.id);
      onClose();

    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message || "অর্ডার সাবমিট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              কার্ট খালি
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">আপনার কার্টে কোনো পণ্য নেই</p>
            <Button onClick={onClose}>পণ্য দেখুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-6 h-6" />
            অর্ডার সম্পন্ন করুন
          </DialogTitle>
          <DialogDescription>
            আপনার অর্ডারের বিস্তারিত তথ্য দিয়ে অর্ডার সম্পন্ন করুন
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold ${
                currentStep >= step 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-gray-100 text-gray-400 border-gray-300'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Cart Review */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    অর্ডার রিভিউ ({totalItems} টি পণ্য)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item: any) => (
                      <div key={`${item.id}-${JSON.stringify(item.customization)}`} 
                           className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                          {item.customization && (
                            <Badge variant="outline" className="mt-1">
                              কাস্টমাইজড
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>পণ্যের মূল্য:</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                        {deliveryCharge === 0 ? "ফ্রি" : formatPrice(deliveryCharge)}
                      </span>
                    </div>
                    {totalPrice < 1000 && (
                      <p className="text-sm text-orange-600">
                        ১০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>মোট:</span>
                      <span className="text-green-600">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="button" onClick={nextStep} className="px-8">
                  পরবর্তী ধাপ
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Customer Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    গ্রাহকের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">পূর্ণ নাম *</Label>
                      <Input
                        id="customerName"
                        {...form.register("customerName")}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        className={form.formState.errors.customerName ? "border-red-500" : ""}
                      />
                      {form.formState.errors.customerName && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.customerName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">ফোন নম্বর *</Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="01XXXXXXXXX"
                        className={form.formState.errors.phone ? "border-red-500" : ""}
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="example@email.com"
                        className={form.formState.errors.email ? "border-red-500" : ""}
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    ডেলিভারি ঠিকানা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">জেলা *</Label>
                      <select
                        id="district"
                        {...form.register("district")}
                        className={`w-full p-2 border rounded-md ${form.formState.errors.district ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">জেলা নির্বাচন করুন</option>
                        {Object.keys(districtThanaData).map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      {form.formState.errors.district && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.district.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="thana">থানা/উপজেলা *</Label>
                      <select
                        id="thana"
                        {...form.register("thana")}
                        disabled={!selectedDistrict}
                        className={`w-full p-2 border rounded-md ${form.formState.errors.thana ? "border-red-500" : "border-gray-300"} ${!selectedDistrict ? "bg-gray-100" : ""}`}
                      >
                        <option value="">থানা নির্বাচন করুন</option>
                        {selectedDistrict && districtThanaData[selectedDistrict as keyof typeof districtThanaData]?.map((thana) => (
                          <option key={thana} value={thana}>
                            {thana}
                          </option>
                        ))}
                      </select>
                      {form.formState.errors.thana && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.thana.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
                      <Textarea
                        id="address"
                        {...form.register("address")}
                        placeholder="বাড়ির নম্বর, রাস্তার নাম, এলাকার নাম"
                        rows={3}
                        className={form.formState.errors.address ? "border-red-500" : ""}
                      />
                      {form.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  পূর্ববর্তী ধাপ
                </Button>
                <Button type="button" onClick={nextStep}>
                  পরবর্তী ধাপ
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    পেমেন্ট পদ্ধতি
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={watchedPaymentMethod}
                    onValueChange={(value) => form.setValue("paymentMethod", value as any)}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div key={method.id}>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center text-white text-sm`}>
                              {method.icon}
                            </div>
                            <span className="font-medium">{method.name}</span>
                            {method.id === "cod" && (
                              <Badge variant="secondary" className="ml-auto">
                                নিরাপদ
                              </Badge>
                            )}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  {form.formState.errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.paymentMethod.message}
                    </p>
                  )}

                  {/* Payment Details for Mobile Banking */}
                  {watchedPaymentMethod && watchedPaymentMethod !== "cod" && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        পেমেন্ট সম্পন্ন করুন
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="paymentNumber">পেমেন্ট নম্বর</Label>
                          <Input
                            id="paymentNumber"
                            {...form.register("paymentNumber")}
                            placeholder="যে নম্বর থেকে পেমেন্ট করেছেন"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trxId">ট্রানজেকশন আইডি</Label>
                          <Input
                            id="trxId"
                            {...form.register("trxId")}
                            placeholder="পেমেন্ট সম্পন্নের পর পাওয়া TrxID"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    বিশেষ নির্দেশনা (ঐচ্ছিক)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...form.register("specialInstructions")}
                    placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন (যেমন: ডেলিভারির সময়, গিফট র‍্যাপিং ইত্যাদি)"
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={form.watch("agreeToTerms")}
                      onCheckedChange={(checked) => form.setValue("agreeToTerms", checked as boolean)}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                      আমি <span className="text-primary font-semibold">শর্তাবলী ও নীতিমালা</span> পড়েছি এবং তা মেনে নিতে সম্মত।
                      আমি নিশ্চিত করছি যে প্রদত্ত তথ্যসমূহ সঠিক।
                    </Label>
                  </div>
                  {form.formState.errors.agreeToTerms && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.agreeToTerms.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      সর্বমোট পরিমাণ:
                    </span>
                    <span className="text-2xl text-green-600">{formatPrice(finalTotal)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    ১০০% নিরাপদ ও সুরক্ষিত লেনদেন
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  পূর্ববর্তী ধাপ
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.watch("agreeToTerms")}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      অর্ডার করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      অর্ডার সম্পন্ন করুন
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
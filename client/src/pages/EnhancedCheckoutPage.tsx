import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import {
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Gift,
  Star,
  Edit3,
  Eye,
  Package,
  HeartHandshake
} from "lucide-react";

// Bangladeshi districts and their thanas
const bangladeshiDistricts = {
  "ঢাকা": ["ওয়ারী", "রমনা", "তেজগাঁও", "দেলবোর", "শাহবাগ", "ধানমন্ডি", "নিউমার্কেট", "পল্টন", "মতিঝিল", "গুলশান", "বনানী", "উত্তরা"],
  "চট্টগ্রাম": ["কোতওয়ালী", "পাহাড়তলী", "চান্দগাঁও", "বায়েজিদ", "হালিশহর", "সীতাকুন্ড", "মিরসরাই", "ফটিকছড়ি"],
  "সিলেট": ["কোতওয়ালী", "শাহপরান", "দক্ষিণ সুরমা", "বিশ্বনাথ", "গোলাপগঞ্জ", "ওসমানীনগর", "বালাগঞ্জ"],
  "রাজশাহী": ["শাহ মখদুম", "পুঠিয়া", "দুর্গাপুর", "মোহনপুর", "চারঘাট", "বাগমারা", "গোদাগাড়ী"],
  "খুলনা": ["কোতওয়ালী", "সোনাডাঙ্গা", "খালিশপুর", "দৌলতপুর", "রূপসা", "পাইকগাছা", "ডুমুরিয়া"],
  "বরিশাল": ["কোতওয়ালী", "বন্দর", "বাকেরগঞ্জ", "উজিরপুর", "মেহেন্দিগঞ্জ", "মুলাদী"],
  "রংপুর": ["কোতওয়ালী", "গঙ্গাচড়া", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়"],
  "ময়মনসিংহ": ["কোতওয়ালী", "ত্রিশাল", "ভালুকা", "মুক্তাগাছা", "গৌরীপুর", "ধোবাউড়া"],
};

export default function EnhancedCheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    email: "",
    district: "",
    thana: "",
    address: "",
    landmark: "",
  });
  
  const [deliveryOptions, setDeliveryOptions] = useState({
    type: "standard", // standard, express, pickup
    instructions: "",
    preferredTime: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, bkash, rocket, nagad, card
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing
  const subtotal = getTotalPrice();
  const deliveryFee = deliveryOptions.type === "express" ? 120 : 
                     deliveryOptions.type === "pickup" ? 0 : 60;
  const discount = Math.min(promoDiscount, subtotal * 0.5); // Max 50% discount
  const total = subtotal + deliveryFee - discount;

  // Order submission mutation
  const submitOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: (data) => {
      clearCart();
      toast({
        title: "অর্ডার সফল!",
        description: `আপনার অর্ডার আইডি: ${data.tracking_id}`,
      });
      setLocation(`/tracking/${data.tracking_id}`);
    },
    onError: (error: any) => {
      toast({
        title: "অর্ডার জমা দিতে সমস্যা",
        description: error.message || "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    },
  });

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = "নাম প্রয়োজন";
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = "ফোন নম্বর প্রয়োজন";
    } else if (!/^01[3-9]\d{8}$/.test(customerInfo.phone)) {
      newErrors.phone = "সঠিক ফোন নম্বর দিন (যেমন: 01700000000)";
    }

    if (!customerInfo.district) {
      newErrors.district = "জেলা নির্বাচন করুন";
    }

    if (!customerInfo.thana) {
      newErrors.thana = "থানা নির্বাচন করুন";
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = "ঠিকানা প্রয়োজন";
    }

    if (!agreeTerms) {
      newErrors.terms = "শর্তাবলী মেনে নিতে হবে";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "ফর্ম সঠিকভাবে পূরণ করুন",
        description: "লাল চিহ্নিত ক্ষেত্রগুলো পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      customer_name: customerInfo.name,
      phone: customerInfo.phone,
      district: customerInfo.district,
      thana: customerInfo.thana,
      address: customerInfo.address,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization,
      })),
      total: total.toString(),
      payment_info: {
        method: paymentMethod,
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        promo_code: promoCode,
      },
      delivery_options: deliveryOptions,
      order_notes: orderNotes,
      customer_email: customerInfo.email,
      alternate_phone: customerInfo.alternatePhone,
      landmark: customerInfo.landmark,
    };

    try {
      await submitOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply promo code
  const applyPromoCode = () => {
    // Simple promo code logic - in real app, this would call API
    const promoCodes: Record<string, number> = {
      "WELCOME10": 0.1,
      "SAVE20": 0.2,
      "GIFT15": 0.15,
      "NEWYEAR": 0.25,
    };

    const discount = promoCodes[promoCode.toUpperCase()];
    if (discount) {
      setPromoDiscount(subtotal * discount);
      toast({
        title: "প্রমো কোড প্রয়োগ হয়েছে!",
        description: `${(discount * 100)}% ছাড় পেয়েছেন`,
      });
    } else {
      toast({
        title: "প্রমো কোড সঠিক নয়",
        description: "অন্য কোড চেষ্টা করুন",
        variant: "destructive",
      });
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      setLocation('/cart');
    }
  }, [items.length, setLocation]);

  if (items.length === 0) {
    return null; // Will redirect
  }

  const availableThanas = customerInfo.district ? bangladeshiDistricts[customerInfo.district as keyof typeof bangladeshiDistricts] || [] : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            অর্ডার সম্পূর্ণ করুন
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার তথ্য সঠিকভাবে দিন সুবিধাজনক ডেলিভারির জন্য
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>ব্যক্তিগত তথ্য</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">পূর্ণ নাম *</Label>
                      <Input
                        id="name"
                        placeholder="আপনার পূর্ণ নাম"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">ফোন নম্বর *</Label>
                      <Input
                        id="phone"
                        placeholder="01XXXXXXXXX"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <Label htmlFor="alternate-phone">বিকল্প ফোন</Label>
                      <Input
                        id="alternate-phone"
                        placeholder="01XXXXXXXXX (ঐচ্ছিক)"
                        value={customerInfo.alternatePhone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, alternatePhone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">ইমেইল</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com (ঐচ্ছিক)"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>ডেলিভারি ঠিকানা</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">জেলা *</Label>
                      <Select 
                        value={customerInfo.district} 
                        onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, district: value, thana: "" }))}
                      >
                        <SelectTrigger className={errors.district ? "border-red-500" : ""}>
                          <SelectValue placeholder="জেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(bangladeshiDistricts).map(district => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                    </div>

                    <div>
                      <Label htmlFor="thana">থানা/উপজেলা *</Label>
                      <Select 
                        value={customerInfo.thana} 
                        onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, thana: value }))}
                        disabled={!customerInfo.district}
                      >
                        <SelectTrigger className={errors.thana ? "border-red-500" : ""}>
                          <SelectValue placeholder="থানা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableThanas.map(thana => (
                            <SelectItem key={thana} value={thana}>
                              {thana}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.thana && <p className="text-red-500 text-sm mt-1">{errors.thana}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">বিস্তারিত ঠিকানা *</Label>
                    <Textarea
                      id="address"
                      placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকার নাম..."
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      className={errors.address ? "border-red-500" : ""}
                      rows={3}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="landmark">ল্যান্ডমার্ক</Label>
                    <Input
                      id="landmark"
                      placeholder="কাছাকাছি পরিচিত জায়গা (ঐচ্ছিক)"
                      value={customerInfo.landmark}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, landmark: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>ডেলিভারি অপশন</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={deliveryOptions.type} 
                    onValueChange={(value) => setDeliveryOptions(prev => ({ ...prev, type: value }))}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">সাধারণ ডেলিভারি</p>
                            <p className="text-sm text-gray-500">৩-৫ কার্যদিবস</p>
                          </div>
                          <Badge variant="outline">৳৬০</Badge>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">এক্সপ্রেস ডেলিভারি</p>
                            <p className="text-sm text-gray-500">১-২ কার্যদিবস</p>
                          </div>
                          <Badge variant="outline">৳১২০</Badge>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">স্টোর থেকে নিয়ে যাবেন</p>
                            <p className="text-sm text-gray-500">সাথে সাথে</p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800">ফ্রি</Badge>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div>
                    <Label htmlFor="delivery-instructions">বিশেষ নির্দেশনা</Label>
                    <Textarea
                      id="delivery-instructions"
                      placeholder="ডেলিভারি সম্পর্কে কোন বিশেষ নির্দেশনা..."
                      value={deliveryOptions.instructions}
                      onChange={(e) => setDeliveryOptions(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>পেমেন্ট পদ্ধতি</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">ক্যাশ অন ডেলিভারি</p>
                            <p className="text-sm text-gray-500">পণ্য পেয়ে টাকা দিন</p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800">সুরক্ষিত</Badge>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                      <RadioGroupItem value="bkash" id="bkash" disabled />
                      <Label htmlFor="bkash" className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">বিকাশ</p>
                            <p className="text-sm text-gray-500">শীঘ্রই আসছে</p>
                          </div>
                          <Badge variant="outline">শীঘ্রই</Badge>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="w-5 h-5" />
                    <span>অতিরিক্ত তথ্য</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="অর্ডার সম্পর্কে কোন বিশেষ নোট বা অনুরোধ..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Terms and Submit */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                        className={errors.terms ? "border-red-500" : ""}
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        আমি TryneX Lifestyle এর{" "}
                        <a href="/terms" className="text-primary hover:underline">
                          শর্তাবলী
                        </a>{" "}
                        এবং{" "}
                        <a href="/privacy" className="text-primary hover:underline">
                          গোপনীয়তা নীতি
                        </a>{" "}
                        সম্মত আছি।
                      </Label>
                    </div>
                    {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>অর্ডার জমা দিচ্ছি...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>অর্ডার নিশ্চিত করুন - {formatPrice(total)}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>আপনার অর্ডার</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={`${item.id}-${JSON.stringify(item.customization)}`} className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        পরিমাণ: {item.quantity}
                      </p>
                      {item.customization && (
                        <Badge variant="outline" className="text-xs mt-1">
                          কাস্টমাইজড
                        </Badge>
                      )}
                      <p className="text-sm font-medium text-primary mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">প্রমো কোড</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="প্রমো কোড"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim()}
                  >
                    প্রয়োগ
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">মূল্য বিবরণ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>ডেলিভারি ফি:</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : "ফ্রি"}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ছাড়:</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>মোট:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>১০০% নিরাপদ পেমেন্ট</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <HeartHandshake className="w-4 h-4 text-blue-500" />
                    <span>৭ দিন রিটার্ন গ্যারান্টি</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>২৪/৭ কাস্টমার সাপোর্ট</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Package,
  Truck,
  Upload,
  AlertCircle,
  Loader2
} from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  customerPhone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশি ফোন নম্বর দিন"),
  customerEmail: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  customerAddress: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন"),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  thana: z.string().min(1, "থানা/উপজেলা দিন"),
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "bank", "cod"], {
    required_error: "পেমেন্ট পদ্ধতি নির্বাচন করুন"
  }),
  trxId: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const districts = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"
];

const paymentMethods = [
  { value: "bkash", label: "বিকাশ", icon: Phone, number: "01765555593" },
  { value: "nagad", label: "নগদ", icon: Phone, number: "01765555593" },
  { value: "rocket", label: "রকেট", icon: Phone, number: "01765555593" },
  { value: "bank", label: "ব্যাংক ট্রান্সফার", icon: CreditCard, number: "" },
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", icon: Package, number: "" },
];

interface PerfectCheckoutPageProps {
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export default function PerfectCheckoutPage({ onSuccess, onBack }: PerfectCheckoutPageProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      district: "",
      thana: "",
      paymentMethod: "cod",
      trxId: "",
      notes: "",
    },
  });

  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate totals
  const subtotal = getTotalPrice();
  const deliveryCharge = subtotal >= 1600 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  const watchedPaymentMethod = form.watch("paymentMethod");

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle payment screenshot upload
  const handlePaymentScreenshot = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPaymentScreenshot(files[0]);
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // Convert screenshot to base64 if exists
      let paymentScreenshotBase64 = "";
      if (paymentScreenshot) {
        paymentScreenshotBase64 = await convertToBase64(paymentScreenshot);
      }

      const orderData = {
        items: items,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        district: data.district,
        thana: data.thana,
        paymentMethod: data.paymentMethod,
        trxId: data.trxId,
        paymentScreenshot: paymentScreenshotBase64,
        notes: data.notes,
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        total: total,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      clearCart();
      onSuccess(result.tracking_id || result.trackingId || result.id);
    },
    onError: (error) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">চেকআউট</h1>
          <p className="text-gray-600">আপনার অর্ডার সম্পন্ন করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    ব্যক্তিগত তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পূর্ণ নাম *</FormLabel>
                          <FormControl>
                            <Input placeholder="আপনার নাম" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ফোন নম্বর *</FormLabel>
                          <FormControl>
                            <Input placeholder="01XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ইমেইল (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    ডেলিভারি ঠিকানা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>জেলা *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="জেলা নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {districts.map((district) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="thana"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>থানা/উপজেলা *</FormLabel>
                          <FormControl>
                            <Input placeholder="থানা/উপজেলা" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>সম্পূর্ণ ঠিকানা *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="বাড়ি/ফ্ল্যাট নং, রোড নং, এলাকার নাম"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    পেমেন্ট পদ্ধতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {paymentMethods.map((method) => (
                              <div key={method.value}>
                                <RadioGroupItem
                                  value={method.value}
                                  id={method.value}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={method.value}
                                  className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-primary/5"
                                >
                                  <method.icon className="w-6 h-6" />
                                  <div>
                                    <div className="font-semibold">{method.label}</div>
                                    {method.number && (
                                      <div className="text-sm text-gray-600">{method.number}</div>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Details for Digital Methods */}
                  {watchedPaymentMethod && watchedPaymentMethod !== 'cod' && (
                    <div className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="trxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ট্রানজেকশন আইডি *</FormLabel>
                            <FormControl>
                              <Input placeholder="ট্রানজেকশন আইডি বা রেফারেন্স নম্বর" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Screenshot */}
                      <div>
                        <Label>পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">পেমেন্ট স্ক্রিনশট আপলোড করুন</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePaymentScreenshot(e.target.files)}
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            ফাইল নির্বাচন করুন
                          </Button>
                          {paymentScreenshot && (
                            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              {paymentScreenshot.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>অতিরিক্ত নোট (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    অর্ডার প্রক্রিয়াধীন...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    অর্ডার নিশ্চিত করুন
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-8">
            <Card className="bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-600" />
                  অর্ডার সারাংশ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <img
                        src={item.image_url || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-orange-600 font-bold">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>সাবটোটাল:</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      ডেলিভারি চার্জ:
                    </span>
                    <span className={`font-semibold ${deliveryCharge === 0 ? "text-green-600" : ""}`}>
                      {deliveryCharge === 0 ? "ফ্রি!" : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>সর্বমোট:</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Free Delivery Notice */}
                {deliveryCharge === 0 && subtotal > 0 && (
                  <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg border border-green-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">🎉 ফ্রি ডেলিভারি!</span>
                    </div>
                  </div>
                )}

                {/* Payment Method Notice */}
                {watchedPaymentMethod === 'cod' && (
                  <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg border border-blue-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>পণ্য পৌঁছানোর সময় টাকা দিন</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
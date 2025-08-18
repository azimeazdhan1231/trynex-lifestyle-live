import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";

import { 
  CreditCard, 
  Smartphone, 
  MapPin, 
  User, 
  Package,
  Truck,
  Shield,
  CheckCircle,
  ArrowLeft,
  Clock,
  Phone
} from "lucide-react";
import { useLocation } from "wouter";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন").regex(/^[0-9]+$/, "শুধুমাত্র সংখ্যা দিন"),
  email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  thana: z.string().min(1, "থানা দিন"),
  address: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন"),
  payment_method: z.enum(["bkash", "nagad", "rocket", "cod"], {
    required_error: "পেমেন্ট পদ্ধতি নির্বাচন করুন"
  }),
  payment_number: z.string().optional(),
  trx_id: z.string().optional(),
  special_instructions: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const districts = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"
];

const paymentMethods = [
  { value: "bkash", label: "বিকাশ", icon: Smartphone, number: "01XXXXXXXXX" },
  { value: "nagad", label: "নগদ", icon: Smartphone, number: "01XXXXXXXXX" },
  { value: "rocket", label: "রকেট", icon: Smartphone, number: "01XXXXXXXXX" },
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", icon: CreditCard, number: "" },
];

interface PerfectCheckoutPageProps {
  onSuccess?: (orderId: string) => void;
  onBack?: () => void;
}

const PerfectCheckoutPage = ({ onSuccess, onBack }: PerfectCheckoutPageProps) => {
  const { items, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      district: "",
      thana: "",
      address: "",
      payment_method: "cod",
      payment_number: "",
      trx_id: "",
      special_instructions: "",
    },
  });

  const watchedPaymentMethod = form.watch("payment_method");
  
  useEffect(() => {
    setSelectedPaymentMethod(watchedPaymentMethod);
  }, [watchedPaymentMethod]);

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: JSON.stringify(items),
          total_amount: total.toString(),
          delivery_fee: deliveryFee.toString(),
          subtotal: subtotal.toString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "অর্ডার সফল!",
        description: `আপনার অর্ডার নং: ${result.tracking_number}`,
        duration: 3000,
      });
      clearCart();
      if (onSuccess) {
        onSuccess(result.tracking_number);
      } else {
        setLocation(`/track/${result.tracking_number}`);
      }
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

  const handleStepChange = (step: number) => {
    if (step === 2) {
      // Validate step 1 fields
      const step1Fields = ['customer_name', 'phone', 'district', 'thana', 'address'] as const;
      const hasErrors = step1Fields.some(field => form.formState.errors[field]);
      
      if (hasErrors) {
        step1Fields.forEach(field => form.trigger(field));
        return;
      }
    }
    setCurrentStep(step);
  };

  const steps = [
    { number: 1, title: "ব্যক্তিগত তথ্য", icon: User },
    { number: 2, title: "পেমেন্ট", icon: CreditCard },
    { number: 3, title: "নিশ্চিতকরণ", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              চেকআউট
            </h1>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ফিরে যান
              </Button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 h-px w-16 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            ব্যক্তিগত তথ্য
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="customer_name"
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
                              name="phone"
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
                            name="email"
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

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
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
                            name="address"
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

                      <div className="flex justify-end">
                        <Button onClick={() => handleStepChange(2)} size="lg">
                          পরবর্তী
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            পেমেন্ট পদ্ধতি
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <FormField
                            control={form.control}
                            name="payment_method"
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
                                            <div className="font-medium">{method.label}</div>
                                            {method.number && (
                                              <div className="text-sm text-gray-500">{method.number}</div>
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

                          {selectedPaymentMethod && selectedPaymentMethod !== "cod" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-6 space-y-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="payment_number"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>পেমেন্ট নম্বর</FormLabel>
                                      <FormControl>
                                        <Input placeholder="01XXXXXXXXX" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="trx_id"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>ট্রানজেকশন আইডি</FormLabel>
                                      <FormControl>
                                        <Input placeholder="TXN123456789" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </motion.div>
                          )}

                          <FormField
                            control={form.control}
                            name="special_instructions"
                            render={({ field }) => (
                              <FormItem className="mt-6">
                                <FormLabel>বিশেষ নির্দেশনা (ঐচ্ছিক)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="কোনো বিশেষ অনুরোধ..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
                          পূর্ববর্তী
                        </Button>
                        <Button onClick={() => setCurrentStep(3)} size="lg">
                          পরবর্তী
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Order Confirmation */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            অর্ডার নিশ্চিতকরণ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-2">ডেলিভারি তথ্য</h4>
                              <div className="text-sm space-y-1">
                                <p><strong>নাম:</strong> {form.getValues("customer_name")}</p>
                                <p><strong>ফোন:</strong> {form.getValues("phone")}</p>
                                <p><strong>ঠিকানা:</strong> {form.getValues("address")}, {form.getValues("thana")}, {form.getValues("district")}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">পেমেন্ট তথ্য</h4>
                              <div className="text-sm space-y-1">
                                <p><strong>পদ্ধতি:</strong> {paymentMethods.find(m => m.value === selectedPaymentMethod)?.label}</p>
                                {form.getValues("payment_number") && (
                                  <p><strong>নম্বর:</strong> {form.getValues("payment_number")}</p>
                                )}
                                {form.getValues("trx_id") && (
                                  <p><strong>ট্রানজেকশন:</strong> {form.getValues("trx_id")}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>
                          পূর্ববর্তী
                        </Button>
                        <Button 
                          type="submit" 
                          size="lg" 
                          disabled={createOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {createOrderMutation.isPending ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              অর্ডার করা হচ্ছে...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              অর্ডার নিশ্চিত করুন (৳{total})
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  অর্ডার সামারি
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">পরিমাণ: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>সাবটোটাল ({getTotalItems()} টি পণ্য)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      ডেলিভারি চার্জ
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>মোট</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                {/* Security */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pt-4">
                  <Shield className="w-4 h-4" />
                  <span>নিরাপদ এবং সুরক্ষিত পেমেন্ট</span>
                </div>

                {/* Features */}
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    ক্যাশ অন ডেলিভারি
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    ৭ দিনের রিটার্ন পলিসি
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    ২৪/৭ কাস্টমার সাপোর্ট
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfectCheckoutPage;
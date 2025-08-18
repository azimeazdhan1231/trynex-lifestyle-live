import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { 
  Upload, 
  Phone, 
  MapPin, 
  Package, 
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Palette,
  Type,
  Image as ImageIcon,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus
} from "lucide-react";

const customOrderSchema = z.object({
  customerName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  customerPhone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশি ফোন নম্বর দিন"),
  customerEmail: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  customerAddress: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন"),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  thana: z.string().min(1, "থানা/উপজেলা দিন"),
  productName: z.string().min(2, "পণ্যের নাম দিন"),
  productType: z.string().min(1, "পণ্যের ধরণ নির্বাচন করুন"),
  quantity: z.number().min(1, "কমপক্ষে ১টি পরিমাণ দিন"),
  customizationInstructions: z.string().min(10, "কাস্টমাইজেশন বিবরণ দিন"),
  basePrice: z.number().min(0, "দাম ০ বা তার বেশি হতে হবে"),
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "bank", "cod"], {
    required_error: "পেমেন্ট পদ্ধতি নির্বাচন করুন"
  }),
  trxId: z.string().optional(),
});

type CustomOrderFormData = z.infer<typeof customOrderSchema>;

const productTypes = [
  { value: "t-shirt", label: "টি-শার্ট", basePrice: 450 },
  { value: "mug", label: "মগ", basePrice: 250 },
  { value: "water-bottle", label: "পানির বোতল", basePrice: 350 },
  { value: "photo-frame", label: "ফটো ফ্রেম", basePrice: 200 },
  { value: "keychain", label: "কি-চেইন", basePrice: 120 },
  { value: "pillow", label: "বালিশ", basePrice: 550 },
  { value: "canvas", label: "ক্যানভাস", basePrice: 800 },
  { value: "notebook", label: "নোটবুক", basePrice: 180 },
  { value: "phone-case", label: "ফোন কেস", basePrice: 300 },
  { value: "sticker", label: "স্টিকার", basePrice: 50 },
];

const districts = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"
];

const paymentMethods = [
  { value: "bkash", label: "বিকাশ", icon: Smartphone, number: "01765555593" },
  { value: "nagad", label: "নগদ", icon: Smartphone, number: "01765555593" },
  { value: "rocket", label: "রকেট", icon: Smartphone, number: "01765555593" },
  { value: "bank", label: "ব্যাংক ট্রান্সফার", icon: CreditCard, number: "" },
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", icon: CreditCard, number: "" },
];

function Smartphone({ className }: { className?: string }) {
  return <Phone className={className} />;
}

export default function NewCustomizePage() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Form state
  const form = useForm<CustomOrderFormData>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      district: "",
      thana: "",
      productName: "",
      productType: "",
      quantity: 1,
      customizationInstructions: "",
      basePrice: 0,
      paymentMethod: "cod",
      trxId: "",
    },
  });

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [customImages, setCustomImages] = useState<File[]>([]);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch form values for dynamic updates
  const watchedProductType = form.watch("productType");
  const watchedQuantity = form.watch("quantity");
  const watchedPaymentMethod = form.watch("paymentMethod");

  // Update base price when product type changes
  useState(() => {
    if (watchedProductType) {
      const productType = productTypes.find(p => p.value === watchedProductType);
      if (productType) {
        form.setValue("basePrice", productType.basePrice);
      }
    }
  });

  // Calculate totals
  const basePrice = form.watch("basePrice") || 0;
  const quantity = watchedQuantity || 1;
  const customizationCost = customImages.length * 50; // 50 taka per image
  const subtotal = (basePrice * quantity) + customizationCost;
  const deliveryCharge = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  // Convert images to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload
  const handleImageUpload = (files: FileList | null, type: 'custom' | 'payment') => {
    if (!files) return;

    if (type === 'custom') {
      const newImages = Array.from(files);
      if (customImages.length + newImages.length > 5) {
        toast({
          title: "সর্বোচ্চ ৫টি ছবি",
          description: "আপনি সর্বোচ্চ ৫টি ছবি আপলোড করতে পারবেন",
          variant: "destructive",
        });
        return;
      }
      setCustomImages(prev => [...prev, ...newImages]);
    } else if (type === 'payment' && files[0]) {
      setPaymentScreenshot(files[0]);
    }
  };

  // Remove custom image
  const removeCustomImage = (index: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
  };

  // Create custom order mutation
  const createCustomOrderMutation = useMutation({
    mutationFn: async (data: CustomOrderFormData) => {
      // Convert images to base64
      const customImagesBase64 = await Promise.all(
        customImages.map(img => convertToBase64(img))
      );

      let paymentScreenshotBase64 = "";
      if (paymentScreenshot) {
        paymentScreenshotBase64 = await convertToBase64(paymentScreenshot);
      }

      const orderData = {
        ...data,
        customizationImages: customImagesBase64,
        paymentScreenshot: paymentScreenshotBase64,
        totalPrice: total,
        customizationCost: customizationCost,
      };

      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create custom order');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "কাস্টম অর্ডার সফল!",
        description: `অর্ডার নং: ${result.tracking_id}`,
        duration: 5000,
      });
      setLocation(`/track/${result.tracking_id}`);
    },
    onError: (error) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomOrderFormData) => {
    createCustomOrderMutation.mutate(data);
  };

  const handleStepChange = (step: number) => {
    if (step === 2) {
      // Validate step 1 fields
      const step1Fields = ['customerName', 'customerPhone', 'district', 'thana', 'customerAddress'] as const;
      const hasErrors = step1Fields.some(field => form.formState.errors[field]);
      
      if (hasErrors) {
        step1Fields.forEach(field => form.trigger(field));
        return;
      }
    } else if (step === 3) {
      // Validate step 2 fields
      const step2Fields = ['productName', 'productType', 'customizationInstructions'] as const;
      const hasErrors = step2Fields.some(field => form.formState.errors[field]);
      
      if (hasErrors) {
        step2Fields.forEach(field => form.trigger(field));
        return;
      }
    }
    setCurrentStep(step);
  };

  const steps = [
    { number: 1, title: "ব্যক্তিগত তথ্য", icon: User },
    { number: 2, title: "পণ্য কাস্টমাইজেশন", icon: Palette },
    { number: 3, title: "পেমেন্ট", icon: CreditCard },
    { number: 4, title: "নিশ্চিতকরণ", icon: CheckCircle },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              কাস্টম অর্ডার
            </h1>
            <p className="text-gray-600">
              আপনার পছন্দমতো পণ্য ডিজাইন করুন
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <span className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-6 h-px w-8 lg:w-16 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
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

                      <div className="flex justify-end">
                        <Button onClick={() => handleStepChange(2)} size="lg">
                          পরবর্তী <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Product Customization */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            পণ্যের তথ্য
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="productName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>পণ্যের নাম *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="কাস্টম টি-শার্ট" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="productType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>পণ্যের ধরণ *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="পণ্যের ধরণ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {productTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label} - {formatPrice(type.basePrice)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পরিমাণ *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customizationInstructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>কাস্টমাইজেশন বিবরণ *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="আপনি কি ধরনের ডিজাইন চান? রং, সাইজ, টেক্সট, ছবি ইত্যাদি বিস্তারিত লিখুন"
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Image Upload */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            কাস্টম ছবি আপলোড (ঐচ্ছিক)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              আপনার পছন্দের ছবি আপলোড করুন (সর্বোচ্চ ৫টি)
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageUpload(e.target.files, 'custom')}
                              className="hidden"
                              ref={fileInputRef}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              ছবি নির্বাচন করুন
                            </Button>
                          </div>

                          {customImages.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {customImages.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">{file.name}</span>
                                    <Badge variant="outline">+{formatPrice(50)}</Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomImage(index)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
                          পূর্ববর্তী
                        </Button>
                        <Button onClick={() => handleStepChange(3)} size="lg">
                          পরবর্তী <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
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

                          {watchedPaymentMethod && watchedPaymentMethod !== 'cod' && (
                            <div className="mt-6 space-y-4">
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

                              <div>
                                <Label>পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e.target.files, 'payment')}
                                    className="hidden"
                                    id="payment-screenshot"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('payment-screenshot')?.click()}
                                  >
                                    স্ক্রিনশট আপলোড করুন
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

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>
                          পূর্ববর্তী
                        </Button>
                        <Button onClick={() => handleStepChange(4)} size="lg">
                          পরবর্তী <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirmation */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
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
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">গ্রাহক তথ্য:</h4>
                            <p><strong>নাম:</strong> {form.watch("customerName")}</p>
                            <p><strong>ফোন:</strong> {form.watch("customerPhone")}</p>
                            <p><strong>ঠিকানা:</strong> {form.watch("customerAddress")}, {form.watch("thana")}, {form.watch("district")}</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">পণ্যের তথ্য:</h4>
                            <p><strong>নাম:</strong> {form.watch("productName")}</p>
                            <p><strong>ধরণ:</strong> {productTypes.find(p => p.value === form.watch("productType"))?.label}</p>
                            <p><strong>পরিমাণ:</strong> {form.watch("quantity")}টি</p>
                            <p><strong>কাস্টম ছবি:</strong> {customImages.length}টি</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">পেমেন্ট:</h4>
                            <p><strong>পদ্ধতি:</strong> {paymentMethods.find(p => p.value === form.watch("paymentMethod"))?.label}</p>
                            {form.watch("trxId") && (
                              <p><strong>ট্রানজেকশন আইডি:</strong> {form.watch("trxId")}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(3)}>
                          পূর্ববর্তী
                        </Button>
                        <Button 
                          type="submit" 
                          size="lg" 
                          disabled={createCustomOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {createCustomOrderMutation.isPending ? "অর্ডার প্রক্রিয়াধীন..." : "অর্ডার নিশ্চিত করুন"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </Form>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    অর্ডার সারাংশ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchedProductType && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>বেস প্রাইস:</span>
                        <span>{formatPrice(basePrice)} × {quantity}</span>
                      </div>
                      
                      {customImages.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>কাস্টম ছবি:</span>
                          <span>{formatPrice(50)} × {customImages.length}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span>সাবটোটাল:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>ডেলিভারি চার্জ:</span>
                        <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                          {deliveryCharge === 0 ? "ফ্রি!" : formatPrice(deliveryCharge)}
                        </span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>মোট:</span>
                          <span className="text-green-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!watchedProductType && (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">পণ্যের ধরণ নির্বাচন করুন</p>
                    </div>
                  )}

                  <Progress value={(currentStep / steps.length) * 100} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">
                    ধাপ {currentStep} এর {steps.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
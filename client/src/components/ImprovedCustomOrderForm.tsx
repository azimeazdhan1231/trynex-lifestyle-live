import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Upload,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  DollarSign
} from "lucide-react";

interface CustomOrderData {
  name: string;
  whatsapp: string;
  address: string;
  productName: string;
  customization: string;
  quantity: number;
  paymentMethod: string;
  trxId?: string;
  paymentScreenshot?: File | null;
  customImages?: File[];
}

export default function ImprovedCustomOrderForm() {
  const [formData, setFormData] = useState<CustomOrderData>({
    name: "",
    whatsapp: "",
    address: "",
    productName: "",
    customization: "",
    quantity: 1,
    paymentMethod: "",
    trxId: "",
    paymentScreenshot: null,
    customImages: []
  });

  const [step, setStep] = useState(1); // 1: Instructions, 2: Payment & Submit
  const [customImages, setCustomImages] = useState<File[]>([]);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const { toast } = useToast();

  const customOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create custom order");
      }
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "কাস্টম অর্ডার সফল!",
        description: `আপনার অর্ডার নম্বর: ${order.id}। আমরা শীঘ্রই যোগাযোগ করব।`,
      });
      // Reset form
      setFormData({
        name: "",
        whatsapp: "",
        address: "",
        productName: "",
        customization: "",
        quantity: 1,
        paymentMethod: "",
        trxId: "",
        paymentScreenshot: null,
        customImages: []
      });
      setCustomImages([]);
      setPaymentScreenshot(null);
      setStep(1);
    },
    onError: (error: any) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: error.message || "অর্ডার করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof CustomOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'custom' | 'payment') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'custom') {
      const newImages = Array.from(files).slice(0, 5); // Max 5 images
      setCustomImages(prev => [...prev, ...newImages].slice(0, 5));
    } else if (type === 'payment' && files[0]) {
      setPaymentScreenshot(files[0]);
    }
  };

  const removeCustomImage = (index: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.address || !formData.productName || !formData.customization) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সব প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number
    if (!/^01[3-9]\d{8}$/.test(formData.whatsapp)) {
      toast({
        title: "ভুল ফোন নম্বর",
        description: "সঠিক বাংলাদেশি ফোন নম্বর দিন (01XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentMethod) {
      toast({
        title: "পেমেন্ট পদ্ধতি নির্বাচন করুন",
        description: "অগ্রিম পেমেন্টের জন্য পেমেন্ট পদ্ধতি নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (formData.paymentMethod !== 'cod' && !formData.trxId) {
      toast({
        title: "ট্রানজেকশন আইডি প্রয়োজন",
        description: "পেমেন্টের ট্রানজেকশন আইডি দিন",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      ...formData,
      totalPrice: 100, // Fixed advance payment
      customImages: customImages.length,
      paymentScreenshot: paymentScreenshot ? paymentScreenshot.name : null,
    };

    customOrderMutation.mutate(orderData);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                <Package className="w-6 h-6" />
                কাস্টম অর্ডার - ধাপ ১
              </CardTitle>
              <p className="text-center text-green-100">আপনার পছন্দের পণ্যের বিবরণ দিন</p>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              <form onSubmit={handleStepOne} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">গ্রাহকের তথ্য</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">নাম *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="name"
                          placeholder="আপনার পূর্ণ নাম"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">হোয়াটসঅ্যাপ নম্বর *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">ঠিকানা *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <Textarea
                        id="address"
                        placeholder="আপনার সম্পূর্ণ ঠিকানা (বিভাগ, জেলা, থানা, গ্রাম/মহল্লা সহ)"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="pl-10 min-h-[80px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">পণ্যের তথ্য</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productName">পণ্যের নাম *</Label>
                    <Input
                      id="productName"
                      placeholder="যে পণ্যটি চান (যেমন: কাস্টম মগ, টি-শার্ট, ফটো ফ্রেম)"
                      value={formData.productName}
                      onChange={(e) => handleInputChange("productName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">পরিমাণ</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customization">কাস্টমাইজেশন বিবরণ *</Label>
                    <Textarea
                      id="customization"
                      placeholder="আপনি পণ্যে কি ধরনের কাস্টমাইজেশন চান? যেমন: নাম, ছবি, টেক্সট, রং, সাইজ ইত্যাদি বিস্তারিত লিখুন"
                      value={formData.customization}
                      onChange={(e) => handleInputChange("customization", e.target.value)}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  {/* Custom Images Upload */}
                  <div className="space-y-2">
                    <Label>কাস্টম ছবি আপলোড করুন (ঐচ্ছিক)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">আপনার পছন্দের ছবি আপলোড করুন (সর্বোচ্চ ৫টি)</p>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, 'custom')}
                        className="hidden"
                        id="custom-images"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('custom-images')?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        ছবি নির্বাচন করুন
                      </Button>
                    </div>
                    {customImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customImages.map((file, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {file.name}
                            <button
                              type="button"
                              onClick={() => removeCustomImage(index)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 text-lg"
                  >
                    পরবর্তী ধাপ: পেমেন্ট →
                  </Button>
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">জরুরি নির্দেশনা:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>সব তথ্য সঠিকভাবে পূরণ করুন</li>
                        <li>কাস্টমাইজেশনের বিস্তারিত বিবরণ দিন</li>
                        <li>ছবি আপলোড করলে কাজ আরও ভালো হবে</li>
                        <li>পরবর্তী ধাপে ১০০ টাকা অগ্রিম পেমেন্ট করতে হবে</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Payment & Submit
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              কাস্টম অর্ডার - ধাপ ২
            </CardTitle>
            <p className="text-center text-green-100">অগ্রিম পেমেন্ট করুন (১০০ টাকা)</p>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">অর্ডার সারাংশ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>পণ্য:</span>
                  <span className="font-medium">{formData.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span>পরিমাণ:</span>
                  <span className="font-medium">{formData.quantity} টি</span>
                </div>
                <div className="flex justify-between">
                  <span>গ্রাহক:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-green-600">
                  <span>অগ্রিম পেমেন্ট:</span>
                  <span>১০০ টাকা</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">পেমেন্ট তথ্য</h3>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium mb-3">
                    অর্ডার নিশ্চিত করতে ১০০ টাকা অগ্রিম পেমেন্ট করুন:
                  </p>
                  <p className="text-orange-900 font-bold text-lg mb-2">
                    bKash/Nagad: 01747292277
                  </p>
                  <p className="text-orange-600 text-xs">
                    বাকি টাকা পণ্য ডেলিভারির সময় পরিশোধ করুন
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">পেমেন্ট মাধ্যম</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">বিকাশ</SelectItem>
                      <SelectItem value="nagad">নগদ</SelectItem>
                      <SelectItem value="rocket">রকেট</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="trxId">ট্রানজেকশন আইডি *</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="trxId"
                          placeholder="ট্রানজেকশন আইডি বা রেফারেন্স নম্বর"
                          value={formData.trxId}
                          onChange={(e) => handleInputChange("trxId", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'payment')}
                          className="hidden"
                          id="payment-screenshot"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('payment-screenshot')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          পেমেন্ট স্ক্রিনশট আপলোড করুন
                        </Button>
                        {paymentScreenshot && (
                          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {paymentScreenshot.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  ← পূর্ববর্তী ধাপ
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3"
                  disabled={customOrderMutation.isPending}
                >
                  {customOrderMutation.isPending ? "অর্ডার প্রক্রিয়াকরণ হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              </div>

              {/* Final Help Text */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">অর্ডার সম্পূর্ণ করার পর:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>আমরা ১-২ ঘন্টার মধ্যে যোগাযোগ করব</li>
                      <li>পণ্যের চূড়ান্ত দাম এবং ডেলিভারি সময় জানাব</li>
                      <li>আপনার কাস্টমাইজেশন অনুযায়ী পণ্য তৈরি করব</li>
                      <li>ডেলিভারির সময় বাকি টাকা পরিশোধ করুন</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
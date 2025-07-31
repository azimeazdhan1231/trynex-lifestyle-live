import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
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
  User
} from "lucide-react";

interface CustomOrderData {
  name: string;
  whatsapp: string;
  address: string;
  productName: string;
  customization: string;
  quantity: number;
  totalPrice: number;
  paymentMethod: string;
  trxId?: string;
  paymentScreenshot?: string;
}

export default function CustomOrderForm() {
  const [formData, setFormData] = useState<CustomOrderData>({
    name: "",
    whatsapp: "",
    address: "",
    productName: "",
    customization: "",
    quantity: 1,
    totalPrice: 0,
    paymentMethod: "",
    trxId: "",
    paymentScreenshot: ""
  });

  const [customImages, setCustomImages] = useState<File[]>([]);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  const { toast } = useToast();

  const customOrderMutation = useMutation({
    mutationFn: async (data: CustomOrderData) => {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "অর্ডার সফল হয়েছে",
        description: `আপনার অর্ডার আইডি: ${response.tracking_id}`,
      });
      // Reset form
      setFormData({
        name: "",
        whatsapp: "",
        address: "",
        productName: "",
        customization: "",
        quantity: 1,
        totalPrice: 0,
        paymentMethod: "",
        trxId: "",
        paymentScreenshot: ""
      });
      setCustomImages([]);
      setPaymentScreenshot(null);
      setShowPaymentFields(false);
    },
    onError: (error: any) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: error.message || "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof CustomOrderData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'custom' | 'payment') => {
    const files = event.target.files;
    if (!files) return;

    if (type === 'custom') {
      const newImages = Array.from(files);
      setCustomImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
      
      // Convert images to base64 and add to customization
      newImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            customization: prev.customization + `\n[Image: ${file.name}]\n${base64}`
          }));
        };
        reader.readAsDataURL(file);
      });
    } else if (type === 'payment') {
      const file = files[0];
      setPaymentScreenshot(file);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({ ...prev, paymentScreenshot: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.whatsapp || !formData.address || !formData.productName) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সব জরুরি তথ্য পূরণ করুন",
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

    if (formData.paymentMethod && !formData.trxId) {
      toast({
        title: "পেমেন্ট তথ্য অসম্পূর্ণ",
        description: "ট্রানজেকশন আইডি দিন",
        variant: "destructive",
      });
      return;
    }

    customOrderMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Package className="w-6 h-6" />
              কাস্টম অর্ডার
            </CardTitle>
            <p className="text-center text-green-100">আপনার পছন্দমতো পণ্য অর্ডার করুন</p>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="totalPrice">আনুমানিক দাম (টাকা)</Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.totalPrice || ""}
                      onChange={(e) => handleInputChange("totalPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
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
                      ছবি নির্বাচন করুন
                    </Button>
                  </div>
                  {customImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customImages.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">পেমেন্ট তথ্য</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentFields(!showPaymentFields)}
                  >
                    {showPaymentFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPaymentFields ? "লুকান" : "দেখান"}
                  </Button>
                </div>

                {showPaymentFields && (
                  <>
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
                          <SelectItem value="bank">ব্যাংক ট্রান্সফার</SelectItem>
                          <SelectItem value="cod">ক্যাশ অন ডেলিভারি</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.paymentMethod && formData.paymentMethod !== 'cod' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="trxId">ট্রানজেকশন আইডি</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="trxId"
                              placeholder="ট্রানজেকশন আইডি বা রেফারেন্স নম্বর"
                              value={formData.trxId}
                              onChange={(e) => handleInputChange("trxId", e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>পেমেন্ট স্ক্রিনশট</Label>
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
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 text-lg"
                  disabled={customOrderMutation.isPending}
                >
                  {customOrderMutation.isPending ? "অর্ডার প্রক্রিয়াকরণ হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
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
                      <li>উচ্চ মানের ছবি আপলোড করুন</li>
                      <li>অর্ডারের পর আমরা ২৪ ঘন্টার মধ্যে যোগাযোগ করব</li>
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
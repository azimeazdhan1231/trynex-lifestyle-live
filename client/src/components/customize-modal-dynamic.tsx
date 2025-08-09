import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// RadioGroup component inline since it's not available
const RadioGroup = ({ value, onValueChange, children, className }: any) => (
  <div className={className}>{children}</div>
);

const RadioGroupItem = ({ value, id }: any) => (
  <input
    type="radio"
    id={id}
    name="radio-group"
    value={value}
    className="mr-2"
  />
);
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, Upload, X, Plus, Minus, MessageCircle, ImageIcon, 
  Camera, Check, Package, CreditCard, MessageSquare, Globe 
} from "lucide-react";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
}

interface CustomImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
}

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  thana: string;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { value: 'white', label: 'সাদা', hex: '#ffffff' },
  { value: 'black', label: 'কালো', hex: '#000000' },
  { value: 'red', label: 'লাল', hex: '#ef4444' },
  { value: 'blue', label: 'নীল', hex: '#3b82f6' },
  { value: 'green', label: 'সবুজ', hex: '#10b981' },
  { value: 'yellow', label: 'হলুদ', hex: '#f59e0b' }
];

const DISTRICTS = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'];

export default function CustomizeModalDynamic({ product, isOpen, onClose, onAddToCart }: CustomizeModalProps) {
  const { toast } = useToast();
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<'customize' | 'customer' | 'confirm'>('customize');
  
  // Form states
  const [customization, setCustomization] = useState({
    size: '',
    color: '',
    quantity: 1,
    instructions: '',
    specialRequests: ''
  });
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    thana: ''
  });
  
  const [customImages, setCustomImages] = useState<CustomImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderMethod, setOrderMethod] = useState<'website' | 'whatsapp'>('website');

  // Detect mobile/responsive changes
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('customize');
      setCustomization({
        size: '',
        color: '',
        quantity: 1,
        instructions: '',
        specialRequests: ''
      });
      setCustomerData({
        name: '',
        phone: '',
        email: '',
        address: '',
        district: '',
        thana: ''
      });
      setCustomImages([]);
      setOrderMethod('website');
    }
  }, [isOpen]);

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ফাইল সাইজ বড়",
          description: "অনুগ্রহ করে ৫MB এর ছোট ফাইল আপলোড করুন",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: CustomImageFile = {
          id: Date.now().toString() + Math.random(),
          file,
          preview: e.target?.result as string,
          name: file.name
        };
        setCustomImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (id: string) => {
    setCustomImages(prev => prev.filter(img => img.id !== id));
  };

  // Calculate total price
  const calculateTotal = () => {
    const basePrice = Number(product?.price || 0);
    const customizationFee = customImages.length > 0 ? 100 : 0;
    return (basePrice + customizationFee) * customization.quantity;
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সাইজ এবং কালার নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddToCart(product, {
        ...customization,
        customImages: customImages.map(img => ({
          name: img.name,
          dataUrl: img.preview
        })),
        totalPrice: calculateTotal()
      });
      
      toast({
        title: "কার্টে যোগ করা হয়েছে!",
        description: "পণ্যটি কাস্টমাইজেশন সহ কার্টে যোগ করা হয়েছে",
      });
      onClose();
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle direct website order
  const handleDirectOrder = async () => {
    if (!product || !customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সাইজ এবং কালার নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (step === 'customize') {
      setStep('customer');
      return;
    }

    if (step === 'customer') {
      if (!customerData.name || !customerData.phone || !customerData.address) {
        toast({
          title: "গ্রাহকের তথ্য অসম্পূর্ণ",
          description: "অনুগ্রহ করে সব তথ্য পূরণ করুন",
          variant: "destructive",
        });
        return;
      }
      setStep('confirm');
      return;
    }

    // Submit order to website
    setIsSubmitting(true);
    try {
      const orderData = {
        customer_name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        district: customerData.district,
        thana: customerData.thana,
        items: [{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: customization.quantity,
          customization: {
            size: customization.size,
            color: customization.color,
            images: customImages.map(img => ({
              name: img.name,
              dataUrl: img.preview
            })),
            instructions: customization.instructions,
            specialRequests: customization.specialRequests
          }
        }],
        total: calculateTotal(),
        payment_info: { method: 'pending' },
        custom_instructions: `${customization.instructions}\n${customization.specialRequests}`.trim(),
        custom_images: JSON.stringify(customImages.map(img => ({
          name: img.name,
          dataUrl: img.preview
        })))
      };

      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: orderData
      });

      toast({
        title: "অর্ডার সফল!",
        description: `আপনার অর্ডার #${response.order.tracking_id} সফলভাবে তৈরি হয়েছে`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "অর্ডার তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = () => {
    if (!product || !customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সাইজ এবং কালার নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const message = `
🛍️ নতুন কাস্টম অর্ডার:

📦 পণ্য: ${product.name}
💰 দাম: ${formatPrice(Number(product.price))}
📏 সাইজ: ${customization.size}
🎨 কালার: ${COLORS.find(c => c.value === customization.color)?.label}
🔢 পরিমাণ: ${customization.quantity}
📝 নির্দেশনা: ${customization.instructions || 'নেই'}
📋 বিশেষ অনুরোধ: ${customization.specialRequests || 'নেই'}
📸 ছবি সংখ্যা: ${customImages.length}টি

💵 মোট: ${formatPrice(calculateTotal())}

অনুগ্রহ করে এই অর্ডারটি নিশ্চিত করুন।
    `.trim();

    window.open(`https://wa.me/8801700000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!product) return null;

  // Dynamic modal size based on device and step
  const getModalSize = () => {
    if (isMobile) return "w-[95vw] max-w-none h-[90vh] max-h-none";
    if (step === 'customize') return "max-w-4xl";
    return "max-w-2xl";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalSize()} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Package className="w-5 h-5" />
            {step === 'customize' && 'কাস্টমাইজ করুন'}
            {step === 'customer' && 'গ্রাহকের তথ্য'}
            {step === 'confirm' && 'অর্ডার নিশ্চিত করুন'}
          </DialogTitle>
          <DialogDescription>
            {step === 'customize' && 'আপনার পছন্দ অনুযায়ী পণ্যটি কাস্টমাইজ করুন'}
            {step === 'customer' && 'ডেলিভারির জন্য আপনার তথ্য দিন'}
            {step === 'confirm' && 'অর্ডার চূড়ান্ত করার আগে পর্যালোচনা করুন'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {['customize', 'customer', 'confirm'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName ? 'bg-green-500 text-white' : 
                  ['customize', 'customer', 'confirm'].indexOf(step) > index ? 'bg-green-200 text-green-800' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>

          {step === 'customize' && (
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Product Preview */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>মূল দাম:</span>
                        <span className="font-medium">{formatPrice(Number(product.price))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>কাস্টমাইজেশন ({customImages.length} ছবি):</span>
                        <span className="font-medium">{formatPrice(customImages.length * 100)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>মোট:</span>
                        <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customization Options */}
              <div className="space-y-4">
                {/* Size Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">সাইজ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => setCustomization(prev => ({ ...prev, size }))}
                          className={`p-2 text-sm font-medium border rounded-lg transition-all ${
                            customization.size === size 
                              ? 'border-green-500 bg-green-50 text-green-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Color Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">রং</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                            customization.color === color.value 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm">{color.label}</span>
                          {customization.color === color.value && (
                            <Check className="w-4 h-4 text-green-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quantity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">পরিমাণ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomization(prev => ({ 
                          ...prev, 
                          quantity: Math.max(1, prev.quantity - 1) 
                        }))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{customization.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomization(prev => ({ 
                          ...prev, 
                          quantity: prev.quantity + 1 
                        }))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">কাস্টম ছবি আপলোড</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <div className="space-y-2">
                            <Camera className="w-8 h-8 mx-auto text-gray-400" />
                            <div className="text-sm text-gray-600">
                              ছবি আপলোড করুন ক্লিক করুন
                            </div>
                            <div className="text-xs text-gray-500">
                              সর্বোচ্চ ৫MB, প্রতিটি ছবির জন্য ১০০ টাকা
                            </div>
                          </div>
                        </Label>
                      </div>

                      {customImages.length > 0 && (
                        <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {customImages.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.preview}
                                alt={image.name}
                                className="w-full h-16 object-cover rounded border"
                              />
                              <button
                                onClick={() => removeImage(image.id)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">কাস্টমাইজেশনের নির্দেশনা</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="আপনার কাস্টমাইজেশনের বিস্তারিত লিখুন..."
                      value={customization.instructions}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        instructions: e.target.value 
                      }))}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Special Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">বিশেষ অনুরোধ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="কোন বিশেষ অনুরোধ থাকলে লিখুন..."
                      value={customization.specialRequests}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        specialRequests: e.target.value 
                      }))}
                      rows={2}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 'customer' && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>গ্রাহকের তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-name">নাম *</Label>
                      <Input
                        id="customer-name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="আপনার নাম লিখুন"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">ফোন নম্বর *</Label>
                      <Input
                        id="customer-phone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="০১৭XXXXXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customer-email">ইমেইল</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">জেলা</Label>
                      <Select value={customerData.district} onValueChange={(value) => setCustomerData(prev => ({ ...prev, district: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="জেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICTS.map(district => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="thana">থানা/উপজেলা</Label>
                      <Input
                        id="thana"
                        value={customerData.thana}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, thana: e.target.value }))}
                        placeholder="থানা/উপজেলার নাম"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">ঠিকানা *</Label>
                    <Textarea
                      id="address"
                      value={customerData.address}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="সম্পূর্ণ ঠিকানা লিখুন..."
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>অর্ডার পর্যালোচনা</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">পণ্যের তথ্য</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>নাম:</strong> {product.name}</p>
                        <p><strong>সাইজ:</strong> {customization.size}</p>
                        <p><strong>রং:</strong> {COLORS.find(c => c.value === customization.color)?.label}</p>
                        <p><strong>পরিমাণ:</strong> {customization.quantity}</p>
                        <p><strong>কাস্টম ছবি:</strong> {customImages.length}টি</p>
                        <p><strong>মোট দাম:</strong> {formatPrice(calculateTotal())}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">গ্রাহকের তথ্য</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>নাম:</strong> {customerData.name}</p>
                        <p><strong>ফোন:</strong> {customerData.phone}</p>
                        <p><strong>ইমেইল:</strong> {customerData.email || 'দেওয়া হয়নি'}</p>
                        <p><strong>ঠিকানা:</strong> {customerData.address}</p>
                        <p><strong>জেলা:</strong> {customerData.district}</p>
                      </div>
                    </div>
                  </div>

                  {(customization.instructions || customization.specialRequests) && (
                    <div>
                      <h4 className="font-medium mb-2">অতিরিক্ত তথ্য</h4>
                      {customization.instructions && (
                        <p className="text-sm mb-2"><strong>নির্দেশনা:</strong> {customization.instructions}</p>
                      )}
                      {customization.specialRequests && (
                        <p className="text-sm"><strong>বিশেষ অনুরোধ:</strong> {customization.specialRequests}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex gap-3 pt-4 border-t ${isMobile ? 'flex-col' : 'flex-row'}`}>
            {step === 'customize' && (
              <>
                <Button
                  onClick={handleAddToCart}
                  disabled={isSubmitting || !customization.size || !customization.color}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isSubmitting ? "যোগ করা হচ্ছে..." : "কার্টে যোগ করুন"}
                </Button>
                
                <Button
                  onClick={handleDirectOrder}
                  disabled={isSubmitting || !customization.size || !customization.color}
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {isSubmitting ? "প্রেরণ করা হচ্ছে..." : "ওয়েবসাইটে অর্ডার করুন"}
                </Button>
                
                <Button
                  onClick={handleWhatsAppOrder}
                  disabled={isSubmitting || !customization.size || !customization.color}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  হোয়াটসঅ্যাপে অর্ডার
                </Button>
              </>
            )}

            {step === 'customer' && (
              <>
                <Button
                  onClick={() => setStep('customize')}
                  variant="outline"
                  className="flex-1"
                >
                  পূর্ববর্তী
                </Button>
                <Button
                  onClick={handleDirectOrder}
                  disabled={!customerData.name || !customerData.phone || !customerData.address}
                  className="flex-1"
                >
                  পরবর্তী
                </Button>
              </>
            )}

            {step === 'confirm' && (
              <>
                <Button
                  onClick={() => setStep('customer')}
                  variant="outline"
                  className="flex-1"
                >
                  পূর্ববর্তী
                </Button>
                <Button
                  onClick={handleDirectOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isSubmitting ? "অর্ডার করা হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              </>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              disabled={isSubmitting}
              className={isMobile ? "w-full" : ""}
            >
              বাতিল
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Upload, 
  X, 
  Plus, 
  Minus, 
  MessageCircle, 
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DISTRICTS, THANAS_BY_DISTRICT, formatPrice, calculateDeliveryFee } from "@/lib/constants";
import OrderSuccessModal from "@/components/order-success-modal";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { value: 'white', label: 'সাদা', color: '#ffffff' },
  { value: 'black', label: 'কালো', color: '#000000' },
  { value: 'red', label: 'লাল', color: '#ef4444' },
  { value: 'blue', label: 'নীল', color: '#3b82f6' },
  { value: 'green', label: 'সবুজ', color: '#10b981' },
  { value: 'yellow', label: 'হলুদ', color: '#f59e0b' }
];

export default function CustomizeModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart
}: CustomizeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customization, setCustomization] = useState({
    size: '',
    color: '',
    quantity: 1,
    customText: '',
    specialInstructions: '',
    customImage: null as File | null
  });

  const [orderMode, setOrderMode] = useState<'cart' | 'direct'>('cart');
  const [orderFormData, setOrderFormData] = useState({
    customer_name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    payment_number: "",
    trx_id: ""
  });

  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(80);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!product) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ফাইল খুব বড়",
          description: "৫MB এর কম সাইজের ছবি আপলোড করুন",
          variant: "destructive",
        });
        return;
      }

      setCustomization(prev => ({ ...prev, customImage: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update delivery fee when district changes
  React.useEffect(() => {
    if (orderFormData.district) {
      const subtotal = Number(product.price) * customization.quantity;
      const fee = calculateDeliveryFee(orderFormData.district, subtotal);
      setDeliveryFee(fee);
      setAvailableThanas(THANAS_BY_DISTRICT[orderFormData.district] || []);
      setOrderFormData(prev => ({ ...prev, thana: "" }));
    }
  }, [orderFormData.district, product.price, customization.quantity]);

  const createDirectOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response;
    },
    onSuccess: (order) => {
      setCompletedOrder(order);
      setShowSuccessModal(true);
      setShowOrderForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "✅ অর্ডার সফল হয়েছে!",
        description: `ট্র্যাকিং আইডি: ${order.tracking_id}\nআমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`,
        duration: 8000,
      });
    },
    onError: (error: any) => {
      console.error('Direct order error:', error);
      toast({
        title: "অর্ডার সমস্যা",
        description: "দয়া করে আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = async () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddToCart(product, customization);
      toast({
        title: "কার্টে যোগ হয়েছে!",
        description: `${product.name} কার্টে যোগ করা হয়েছে`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectOrder = () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }
    setOrderMode('direct');
    setShowOrderForm(true);
  };

  const validateOrderForm = () => {
    if (!orderFormData.customer_name.trim()) {
      toast({ title: "ত্রুটি", description: "নাম লিখুন", variant: "destructive" });
      return false;
    }
    if (!orderFormData.phone.trim() || !/^01[3-9]\d{8}$/.test(orderFormData.phone)) {
      toast({ title: "ত্রুটি", description: "সঠিক ফোন নম্বর লিখুন", variant: "destructive" });
      return false;
    }
    if (!orderFormData.district || !orderFormData.thana || !orderFormData.address.trim()) {
      toast({ title: "ত্রুটি", description: "সম্পূর্ণ ঠিকানা দিন", variant: "destructive" });
      return false;
    }
    if (!orderFormData.payment_number.trim() || !orderFormData.trx_id.trim()) {
      toast({ title: "ত্রুটি", description: "পেমেন্ট তথ্য দিন", variant: "destructive" });
      return false;
    }
    return true;
  };

  const submitDirectOrder = () => {
    if (!validateOrderForm()) return;

    const totalAmount = Number(product.price) * customization.quantity + deliveryFee;
    
    const orderData = {
      items: JSON.stringify([{
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: customization.quantity,
        customization: {
          size: customization.size,
          color: customization.color,
          customText: customization.customText,
          specialInstructions: customization.specialInstructions,
          customImage: customization.customImage ? 'uploaded' : null
        }
      }]),
      customer_name: orderFormData.customer_name,
      phone: orderFormData.phone,
      district: orderFormData.district,
      thana: orderFormData.thana,
      address: orderFormData.address,
      total: totalAmount.toString(),
      payment_info: JSON.stringify({
        method: "bkash_nagad",
        payment_number: orderFormData.payment_number,
        trx_id: orderFormData.trx_id,
        amount_paid: totalAmount
      }),
      special_instructions: customization.specialInstructions || '',
      status: "pending"
    };

    createDirectOrderMutation.mutate(orderData);
  };

  const handleWhatsAppOrder = () => {
    const message = `🛍️ অর্ডার: ${product.name}\n💰 দাম: ${formatPrice(Number(product.price))}\n📏 সাইজ: ${customization.size}\n🎨 রং: ${customization.color}\n🔢 পরিমাণ: ${customization.quantity}\n\nঅর্ডার করতে চাই!`;
    window.open(`https://wa.me/8801747292277?text=${encodeURIComponent(message)}`, '_blank');
  };

  const totalPrice = Number(product.price) * customization.quantity;

  if (showOrderForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার সম্পূর্ণ করুন</DialogTitle>
            <DialogDescription>
              {product.name} - {formatPrice(totalPrice + deliveryFee)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">গ্রাহকের তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>নাম *</Label>
                  <Input
                    placeholder="আপনার নাম"
                    value={orderFormData.customer_name}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>ফোন *</Label>
                  <Input
                    placeholder="01XXXXXXXXX"
                    value={orderFormData.phone}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">ডেলিভারি ঠিকানা</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>জেলা *</Label>
                  <Select value={orderFormData.district} onValueChange={(value) => setOrderFormData(prev => ({ ...prev, district: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>থানা *</Label>
                  <Select value={orderFormData.thana} onValueChange={(value) => setOrderFormData(prev => ({ ...prev, thana: value }))} disabled={!orderFormData.district}>
                    <SelectTrigger>
                      <SelectValue placeholder="থানা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableThanas.map((thana) => (
                        <SelectItem key={thana} value={thana}>{thana}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>বিস্তারিত ঠিকানা *</Label>
                <Textarea
                  placeholder="বাড়ির নম্বর, রাস্তার নাম, এলাকার নাম"
                  value={orderFormData.address}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">পেমেন্ট তথ্য</h3>
              <Card className="bg-orange-50 border-orange-200 p-4">
                <p className="text-orange-800 font-medium">bKash/Nagad: 01747292277</p>
                <p className="text-sm text-orange-700 mt-1">
                  {formatPrice(totalPrice + deliveryFee)} টাকা পাঠান এবং Transaction ID দিন
                </p>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>আপনার নম্বর *</Label>
                  <Input
                    placeholder="01XXXXXXXXX"
                    value={orderFormData.payment_number}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, payment_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Transaction ID *</Label>
                  <Input
                    placeholder="8G5A7X9B1C"
                    value={orderFormData.trx_id}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, trx_id: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">অর্ডার সামারি</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{product.name} × {customization.quantity}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>মোট</span>
                  <span className="text-green-600">{formatPrice(totalPrice + deliveryFee)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowOrderForm(false)} className="flex-1">
              ফিরে যান
            </Button>
            <Button 
              onClick={submitDirectOrder} 
              disabled={createDirectOrderMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {createDirectOrderMutation.isPending ? "অর্ডার করা হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen && !showOrderForm} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-orange-500" />
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {product.name} কাস্টমাইজ করুন
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    আপনার পছন্দ অনুযায়ী ডিজাইন করুন
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Product Image & Info */}
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={product.image_url || '/placeholder.jpg'} 
                    alt={product.name}
                    className="w-full h-80 object-cover rounded-xl border"
                  />
                  <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                    কাস্টমাইজেশন
                  </Badge>
                </div>

                <Card className="p-4 bg-gray-50">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">মোট দাম:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(totalPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">পরিমাণ:</p>
                        <p className="text-lg font-semibold">{customization.quantity}টি</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Customization Options */}
              <div className="space-y-6">
                {/* Size Selection */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    সাইজ নির্বাচন করুন *
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {SIZES.map((size) => (
                      <Button
                        key={size}
                        variant={customization.size === size ? "default" : "outline"}
                        onClick={() => setCustomization(prev => ({ ...prev, size }))}
                        className="h-12 font-medium"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    রং নির্বাচন করুন *
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLORS.map((color) => (
                      <Button
                        key={color.value}
                        variant={customization.color === color.value ? "default" : "outline"}
                        onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                        className="h-12 flex items-center gap-2 font-medium"
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.color }}
                        />
                        {color.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Text */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-2 block">
                    কাস্টম টেক্সট
                  </Label>
                  <Textarea
                    placeholder="আপনার পছন্দের টেক্সট লিখুন..."
                    value={customization.customText}
                    onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-2 block">
                    ছবি আপলোড করুন (ঐচ্ছিক)
                  </Label>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-12 border-dashed"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      ছবি আপলোড করুন
                    </Button>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded border" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 p-0"
                          onClick={() => {
                            setImagePreview(null);
                            setCustomization(prev => ({ ...prev, customImage: null }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-2 block">
                    পরিমাণ
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomization(prev => ({ 
                        ...prev, 
                        quantity: Math.max(1, prev.quantity - 1) 
                      }))}
                      disabled={customization.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {customization.quantity}
                    </span>
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
                </div>

                {/* Special Instructions */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-2 block">
                    বিশেষ নির্দেশনা
                  </Label>
                  <Textarea
                    placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                    value={customization.specialInstructions}
                    onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t bg-white p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || !customization.size || !customization.color}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 h-12 font-medium"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                কার্টে যোগ করুন
              </Button>

              <Button
                onClick={handleDirectOrder}
                disabled={isLoading || !customization.size || !customization.color}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 font-medium"
              >
                <Package className="w-4 h-4 mr-2" />
                এখনই অর্ডার করুন
              </Button>

              <Button
                onClick={handleWhatsAppOrder}
                disabled={isLoading || !customization.size || !customization.color}
                className="bg-green-600 hover:bg-green-700 text-white h-12 font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp অর্ডার
              </Button>
            </div>
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

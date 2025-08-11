import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Package, 
  CreditCard, 
  MapPin, 
  User, 
  Phone,
  AlertCircle,
  Clock,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DISTRICTS, THANAS_BY_DISTRICT, calculateDeliveryFee } from "@/lib/constants";

interface CustomOrderCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomOrderData {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  totalAmount: number;
  advancePayment: number;
  customization: {
    color?: string;
    size?: string;
    text?: string;
    font?: string;
    instructions?: string;
    uploaded_images?: string[];
    color_name?: string;
    timestamp?: string;
  };
}

export default function CustomOrderCheckout({ isOpen, onClose }: CustomOrderCheckoutProps) {
  const { toast } = useToast();
  const [customOrderData, setCustomOrderData] = useState<CustomOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    district: '',
    thana: '', 
    address: '',
    payment_number: '',
    trx_id: '',
    special_instructions: ''
  });

  useEffect(() => {
    if (isOpen) {
      const pendingOrder = localStorage.getItem('pendingCustomOrder');
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);
          setCustomOrderData(orderData);
        } catch (error) {
          console.error('Error parsing custom order data:', error);
        }
      }
    }
  }, [isOpen]);

  if (!customOrderData) return null;

  const deliveryFee = calculateDeliveryFee(formData.district, customOrderData.totalAmount);
  const finalAmount = customOrderData.advancePayment + deliveryFee;

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.phone || !formData.district || !formData.thana || !formData.address) {
      toast({
        title: "তথ্য পূরণ করুন",
        description: "সকল আবশ্যক ফিল্ড পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        district: formData.district,
        thana: formData.thana,
        address: formData.address,
        total_amount: customOrderData.totalAmount,
        delivery_fee: deliveryFee,
        advance_payment_amount: customOrderData.advancePayment,
        payment_info: {
          method: "advance_payment",
          payment_number: formData.payment_number,
          trx_id: formData.trx_id,
          amount_paid: finalAmount
        },
        items: [{
          id: customOrderData.productId,
          name: customOrderData.productName,
          price: customOrderData.productPrice,
          quantity: customOrderData.quantity,
          image_url: customOrderData.productImage,
          customization: customOrderData.customization
        }],
        custom_instructions: `${customOrderData.customization.instructions || ''}\n${formData.special_instructions || ''}`.trim(),
        custom_images: customOrderData.customization.uploaded_images || [],
        is_custom_order: true
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.removeItem('pendingCustomOrder');
        
        toast({
          title: "অর্ডার সম্পন্ন!",
          description: `আপনার অর্ডার নং: ${result.tracking_id}`,
          duration: 5000,
        });

        onClose();
      } else {
        throw new Error('Order creation failed');
      }
    } catch (error) {
      console.error('Custom order error:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            কাস্টম অর্ডার চেকআউট
          </DialogTitle>
          <DialogDescription className="text-center">
            আপনার কাস্টমাইজড পণ্যের জন্য অর্ডার সম্পূর্ণ করুন
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    অর্ডার সামারি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <img 
                      src={customOrderData.productImage} 
                      alt={customOrderData.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{customOrderData.productName}</h4>
                      <p className="text-sm text-gray-600">পরিমাণ: {customOrderData.quantity}</p>
                      <p className="text-lg font-bold text-green-600">৳{customOrderData.totalAmount}</p>
                    </div>
                  </div>

                  {/* Customization Details */}
                  {customOrderData.customization && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">কাস্টমাইজেশন:</h5>
                      <div className="space-y-1 text-sm">
                        {customOrderData.customization.color && (
                          <p><strong>রং:</strong> {customOrderData.customization.color_name}</p>
                        )}
                        {customOrderData.customization.size && (
                          <p><strong>সাইজ:</strong> {customOrderData.customization.size}</p>
                        )}
                        {customOrderData.customization.text && (
                          <p><strong>টেক্সট:</strong> "{customOrderData.customization.text}"</p>
                        )}
                        {customOrderData.customization.instructions && (
                          <p><strong>নির্দেশনা:</strong> {customOrderData.customization.instructions}</p>
                        )}
                        {customOrderData.customization.uploaded_images && customOrderData.customization.uploaded_images.length > 0 && (
                          <p><strong>আপলোড করা ছবি:</strong> {customOrderData.customization.uploaded_images.length}টি</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />
                  
                  {/* Payment Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>পণ্যের মূল্য:</span>
                      <span>৳{customOrderData.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ডেলিভারি চার্জ:</span>
                      <span>৳{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>অ্যাডভান্স পেমেন্ট:</span>
                      <span className="text-green-600">৳{finalAmount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ডেলিভারিতে প্রদেয়:</span>
                      <span>৳{customOrderData.totalAmount + deliveryFee - customOrderData.advancePayment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Information Form */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    ক্রেতার তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">নাম *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="আপনার নাম লিখুন"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">জেলা *</Label>
                      <Select value={formData.district} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value, thana: '' }))}>
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
                      <Label htmlFor="thana">থানা *</Label>
                      <Select value={formData.thana} onValueChange={(value) => setFormData(prev => ({ ...prev, thana: value }))} disabled={!formData.district}>
                        <SelectTrigger>
                          <SelectValue placeholder="থানা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.district && THANAS_BY_DISTRICT[formData.district]?.map((thana) => (
                            <SelectItem key={thana} value={thana}>{thana}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">বিস্তারিত ঠিকানা *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="রোড, বাড়ির নম্বর, এলাকার নাম"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    পেমেন্ট তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-green-600" />
                      <strong className="text-green-800">অ্যাডভান্স পেমেন্ট প্রয়োজন</strong>
                    </div>
                    <p className="text-green-700 text-sm">
                      bKash/Nagad এ ১০০৳ + ডেলিভারি চার্জ (৳{deliveryFee}) = মোট ৳{finalAmount} পাঠান
                    </p>
                    <p className="text-green-600 font-semibold mt-2">
                      bKash: 01XXXXXXXXX | Nagad: 01XXXXXXXXX
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="payment_number">পেমেন্ট নম্বর</Label>
                    <Input
                      id="payment_number"
                      value={formData.payment_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_number: e.target.value }))}
                      placeholder="যে নম্বর থেকে পেমেন্ট করেছেন"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trx_id">Transaction ID</Label>
                    <Input
                      id="trx_id"
                      value={formData.trx_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, trx_id: e.target.value }))}
                      placeholder="TXN ID লিখুন"
                    />
                  </div>

                  <div>
                    <Label htmlFor="special_instructions">অতিরিক্ত নির্দেশনা</Label>
                    <Textarea
                      id="special_instructions"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                      placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t pt-4 bg-white">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  অর্ডার করা হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  অর্ডার কনফার্ম করুন (৳{finalAmount})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, User, CreditCard, Package, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface OrderNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization?: any;
}

interface OrderData {
  customerName: string;
  phone: string;
  address: string;
  instructions: string;
  paymentMethod: 'bkash' | 'nagad' | 'rocket';
  customization?: any;
}

export default function OrderNowModal({ isOpen, onClose, product, customization }: OrderNowModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [orderData, setOrderData] = useState<OrderData>({
    customerName: '',
    phone: '',
    address: '',
    instructions: '',
    paymentMethod: 'bkash',
    customization
  });
  
  const { toast } = useToast();
  
  const totalPrice = Number(product.price) + (customization ? 50 : 0);
  const advancePayment = 100;
  const remainingPayment = totalPrice - advancePayment;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Order creation failed');
      return response.json();
    },
    onSuccess: () => {
      setStep('success');
      toast({
        title: "অর্ডার সফল হয়েছে!",
        description: "আপনার অর্ডার গ্রহণ করা হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।",
      });
    },
    onError: () => {
      toast({
        title: "অর্ডারে সমস্যা হয়েছে",
        description: "অনুগ্রহ করে পুনরায় চেষ্টা করুন",
        variant: "destructive",
      });
    },
  });

  const handleSubmitDetails = () => {
    if (!orderData.customerName || !orderData.phone || !orderData.address) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সব তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }
    setStep('payment');
  };

  const handleConfirmOrder = () => {
    const orderPayload = {
      product_id: product.id,
      product_name: product.name,
      customer_name: orderData.customerName,
      customer_phone: orderData.phone,
      customer_address: orderData.address,
      total_amount: totalPrice,
      advance_payment: advancePayment,
      remaining_payment: remainingPayment,
      payment_method: orderData.paymentMethod,
      customization_data: orderData.customization || {},
      special_instructions: orderData.instructions,
      order_type: 'direct',
      status: 'pending_advance',
    };

    createOrderMutation.mutate(orderPayload);
  };

  const resetModal = () => {
    setStep('details');
    setOrderData({
      customerName: '',
      phone: '',
      address: '',
      instructions: '',
      paymentMethod: 'bkash',
      customization
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {step === 'details' ? 'অর্ডারের তথ্য' : step === 'payment' ? 'পেমেন্ট নিশ্চিতকরণ' : 'অর্ডার সফল!'}
          </DialogTitle>
        </DialogHeader>

        {/* Order Steps Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-orange-600' : (step === 'payment' || step === 'success') ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-orange-100 border-2 border-orange-600' : (step === 'payment' || step === 'success') ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                {(step === 'payment' || step === 'success') ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">তথ্য</span>
            </div>
            
            <div className={`w-8 h-1 ${step === 'payment' || step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-orange-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-orange-100 border-2 border-orange-600' : step === 'success' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                {step === 'success' ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">পেমেন্ট</span>
            </div>
            
            <div className={`w-8 h-1 ${step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                {step === 'success' ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-sm font-medium">সম্পন্ন</span>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-orange-600">
                      {formatPrice(totalPrice)}
                    </span>
                    {customization && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">কাস্টমাইজড</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>অগ্রিম: {formatPrice(advancePayment)}</div>
                    <div>বাকি: {formatPrice(remainingPayment)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  নাম *
                </Label>
                <Input
                  id="customerName"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={orderData.customerName}
                  onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  ফোন নম্বর *
                </Label>
                <Input
                  id="phone"
                  placeholder="01XXXXXXXXX"
                  value={orderData.phone}
                  onChange={(e) => setOrderData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                সম্পূর্ণ ঠিকানা *
              </Label>
              <Textarea
                id="address"
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন (এলাকা, থানা, জেলা)"
                value={orderData.address}
                onChange={(e) => setOrderData(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1"
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="instructions">বিশেষ নির্দেশনা (ঐচ্ছিক)</Label>
              <Textarea
                id="instructions"
                placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন"
                value={orderData.instructions}
                onChange={(e) => setOrderData(prev => ({ ...prev, instructions: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetModal}
              >
                বাতিল
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={handleSubmitDetails}
              >
                পরবর্তী
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">পেমেন্ট তথ্য</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">মোট দাম:</span>
                  <span className="font-semibold ml-2">{formatPrice(totalPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-600">অগ্রিম:</span>
                  <span className="font-semibold ml-2 text-orange-600">{formatPrice(advancePayment)}</span>
                </div>
                <div>
                  <span className="text-gray-600">বাকি (ডেলিভারিতে):</span>
                  <span className="font-semibold ml-2">{formatPrice(remainingPayment)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">পেমেন্ট পদ্ধতি নির্বাচন করুন</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'bkash', name: 'bKash', color: 'bg-pink-500', number: '01XXXXXXXXX' },
                  { id: 'nagad', name: 'Nagad', color: 'bg-orange-500', number: '01XXXXXXXXX' },
                  { id: 'rocket', name: 'Rocket', color: 'bg-purple-500', number: '01XXXXXXXXX' }
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      orderData.paymentMethod === method.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setOrderData(prev => ({ ...prev, paymentMethod: method.id as any }))}
                  >
                    <div className={`w-8 h-8 ${method.color} rounded-full flex items-center justify-center text-white text-xs font-bold mb-2`}>
                      {method.name.charAt(0)}
                    </div>
                    <div className="text-sm font-medium">{method.name}</div>
                    <div className="text-xs text-gray-500">{method.number}</div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">পেমেন্ট নির্দেশনা:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. উপরের নম্বরে {formatPrice(advancePayment)} টাকা পাঠান</li>
                  <li>2. "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করুন</li>
                  <li>3. আমরা পেমেন্ট যাচাই করে অর্ডার নিশ্চিত করব</li>
                  <li>4. বাকি টাকা ডেলিভারির সময় পরিশোধ করবেন</li>
                </ol>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('details')}
              >
                পূর্ববর্তী
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleConfirmOrder}
                disabled={createOrderMutation.isPending}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {createOrderMutation.isPending ? 'প্রক্রিয়াধীন...' : 'অর্ডার নিশ্চিত করুন'}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-2">অর্ডার সফল হয়েছে!</h3>
              <p className="text-gray-600">
                আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করে অর্ডার নিশ্চিত করব।
              </p>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">পরবর্তী ধাপসমূহ:</h4>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• আমরা আপনার পেমেন্ট যাচাই করব</li>
                  <li>• 2-4 ঘন্টার মধ্যে ফোনে যোগাযোগ করব</li>
                  <li>• অর্ডার প্রস্তুত হলে আবার জানাব</li>
                  <li>• ডেলিভারির সময় বাকি টাকা পরিশোধ করবেন</li>
                </ul>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={resetModal}
            >
              <Package className="w-4 h-4 mr-2" />
              আরো কেনাকাটা করুন
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
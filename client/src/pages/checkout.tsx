
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, CreditCard, MapPin, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/constants';
import MobileOptimizedLayout from '@/components/mobile-optimized-layout';

const DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'খুলনা'
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customOrderData, setCustomOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    district: '',
    thana: '',
    address: '',
    payment_method: 'cash_on_delivery',
    special_instructions: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCustomOrder = urlParams.get('customOrder') === 'true';
    
    if (isCustomOrder) {
      const pendingOrder = localStorage.getItem('pendingCustomOrder');
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);
          setCustomOrderData(orderData);
        } catch (error) {
          console.error('Error parsing custom order data:', error);
          toast({
            title: "ত্রুটি",
            description: "অর্ডারের তথ্য লোড করতে সমস্যা হয়েছে",
            variant: "destructive"
          });
        }
      }
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const orderPayload = {
        ...customOrderData,
        ...formData,
        orderType: 'custom',
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error('অর্ডার প্রেরণে সমস্যা হয়েছে');
      }

      const result = await response.json();
      
      // Clear the stored order data
      localStorage.removeItem('pendingCustomOrder');
      
      toast({
        title: "অর্ডার সফল! 🎉",
        description: `আপনার কাস্টম অর্ডার সফলভাবে প্রেরণ করা হয়েছে। ট্র্যাকিং ID: ${result.trackingId || result.id}`,
      });

      // Redirect to success page or home
      setLocation('/orders');
      
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "অর্ডার প্রেরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customOrderData) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-6 text-center">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">কোন অর্ডার পাওয়া যায়নি</h2>
              <p className="text-gray-600 mb-4">অনুগ্রহ করে আবার কাস্টমাইজেশন করুন</p>
              <Button onClick={() => setLocation('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                হোমে ফিরে যান
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ফিরে যান
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">কাস্টম অর্ডার চেকআউট</h1>
              <p className="text-gray-600">আপনার কাস্টমাইজড পণ্যের অর্ডার সম্পূর্ণ করুন</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  অর্ডার সামারি
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{customOrderData.productName}</h4>
                    <p className="text-sm text-gray-600">পরিমাণ: {customOrderData.quantity}</p>
                    <p className="text-lg font-bold text-green-600">{formatPrice(customOrderData.totalAmount)}</p>
                  </div>
                </div>

                {/* Customization Details */}
                {customOrderData.customization && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">কাস্টমাইজেশন বিবরণ:</h5>
                    <div className="space-y-2 text-sm">
                      {customOrderData.customization.size && (
                        <p><strong>সাইজ:</strong> {customOrderData.customization.size}</p>
                      )}
                      {customOrderData.customization.color && (
                        <p><strong>রং:</strong> {customOrderData.customization.color}</p>
                      )}
                      {customOrderData.customization.material && (
                        <p><strong>উপাদান:</strong> {customOrderData.customization.material}</p>
                      )}
                      {customOrderData.customization.text && (
                        <p><strong>টেক্সট:</strong> "{customOrderData.customization.text}"</p>
                      )}
                      {customOrderData.customization.specialInstructions && (
                        <p><strong>বিশেষ নির্দেশনা:</strong> {customOrderData.customization.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    মোট: {formatPrice(customOrderData.totalAmount)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">ডেলিভারি চার্জ সহ</p>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  ডেলিভারি তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">নাম *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="আপনার পূর্ণ নাম"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">ফোন নম্বর *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">জেলা *</Label>
                      <Select value={formData.district} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}>
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
                      <Label htmlFor="thana">থানা</Label>
                      <Input
                        id="thana"
                        value={formData.thana}
                        onChange={(e) => setFormData(prev => ({ ...prev, thana: e.target.value }))}
                        placeholder="থানার নাম"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="বিস্তারিত ঠিকানা লিখুন"
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_method">পেমেন্ট পদ্ধতি</Label>
                    <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_on_delivery">ক্যাশ অন ডেলিভারি</SelectItem>
                        <SelectItem value="bkash">বিকাশ</SelectItem>
                        <SelectItem value="nagad">নগদ</SelectItem>
                        <SelectItem value="rocket">রকেট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="special_instructions">অতিরিক্ত নির্দেশনা (ঐচ্ছিক)</Label>
                    <Textarea
                      id="special_instructions"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                      placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন"
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                    disabled={isLoading}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isLoading ? 'অর্ডার প্রক্রিয়াকরণ...' : 'অর্ডার নিশ্চিত করুন'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}

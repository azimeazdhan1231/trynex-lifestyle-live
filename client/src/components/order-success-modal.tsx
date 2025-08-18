import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Phone, 
  MessageCircle, 
  Truck, 
  Clock, 
  Eye, 
  Copy,
  ExternalLink,
  Star,
  Gift,
  ShieldCheck,
  HeadphonesIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    tracking_id: string;
    customer_name: string;
    phone: string;
    total: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
}

export default function OrderSuccessModal({ isOpen, onClose, orderDetails }: OrderSuccessModalProps) {
  const { toast } = useToast();
  const [animationStep, setAnimationStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes countdown

  useEffect(() => {
    if (isOpen) {
      // Animation sequence
      const timer1 = setTimeout(() => setAnimationStep(1), 500);
      const timer2 = setTimeout(() => setAnimationStep(2), 1000);
      const timer3 = setTimeout(() => setAnimationStep(3), 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      const countdown = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isOpen, timeRemaining]);

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(orderDetails.tracking_id);
    toast({
      title: "কপি করা হয়েছে!",
      description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি হয়েছে",
    });
  };

  const handleCallSupport = () => {
    window.open('tel:+8801765555593', '_self');
  };

  const handleWhatsAppSupport = () => {
    const message = `আসসালামু আলাইকুম! আমার অর্ডার সম্পর্কে জানতে চাই। ট্র্যাকিং আইডি: ${orderDetails.tracking_id}`;
    const whatsappUrl = `https://wa.me/8801765555593?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTrackOrder = () => {
    window.open(`/order-tracking?id=${orderDetails.tracking_id}`, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 via-white to-blue-50 border-2 border-green-200">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-6 relative">
            {/* Success Animation */}
            <div className={`transform transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Celebration Sparkles */}
            {animationStep >= 2 && (
              <div className="absolute -top-4 -left-4 w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
                <Star className="w-4 h-4 text-yellow-600 m-1" />
              </div>
            )}
            {animationStep >= 3 && (
              <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-pink-400 rounded-full animate-pulse">
                <Gift className="w-3 h-3 text-pink-600 m-1" />
              </div>
            )}
          </div>

          <DialogTitle className="text-3xl font-bold text-green-700 mb-2">
            🎉 ধন্যবাদ! আপনার অর্ডার সফল হয়েছে
          </DialogTitle>
          <p className="text-lg text-gray-600">
            আমরা আপনার অর্ডারটি পেয়েছি এবং শীঘ্রই প্রক্রিয়া করব
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Order Summary Card */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-green-600" />
                অর্ডার বিবরণ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Tracking ID */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                    <p className="text-2xl font-bold text-orange-600 font-mono">
                      {orderDetails.tracking_id}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyTrackingId}
                    variant="outline"
                    size="sm"
                    className="border-orange-300 hover:bg-orange-100"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    কপি
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                  <p className="text-lg font-semibold">{orderDetails.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">মোবাইল নম্বর</p>
                  <p className="text-lg font-semibold">{orderDetails.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-sm text-gray-600 mb-2">অর্ডারকৃত পণ্য</p>
                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold">৳{(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>মোট</span>
                  <span className="text-green-600">৳{orderDetails.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Track Order */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={handleTrackOrder}>
              <CardContent className="p-4 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-700">অর্ডার ট্র্যাক করুন</h3>
                <p className="text-sm text-gray-600 mt-1">রিয়েল-টাইম অর্ডার স্ট্যাটাস দেখুন</p>
                <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700">
                  <Eye className="w-4 h-4 mr-2" />
                  ট্র্যাক করুন
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HeadphonesIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-purple-700">সাপোর্ট সেন্টার</h3>
                <p className="text-sm text-gray-600 mt-1">যেকোনো সহায়তার জন্য যোগাযোগ করুন</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleCallSupport}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    কল
                  </Button>
                  <Button
                    onClick={handleWhatsAppSupport}
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    হোয়াটসঅ্যাপ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Status Updates */}
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
                লাইভ আপডেট
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                  {formatTime(timeRemaining)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold">অর্ডার গৃহীত হয়েছে</span>
                  <Badge className="bg-green-100 text-green-700">সম্পন্ন</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                  <span className="text-yellow-600">পেমেন্ট যাচাইকরণ</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600">প্রক্রিয়াধীন</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500">প্রোডাকশন শুরু</span>
                  <Badge variant="outline" className="text-gray-500">অপেক্ষমাণ</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500">প্যাকেজিং ও ডেলিভারি</span>
                  <Badge variant="outline" className="text-gray-500">অপেক্ষমাণ</Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <ShieldCheck className="w-4 h-4 inline mr-2" />
                  আমাদের টিম ২-৩ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করবে
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="text-center pt-4">
            <Button
              onClick={onClose}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8"
            >
              ধন্যবাদ! বন্ধ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
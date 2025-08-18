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
  HeadphonesIcon,
  MapPin,
  User,
  CreditCard,
  Sparkles,
  Award,
  ThumbsUp,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    tracking_id: string;
    customer_name: string;
    phone: string;
    total: string | number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    address?: string;
    district?: string;
    thana?: string;
  };
}

export default function EnhancedOrderSuccessModal({ isOpen, onClose, orderDetails }: OrderSuccessModalProps) {
  const { toast } = useToast();
  const [animationStep, setAnimationStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes countdown
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset animation and start sequence
      setAnimationStep(0);
      setConfettiActive(true);
      
      // Animation sequence with better timing
      const timer1 = setTimeout(() => setAnimationStep(1), 200);
      const timer2 = setTimeout(() => setAnimationStep(2), 800);
      const timer3 = setTimeout(() => setAnimationStep(3), 1200);
      const timer4 = setTimeout(() => setAnimationStep(4), 1600);
      
      // Stop confetti after animation
      const confettiTimer = setTimeout(() => setConfettiActive(false), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(confettiTimer);
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
    const message = `আসসালামু আলাইকুম! আমার অর্ডার সম্পর্কে জানতে চাই। 
    
🆔 ট্র্যাকিং আইডি: ${orderDetails.tracking_id}
👤 নাম: ${orderDetails.customer_name}
📱 ফোন: ${orderDetails.phone}
💰 মোট: ৳${orderDetails.total}

অর্ডার স্ট্যাটাস সম্পর্কে জানান, ধন্যবাদ!`;
    const whatsappUrl = `https://wa.me/8801765555593?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTrackOrder = () => {
    window.open(`/tracking?id=${orderDetails.tracking_id}`, '_blank');
  };

  const handleLiveChat = () => {
    // Open live chat support
    window.open('https://wa.me/8801765555593', '_blank');
  };

  const handleDownloadReceipt = () => {
    // Generate and download order receipt
    const receiptData = {
      orderId: orderDetails.tracking_id,
      customerName: orderDetails.customer_name,
      phone: orderDetails.phone,
      total: orderDetails.total,
      items: orderDetails.items,
      date: new Date().toLocaleDateString('bn-BD')
    };

    const receiptText = `
অর্ডার রসিদ
-----------
অর্ডার আইডি: ${receiptData.orderId}
গ্রাহকের নাম: ${receiptData.customerName}
ফোন নম্বর: ${receiptData.phone}
তারিখ: ${receiptData.date}

পণ্য সমূহ:
${receiptData.items.map(item => `• ${item.name} × ${item.quantity} = ৳${item.price * item.quantity}`).join('\n')}

মোট: ৳${receiptData.total}

ধন্যবাদ!
ট্রাইনেক্স লাইফ
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderDetails.tracking_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "রসিদ ডাউনলোড হয়েছে!",
      description: "আপনার অর্ডার রসিদ সফলভাবে ডাউনলোড হয়েছে",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `৳${numPrice.toLocaleString('bn-BD')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-green-50 via-white to-blue-50 border-2 border-green-200 relative">
        
        {/* Confetti Animation */}
        {confettiActive && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
            ))}
          </div>
        )}

        <DialogHeader className="text-center relative z-20">
          <div className="mx-auto mb-6 relative">
            {/* Success Animation */}
            <div className={`transform transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            
            {/* Celebration Elements */}
            {animationStep >= 2 && (
              <div className="absolute -top-6 -left-6 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            )}
            {animationStep >= 3 && (
              <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-pink-400 rounded-full animate-pulse flex items-center justify-center">
                <Gift className="w-6 h-6 text-pink-600" />
              </div>
            )}
            {animationStep >= 4 && (
              <div className="absolute top-6 right-8 w-6 h-6 bg-blue-400 rounded-full animate-bounce flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>

          <DialogTitle className="text-4xl font-bold text-green-700 mb-4">
            🎉 অভিনন্দন! আপনার অর্ডার সফল হয়েছে
          </DialogTitle>
          <p className="text-xl text-gray-600 mb-2">
            আমরা আপনার অর্ডারটি পেয়েছি এবং শীঘ্রই প্রক্রিয়া করব
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-lg font-semibold">ধন্যবাদ আমাদের বিশ্বাস করার জন্য!</span>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-8">
          {/* Order Summary Card */}
          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Package className="w-7 h-7 text-green-600" />
                অর্ডার বিবরণ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Tracking ID - Enhanced */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2">
                      অর্ডার আইডি
                    </Badge>
                  </div>
                  <div className="text-4xl font-bold text-orange-600 font-mono bg-white rounded-lg py-4 px-6 border-2 border-orange-200">
                    {orderDetails.tracking_id}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={handleCopyTrackingId}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      কপি করুন
                    </Button>
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      রসিদ ডাউনলোড
                    </Button>
                  </div>
                </div>
              </div>

              {/* Customer Info - Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                    <p className="text-xl font-bold text-blue-700">{orderDetails.customer_name}</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">মোবাইল নম্বর</p>
                    <p className="text-xl font-bold text-purple-700">{orderDetails.phone}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Address Info if available */}
              {(orderDetails.address || orderDetails.district) && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ডেলিভারি ঠিকানা</p>
                        <div className="space-y-1">
                          {orderDetails.address && (
                            <p className="text-lg text-green-700">{orderDetails.address}</p>
                          )}
                          {orderDetails.thana && orderDetails.district && (
                            <p className="text-md text-green-600">{orderDetails.thana}, {orderDetails.district}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items - Enhanced */}
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  অর্ডারকৃত পণ্য
                </p>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">পরিমাণ: {item.quantity} টি</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center text-2xl font-bold bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    মোট পেমেন্ট
                  </span>
                  <span className="text-green-700">{formatPrice(orderDetails.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Order Tracking */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer transform hover:scale-105 duration-200" onClick={handleTrackOrder}>
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">লাইভ ট্র্যাকিং</h3>
                <p className="text-sm text-gray-600 mb-4">রিয়েল-টাইম অর্ডার স্ট্যাটাস দেখুন</p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Eye className="w-4 h-4 mr-2" />
                  এখনই ট্র্যাক করুন
                </Button>
              </CardContent>
            </Card>

            {/* 24/7 Support */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors transform hover:scale-105 duration-200">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-700 mb-2">২৪/৭ সাপোর্ট</h3>
                <p className="text-sm text-gray-600 mb-4">যেকোনো সময় যেকোনো সহায়তার জন্য</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCallSupport}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    কল
                  </Button>
                  <Button
                    onClick={handleWhatsAppSupport}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    চ্যাট
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer transform hover:scale-105 duration-200" onClick={handleLiveChat}>
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">তৎক্ষণাত চ্যাট</h3>
                <p className="text-sm text-gray-600 mb-4">এখনই আমাদের সাথে কথা বলুন</p>
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  চ্যাট শুরু করুন
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Live Status Updates - Enhanced */}
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6 text-indigo-600" />
                লাইভ অর্ডার স্ট্যাটাস
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 ml-auto">
                  আপডেট: {formatTime(timeRemaining)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <span className="text-green-700 font-semibold text-lg">অর্ডার গৃহীত হয়েছে</span>
                    <p className="text-green-600 text-sm mt-1">আপনার অর্ডার সফলভাবে আমাদের সিস্টেমে রেজিস্টার হয়েছে</p>
                  </div>
                  <Badge className="bg-green-500 text-white">সম্পন্ন ✓</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="flex-1">
                    <span className="text-yellow-700 font-semibold text-lg">পেমেন্ট যাচাইকরণ</span>
                    <p className="text-yellow-600 text-sm mt-1">আমাদের টিম আপনার পেমেন্ট যাচাই করছে</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">প্রক্রিয়াধীন ⏳</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-gray-600 font-semibold text-lg">প্রোডাকশন শুরু</span>
                    <p className="text-gray-500 text-sm mt-1">আপনার পণ্য তৈরির কাজ শুরু হবে</p>
                  </div>
                  <Badge variant="outline" className="text-gray-500 border-gray-300">অপেক্ষমাণ</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-gray-600 font-semibold text-lg">প্যাকেজিং ও ডেলিভারি</span>
                    <p className="text-gray-500 text-sm mt-1">পণ্য প্যাকেজিং করে ডেলিভারির জন্য পাঠানো হবে</p>
                  </div>
                  <Badge variant="outline" className="text-gray-500 border-gray-300">অপেক্ষমাণ</Badge>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="text-blue-700 font-semibold mb-2">আমাদের অঙ্গীকার:</h4>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• ২-৩ ঘন্টার মধ্যে আমাদের টিম আপনার সাথে যোগাযোগ করবে</li>
                      <li>• প্রতিটি ধাপে SMS/WhatsApp এর মাধ্যমে আপডেট পাবেন</li>
                      <li>• ১০০% মানসম্পন্ন পণ্য এবং সময়মতো ডেলিভারি নিশ্চিত</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="text-center pt-6">
            <Button
              onClick={onClose}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-4 text-lg rounded-xl"
              data-testid="button-close-success-modal"
            >
              ✨ ধন্যবাদ! বন্ধ করুন ✨
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
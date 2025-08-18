
import React, { useState } from "react";
import { CheckCircle, Copy, Package, Phone, MessageCircle, ExternalLink, Clock, User, MapPin, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/constants";

interface EnhancedOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    tracking_id: string;
    customer_name: string;
    phone: string;
    total_amount: number;
    items: any[];
    address?: string;
    district?: string;
    thana?: string;
    payment_info?: any;
    estimated_delivery?: string;
  } | null;
}

export default function EnhancedOrderSuccessModal({
  isOpen,
  onClose,
  orderData
}: EnhancedOrderSuccessModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyTrackingId = async () => {
    if (orderData?.tracking_id) {
      try {
        await navigator.clipboard.writeText(orderData.tracking_id);
        setCopied(true);
        toast({
          title: "কপি সম্পন্ন!",
          description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি করা হয়েছে",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "ত্রুটি",
          description: "ট্র্যাকিং আইডি কপি করতে সমস্যা হয়েছে",
          variant: "destructive"
        });
      }
    }
  };

  const openTrackingPage = () => {
    if (orderData?.tracking_id) {
      window.open(`/tracking/${orderData.tracking_id}`, '_blank');
    }
  };

  const shareOnWhatsApp = () => {
    if (orderData) {
      const message = `আমার অর্ডার সফল হয়েছে!\n\nট্র্যাকিং আইডি: ${orderData.tracking_id}\nগ্রাহক: ${orderData.customer_name}\nমোট: ৳${orderData.total_amount}\n\nধন্যবাদ!`;
      const whatsappUrl = `https://wa.me/8801747292277?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!orderData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 অর্ডার সফল হয়েছে!
              </h2>
              <p className="text-gray-600">
                আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে এবং প্রক্রিয়াকরণ শুরু হয়েছে।
              </p>
            </div>
          </div>

          {/* Tracking ID Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600 mb-1">ট্র্যাকিং আইডি</p>
                  <p className="text-xl font-bold text-blue-800 font-mono">
                    {orderData.tracking_id}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTrackingId}
                    className={`${copied ? 'bg-green-100 text-green-700' : 'bg-white'}`}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? 'কপি হয়েছে!' : 'কপি'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openTrackingPage}
                    className="bg-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    ট্র্যাক করুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                অর্ডার সারাংশ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                    <p className="font-medium">{orderData.customer_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ফোন নম্বর</p>
                    <p className="font-medium">{orderData.phone}</p>
                  </div>
                </div>
                
                {(orderData.address || orderData.district) && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">ডেলিভারি ঠিকানা</p>
                      <p className="font-medium">
                        {orderData.address && `${orderData.address}, `}
                        {orderData.thana && `${orderData.thana}, `}
                        {orderData.district}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                    <p className="font-bold text-lg text-green-600">
                      {formatPrice(orderData.total_amount)}
                    </p>
                  </div>
                </div>
                
                {orderData.estimated_delivery && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">আনুমানিক ডেলিভারি</p>
                      <p className="font-medium">{orderData.estimated_delivery}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              {orderData.items && orderData.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">অর্ডার পণ্যসমূহ ({orderData.items.length}টি)</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {orderData.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{item.name}</span>
                          <Badge variant="secondary">
                            {item.quantity} × {formatPrice(item.price)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-800 mb-3">পরবর্তী ধাপসমূহ</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব</p>
                <p>• অর্ডার নিশ্চিতকরণের জন্য ফোন কল আসবে</p>
                <p>• ট্র্যাকিং আইডি দিয়ে অর্ডার অবস্থা জানতে পারবেন</p>
                <p>• ডেলিভারির সময় পণ্য যাচাই করে নিন</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={shareOnWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              হোয়াটসঅ্যাপে শেয়ার করুন
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={openTrackingPage}
                className="py-3"
              >
                <Package className="w-4 h-4 mr-2" />
                ট্র্যাক করুন
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="py-3"
              >
                আরও কেনাকাটা
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Phone, MapPin, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/constants';

interface CustomOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    trackingId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    totalPrice: number;
    paymentMethod: string;
    productName: string;
    customizationInstructions: string;
  } | null;
}

const paymentMethodLabels: Record<string, string> = {
  cash_on_delivery: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
};

export default function CustomOrderSuccessModal({ 
  isOpen, 
  onClose, 
  orderDetails 
}: CustomOrderSuccessModalProps) {
  const { toast } = useToast();

  const copyTrackingId = () => {
    if (orderDetails?.trackingId) {
      navigator.clipboard.writeText(orderDetails.trackingId);
      toast({
        title: 'কপি করা হয়েছে!',
        description: 'ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি করা হয়েছে',
      });
    }
  };

  const openWhatsApp = () => {
    if (orderDetails) {
      const message = `আমার কাস্টম অর্ডারের ট্র্যাকিং আইডি: ${orderDetails.trackingId}`;
      const whatsappUrl = `https://wa.me/8801234567890?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!orderDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center text-xl text-green-600">
            <CheckCircle className="w-6 h-6" />
            অর্ডার সফল!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <div className="text-center bg-green-50 p-4 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              আপনার কাস্টম অর্ডার সফলভাবে প্রেরণ করা হয়েছে!
            </h3>
            <p className="text-green-700">
              আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব এবং কাস্টমাইজেশন প্রক্রিয়া শুরু করব।
            </p>
          </div>

          {/* Tracking Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  ট্র্যাকিং তথ্য
                </h4>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  প্রক্রিয়াধীন
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                    <p className="text-lg font-mono font-bold text-gray-900" data-testid="text-tracking-id">
                      {orderDetails.trackingId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyTrackingId}
                    data-testid="button-copy-tracking"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                এই ট্র্যাকিং আইডি ব্যবহার করে আপনি আপনার অর্ডারের স্ট্যাটাস ট্র্যাক করতে পারবেন
              </p>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4">অর্ডার বিবরণ</h4>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">পণ্য</p>
                    <p className="font-medium">{orderDetails.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">মোট দাম</p>
                    <p className="font-bold text-orange-600">{formatPrice(orderDetails.totalPrice)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">পেমেন্ট পদ্ধতি</p>
                  <p className="font-medium">{paymentMethodLabels[orderDetails.paymentMethod] || orderDetails.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">কাস্টমাইজেশন নির্দেশনা</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {orderDetails.customizationInstructions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                গ্রাহকের তথ্য
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-16">নাম:</span>
                  <span className="font-medium">{orderDetails.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-16">ফোন:</span>
                  <span className="font-medium">{orderDetails.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">ঠিকানা:</span>
                    <p className="text-sm">{orderDetails.customerAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-blue-800">পরবর্তী পদক্ষেপ</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>কাস্টমাইজেশনের বিস্তারিত আলোচনা করব</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>চূড়ান্ত দাম এবং ডেলিভারি সময় নিশ্চিত করব</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>আপনার অর্ডার প্রস্তুত হলে জানিয়ে দেব</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={openWhatsApp}
              className="flex-1"
              data-testid="button-whatsapp-support"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              WhatsApp সাপোর্ট
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              data-testid="button-close-success"
            >
              সম্পন্ন
            </Button>
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="mb-1">
              <strong>সাপোর্ট:</strong> +8801234567890 | support@trynelifestyle.com
            </p>
            <p>
              <strong>কাজের সময়:</strong> সকাল ৯টা - রাত ৯টা (সাত দিন)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
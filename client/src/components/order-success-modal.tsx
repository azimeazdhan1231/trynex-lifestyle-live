import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Copy, Eye, MessageCircle, X, Package } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import type { Order } from "@shared/schema";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderSuccessModal({ isOpen, onClose, order }: OrderSuccessModalProps) {
  const { toast } = useToast();

  if (!order) return null;

  const handleCopyTrackingId = () => {
    const trackingId = order.tracking_id || order.id || 'TRK-অজানা';
    navigator.clipboard.writeText(trackingId);
    toast({
      title: "কপি হয়েছে!",
      description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি হয়েছে",
    });
  };

  const handleTrackOrder = () => {
    // Close modal first
    onClose();
    // Navigate to tracking page
    const trackingId = order.tracking_id || order.id || 'TRK-অজানা';
    window.location.href = `/tracking?id=${trackingId}`;
  };

  const handleWhatsAppContact = () => {
    const trackingId = order.tracking_id || order.id || 'TRK-অজানা';
    const message = `আমার অর্ডার সম্পর্কে জানতে চাই। ট্র্যাকিং আইডি: ${trackingId}`;
    const whatsappUrl = `https://wa.me/8801747292277?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const orderItems = order?.items ? (Array.isArray(order.items) ? order.items : 
    (typeof order.items === 'string' ? (() => {
      try {
        return JSON.parse(order.items);
      } catch {
        return [];
      }
    })() : [])) : [];

  const orderTotal = parseFloat(order?.total || '0');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg lg:max-w-xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 text-center px-4 sm:px-6 py-4 sm:py-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="mx-auto mb-3 sm:mb-4">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto animate-pulse" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-green-600">
            অর্ডার সফল হয়েছে! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Thank You Message */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
                ধন্যবাদ {order.customer_name}!
              </h3>
              <p className="text-sm sm:text-base text-green-700">
                আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
              </p>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">অর্ডার বিবরণ</h4>

              {/* Tracking ID */}
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">ট্র্যাকিং আইডি</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-800 break-all">
                      {order.tracking_id || order.id || 'TRK-অজানা'}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyTrackingId}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-100 flex-shrink-0"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    কপি
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-sm sm:text-base">
                <p><span className="font-medium">গ্রাহক:</span> {order.customer_name}</p>
                <p><span className="font-medium">ফোন:</span> {order.phone}</p>
                <p><span className="font-medium">ঠিকানা:</span> {order.district}, {order.thana}</p>
                {order.address && <p><span className="font-medium">বিস্তারিত:</span> {order.address}</p>}
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Order Items */}
              <div className="space-y-2 sm:space-y-3">
                <h5 className="font-medium text-sm sm:text-base">অর্ডারকৃত পণ্য:</h5>
                <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-2">
                  {orderItems.map((item: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-3">
                      <div className="flex justify-between items-start text-xs sm:text-sm">
                        <span className="flex-1 mr-2">{item.name} × {item.quantity}</span>
                        <span className="font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>

                      {/* Show customization details if present */}
                      {item.customization && (
                        <div className="text-xs text-blue-600 mt-1 space-y-0.5">
                          {item.customization.size && <p>সাইজ: {item.customization.size}</p>}
                        {item.customization.color && <p>রং: {item.customization.color}</p>}
                        {item.customization.printArea && <p>প্রিন্ট এরিয়া: {item.customization.printArea}</p>}
                        {item.customization.customText && item.customization.customText.trim() && <p>কাস্টম টেক্সট: {item.customization.customText.trim()}</p>}
                        {item.customization.specialInstructions && item.customization.specialInstructions.trim() && <p>বিশেষ নির্দেশনা: {item.customization.specialInstructions.trim()}</p>}
                        {item.customization.customImage && <p>কাস্টম ছবি: ✅ আপলোড করা হয়েছে</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

                </div>

                <Separator className="my-3 sm:my-4" />

                {/* Total */}
                <div className="flex justify-between items-center font-bold text-sm sm:text-lg bg-gray-50 p-2 sm:p-3 rounded-lg">
                  <span>মোট পরিমাণ:</span>
                  <span className="text-green-600">{formatPrice(orderTotal)}</span>
                </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-4 sm:p-6">
              <h4 className="font-semibold text-orange-900 mb-3 text-sm sm:text-base">পেমেন্ট নির্দেশনা</h4>
              <div className="space-y-2 text-orange-800">
                <p className="font-bold text-base sm:text-lg">bKash/Nagad: 01747292277</p>
                <div className="text-xs sm:text-sm space-y-1">
                  <p>১. উপরোক্ত নম্বরে টাকা পাঠান</p>
                  <p>২. ট্রানজেকশন আইডি সংরক্ষণ করুন</p>
                  <p>ৃ. হোয়াটসঅ্যাপে ট্রানজেকশন আইডি পাঠান</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-orange-900 mt-2 p-2 bg-orange-100 rounded">
                  ⚠️ পেমেন্ট ছাড়া পণ্য ডেলিভার করা হবে না
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex-shrink-0 border-t bg-gray-50/80 px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={handleTrackOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              অর্ডার ট্র্যাক করুন
            </Button>

            <Button
              onClick={handleWhatsAppContact}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              হোয়াটসঅ্যাপে যোগাযোগ
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="sm"
          >
            বন্ধ করুন
          </Button>

          {/* Additional Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <h5 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">গুরুত্বপূর্ণ তথ্য:</h5>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• ডেলিভারি সময়: ২-৩ কার্যদিবস</li>
                <li>• অর্ডার স্ট্যাটাস আপডেট পেতে ট্র্যাকিং পেজ দেখুন</li>
                <li>• যেকোনো সমস্যায় হোয়াটসঅ্যাপে যোগাযোগ করুন</li>
                <li>• ট্র্যাকিং আইডি সংরক্ষণ করে রাখুন</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
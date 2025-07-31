import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Copy, Eye, MessageCircle } from "lucide-react";
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
    navigator.clipboard.writeText(order.tracking_id);
    toast({
      title: "কপি হয়েছে!",
      description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি হয়েছে",
    });
  };

  const handleTrackOrder = () => {
    // Close modal first
    onClose();
    // Navigate to tracking page
    window.location.href = `/tracking?id=${order.tracking_id}`;
  };

  const handleWhatsAppContact = () => {
    const message = `আমার অর্ডার সম্পর্কে জানতে চাই। ট্র্যাকিং আইডি: ${order.tracking_id}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const orderTotal = parseFloat(order.total.toString());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            অর্ডার সফল হয়েছে! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thank You Message */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                ধন্যবাদ {order.customer_name}!
              </h3>
              <p className="text-green-700">
                আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
              </p>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-lg mb-4">অর্ডার বিবরণ</h4>

              {/* Tracking ID */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">ট্র্যাকিং আইডি</p>
                    <p className="text-lg font-bold text-blue-800">{order.tracking_id}</p>
                  </div>
                  <Button
                    onClick={handleCopyTrackingId}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-100"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    কপি
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <p><span className="font-medium">গ্রাহক:</span> {order.customer_name}</p>
                <p><span className="font-medium">ফোন:</span> {order.phone}</p>
                <p><span className="font-medium">ঠিকানা:</span> {order.district}, {order.thana}</p>
                {order.address && <p><span className="font-medium">বিস্তারিত:</span> {order.address}</p>}
              </div>

              <Separator className="my-4" />

              {/* Order Items */}
              <div className="space-y-3">
                <h5 className="font-medium">অর্ডারকৃত পণ্য:</h5>
                {orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>

                    {/* Show customization details if present */}
                    {item.customization && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        <p className="font-medium text-gray-800 mb-1">কাস্টমাইজেশন:</p>
                        {item.customization.size && <p>সাইজ: {item.customization.size}</p>}
                        {item.customization.color && <p>রং: {item.customization.color}</p>}
                        {item.customization.printArea && <p>প্রিন্ট এরিয়া: {item.customization.printArea}</p>}
                        {item.customization.customText && <p>কাস্টম টেক্সট: {item.customization.customText}</p>}
                        {item.customization.customImage && <p>কাস্টম ছবি: আপলোড করা হয়েছে</p>}
                        {item.customization.specialInstructions && <p>বিশেষ নির্দেশনা: {item.customization.specialInstructions}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-center font-bold text-lg">
                <span>মোট পরিমাণ:</span>
                <span className="text-primary">{formatPrice(orderTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-orange-900 mb-3">পেমেন্ট নির্দেশনা</h4>
              <div className="space-y-2 text-orange-800">
                <p className="font-bold text-lg">bKash/Nagad: 01747292277</p>
                <p className="text-sm">১. উপরোক্ত নম্বরে টাকা পাঠান</p>
                <p className="text-sm">২. ট্রানজেকশন আইডি সংরক্ষণ করুন</p>
                <p className="text-sm">৩. হোয়াটসঅ্যাপে ট্রানজেকশন আইডি পাঠান</p>
                <p className="text-sm font-medium text-orange-900">
                  ⚠️ পেমেন্ট ছাড়া পণ্য ডেলিভার করা হবে না
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleTrackOrder}
              className="w-full"
              size="lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              অর্ডার ট্র্যাক করুন
            </Button>

            <Button
              onClick={handleWhatsAppContact}
              variant="outline"
              className="w-full bg-green-500 text-white hover:bg-green-600 border-green-500"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              হোয়াটসঅ্যাপে যোগাযোগ করুন
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              বন্ধ করুন
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h5 className="font-medium text-blue-900 mb-2">গুরুত্বপূর্ণ তথ্য:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
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
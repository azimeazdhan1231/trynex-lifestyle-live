import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, Copy, Phone, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import PerfectModalBase from "./perfect-modal-base";

interface PerfectOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function PerfectOrderSuccessModal({
  isOpen,
  onClose,
  orderData
}: PerfectOrderSuccessModalProps) {
  const { toast } = useToast();

  const copyOrderId = () => {
    if (orderData?.tracking_number) {
      navigator.clipboard.writeText(orderData.tracking_number);
      toast({
        title: "কপি করা হয়েছে",
        description: "অর্ডার আইডি কপি করা হয়েছে"
      });
    }
  };

  const handleViewOrder = () => {
    window.open(`/track-order?id=${orderData?.tracking_number}`, '_blank');
  };

  const handleWhatsApp = () => {
    const message = `আমার অর্ডার আইডি: ${orderData?.tracking_number}`;
    window.open(`https://wa.me/8801903426915?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNewOrder = () => {
    onClose();
    window.location.href = '/products';
  };

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center p-6 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          আপনার অর্ডার সফল হয়েছে! 🎉
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          সব তথ্য ঠিক করে আপনার অর্ডারটি সম্পূর্ণ করুন
        </p>

        {/* Order Details */}
        {orderData && (
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">অর্ডার আইডি</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {orderData.tracking_number}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOrderId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">মোট পণ্য:</span>
                <span className="font-medium">{orderData.items?.length || 0}টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">মোট মূল্য:</span>
                <span className="font-semibold text-orange-600">
                  {formatPrice(orderData.total_amount || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Button
            onClick={handleViewOrder}
            className="w-full bg-orange-500 hover:bg-orange-600"
            size="sm"
          >
            <Package className="w-4 h-4 mr-2" />
            অর্ডার ট্র্যাক করুন
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              হোয়াটসঅ্যাপ
            </Button>
            
            <Button
              onClick={handleNewOrder}
              variant="outline"
              size="sm"
            >
              নতুন অর্ডার
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="w-full mt-4 pt-4 border-t text-xs text-gray-500 text-center">
          <p>সমস্যা হলে কল করুন: +৮৮০১৯০৩৪২৬৯১৫</p>
        </div>
      </div>
    </PerfectModalBase>
  );
}
import React from "react";
import { CheckCircle, Copy, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PerfectModalBase from "./perfect-modal-base";

interface PerfectOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    tracking_id: string;
    customer_name: string;
    phone: string;
    total: number;
  } | null;
}

export default function PerfectOrderSuccessModal({
  isOpen,
  onClose,
  orderData
}: PerfectOrderSuccessModalProps) {
  const { toast } = useToast();

  const copyTrackingId = () => {
    if (orderData?.tracking_id) {
      navigator.clipboard.writeText(orderData.tracking_id);
      toast({
        title: "কপি হয়েছে",
        description: "ট্র্যাকিং আইডি কপি করা হয়েছে।",
      });
    }
  };

  if (!orderData) return null;

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="text-center space-y-6 p-6">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            অর্ডার সফল হয়েছে!
          </h2>
          <p className="text-gray-600">
            আপনার অর্ডার সফলভাবে জমা দেওয়া হয়েছে।
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ট্র্যাকিং আইডি:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-semibold">
                {orderData.tracking_id}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyTrackingId}
                className="h-6 w-6 p-1"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">গ্রাহকের নাম:</span>
            <span className="text-sm font-medium">{orderData.customer_name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ফোন নম্বর:</span>
            <span className="text-sm font-medium">{orderData.phone}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">মোট:</span>
            <span className="text-sm font-bold">৳{orderData.total}</span>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium mb-1">
                পরবর্তী ধাপ
              </p>
              <p className="text-sm text-blue-700">
                • আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব।<br/>
                • অর্ডার ট্র্যাক করতে ট্র্যাকিং আইডি: <strong>{orderData.tracking_id}</strong> সংরক্ষণ করুন।<br/>
                • সাহায্যের জন্য যোগাযোগ করুন: <strong>01747292277</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => window.open(`https://wa.me/8801747292277?text=আমার অর্ডার: ${orderData.tracking_id}`, '_blank')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            হোয়াটসঅ্যাপে যোগাযোগ করুন
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            আরও কেনাকাটা করুন
          </Button>
        </div>
      </div>
    </PerfectModalBase>
  );
}
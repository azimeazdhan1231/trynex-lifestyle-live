import { useState } from "react";
import PerfectModalBase from "./perfect-modal-base";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Copy, 
  Package, 
  MapPin, 
  Phone, 
  CreditCard, 
  Clock,
  Truck,
  ArrowRight,
  Gift,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  delivery_fee?: number;
}

interface PerfectOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: string;
    tracking_id: string;
    customer_name: string;
    phone: string;
    district: string;
    thana: string;
    address: string;
    items: OrderItem[];
    total: string;
    delivery_fee: number;
    payment_info: {
      payment_method: string;
      payment_number: string;
      trx_id: string;
      amount_paid: number;
    };
    status: string;
    created_at: string;
  };
}

export default function PerfectOrderSuccessModal({
  isOpen,
  onClose,
  orderData
}: PerfectOrderSuccessModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(orderData.tracking_id);
      setCopied(true);
      toast({
        title: "কপি হয়েছে!",
        description: "ট্র্যাকিং আইডি কপি করা হয়েছে",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: "কপি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const createWhatsAppUrl = (message: string) => {
    const phoneNumber = "8801765555593";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const whatsappMessage = `আসসালামু আলাইকুম! আমার অর্ডার সম্পর্কে জানতে চাই।
অর্ডার ট্র্যাকিং: ${orderData.tracking_id}
নাম: ${orderData.customer_name}
ফোন: ${orderData.phone}`;

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="অর্ডার সফল হয়েছে! 🎉"
      description="আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে"
      maxWidth="4xl"
      data-testid="modal-order-success"
    >
      <div className="space-y-6">
        {/* Success Icon and Message */}
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            অভিনন্দন! আপনার অর্ডার গৃহীত হয়েছে
          </h3>
          <div className="text-gray-600 space-y-1">
            <span>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব</span>
          </div>
        </div>

        {/* Tracking Information */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">ট্র্যাকিং নম্বর</span>
                </div>
                <div className="font-mono text-lg font-bold text-green-900 bg-white px-4 py-2 rounded-lg border border-green-200">
                  {orderData.tracking_id}
                </div>
              </div>
              <Button
                onClick={copyTrackingId}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
                data-testid="button-copy-tracking"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "কপি হয়েছে!" : "কপি করুন"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                গ্রাহক তথ্য
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">নাম:</span>
                  <span className="font-medium">{orderData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ফোন:</span>
                  <span className="font-medium">{orderData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">জেলা:</span>
                  <span className="font-medium">{orderData.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">থানা:</span>
                  <span className="font-medium">{orderData.thana}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">ঠিকানা:</span>
                  <span className="font-medium text-sm">{orderData.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                পেমেন্ট তথ্য
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">পেমেন্ট মাধ্যম:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {orderData.payment_info.payment_method}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">নম্বর:</span>
                  <span className="font-medium">{orderData.payment_info.payment_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">লেনদেন আইডি:</span>
                  <span className="font-medium font-mono text-sm">{orderData.payment_info.trx_id}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-600">মোট পেমেন্ট:</span>
                  <span className="text-green-600">৳{orderData.payment_info.amount_paid}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              অর্ডার আইটেম
            </h4>
            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                      <span>পরিমাণ: {item.quantity}</span>
                      <span>দাম: ৳{item.price}</span>
                      {item.delivery_fee && <span>ডেলিভারি: ৳{item.delivery_fee}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ৳{(item.price * item.quantity + (item.delivery_fee || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-xl font-bold">
              <span>সর্বমোট:</span>
              <span className="text-green-600">৳{orderData.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">অর্ডার স্ট্যাটাস</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                {orderData.status === 'pending' ? 'অপেক্ষমাণ' : orderData.status}
              </Badge>
              <span className="text-sm text-blue-700">
                আমরা আপনার অর্ডার প্রক্রিয়া করছি
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={() => window.open(createWhatsAppUrl(whatsappMessage), '_blank')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
            data-testid="button-whatsapp-support"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            হোয়াটসঅ্যাপে যোগাযোগ করুন
          </Button>
          
          <Button
            onClick={() => {
              window.open('/track-order', '_blank');
              onClose();
            }}
            variant="outline"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 py-3"
            data-testid="button-track-order"
          >
            <Truck className="w-5 h-5 mr-2" />
            অর্ডার ট্র্যাক করুন
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 py-3"
            data-testid="button-continue-shopping"
          >
            কেনাকাটা চালিয়ে যান
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
          <span>কোন সমস্যা হলে আমাদের সাথে যোগাযোগ করুন। আপনার অর্ডার ট্র্যাকিং নম্বর সংরক্ষণ করুন।</span>
        </div>
      </div>
    </PerfectModalBase>
  );
}
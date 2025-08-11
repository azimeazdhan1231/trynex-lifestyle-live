import { useState, useEffect } from "react";
import DynamicResponsiveModal from "./dynamic-responsive-modal";
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
  MessageCircle,
  Truck,
  Gift,
  ArrowRight,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  delivery_fee?: number;
}

interface DynamicOrderSuccessModalProps {
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

export default function DynamicOrderSuccessModal({
  isOpen,
  onClose,
  orderData
}: DynamicOrderSuccessModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <DynamicResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="অর্ডার সফল হয়েছে! 🎉"
      description="আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে"
      size={isMobile ? "full" : "xl"}
      data-testid="modal-order-success"
    >
      <div className="space-y-4">
        {/* Success Icon and Message */}
        <div className="text-center py-4">
          <div className={cn(
            "inline-flex items-center justify-center bg-green-100 rounded-full mb-3",
            isMobile ? "w-16 h-16" : "w-20 h-20"
          )}>
            <CheckCircle className={cn("text-green-600", isMobile ? "w-10 h-10" : "w-12 h-12")} />
          </div>
          <h3 className={cn(
            "font-bold text-gray-900 mb-2",
            isMobile ? "text-lg" : "text-2xl"
          )}>
            অভিনন্দন! আপনার অর্ডার গৃহীত হয়েছে
          </h3>
          <p className="text-gray-600 text-sm">
            আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব
          </p>
        </div>

        {/* Tracking Information - Always visible */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className={cn("p-4", !isMobile && "p-6")}>
            <div className={cn(
              "flex items-center justify-between gap-4",
              isMobile ? "flex-col space-y-3" : "flex-row"
            )}>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">ট্র্যাকিং নম্বর</span>
                </div>
                <div className="font-mono font-bold text-green-900 bg-white px-3 py-2 rounded-lg border border-green-200 text-center break-all">
                  {orderData.tracking_id}
                </div>
              </div>
              <Button
                onClick={copyTrackingId}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100 w-full sm:w-auto"
                data-testid="button-copy-tracking"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "কপি হয়েছে!" : "কপি করুন"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary - Compact for mobile */}
        <Card>
          <CardContent className={cn("p-4", !isMobile && "p-6")}>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-600" />
              অর্ডার সারাংশ
            </h4>
            
            {/* Items - Show only count on mobile */}
            {isMobile ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">মোট আইটেম:</span>
                  <span className="font-medium">{orderData.items.length}টি</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                  <span className="font-medium">৳{orderData.delivery_fee}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>সর্বমোট:</span>
                  <span className="text-green-600">৳{orderData.total}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm truncate">{item.name}</h5>
                      <div className="text-xs text-gray-600">
                        পরিমাণ: {item.quantity} • দাম: ৳{item.price}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-sm">
                        ৳{(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>সর্বমোট:</span>
                  <span className="text-green-600">৳{orderData.total}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer & Payment Info - Condensed for mobile */}
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-2"
        )}>
          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                গ্রাহক তথ্য
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">নাম:</span>
                  <span className="font-medium truncate ml-2">{orderData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ফোন:</span>
                  <span className="font-medium">{orderData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">এলাকা:</span>
                  <span className="font-medium text-xs truncate ml-2">{orderData.district}, {orderData.thana}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                পেমেন্ট তথ্য
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">পদ্ধতি:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {orderData.payment_info.payment_method}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TRX ID:</span>
                  <span className="font-medium font-mono text-xs truncate ml-2">{orderData.payment_info.trx_id}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-600">পেমেন্ট:</span>
                  <span className="text-green-600">৳{orderData.payment_info.amount_paid}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800 text-sm">অর্ডার স্ট্যাটাস</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                {orderData.status === 'pending' ? 'অপেক্ষমাণ' : orderData.status}
              </Badge>
              <span className="text-xs text-blue-700">
                আমরা আপনার অর্ডার প্রক্রিয়া করছি
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Stack on mobile */}
        <div className={cn(
          "flex gap-3 pt-4",
          isMobile ? "flex-col" : "flex-row"
        )}>
          <Button
            onClick={() => window.open(createWhatsAppUrl(whatsappMessage), '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
            size={isMobile ? "lg" : "default"}
            data-testid="button-whatsapp-support"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            হোয়াটসঅ্যাপে যোগাযোগ
          </Button>
          
          <Button
            onClick={() => {
              window.open('/track-order', '_blank');
              onClose();
            }}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1"
            size={isMobile ? "lg" : "default"}
            data-testid="button-track-order"
          >
            <Truck className="w-4 h-4 mr-2" />
            ট্র্যাক করুন
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            size={isMobile ? "lg" : "default"}
            data-testid="button-continue-shopping"
          >
            কেনাকাটা চালিয়ে যান
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-200">
          কোন সমস্যা হলে আমাদের সাথে যোগাযোগ করুন। আপনার অর্ডার ট্র্যাকিং নম্বর সংরক্ষণ করুন।
        </div>
      </div>
    </DynamicResponsiveModal>
  );
}
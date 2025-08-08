import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  DollarSign, 
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Eye,
  X,
  Copy,
  MessageSquare
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: {
    text?: string;
    color?: string;
    design?: string;
  };
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  district: string;
  thana: string;
  address: string;
  phone: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: string;
  created_at: string;
  payment_info?: {
    method: string;
    transaction_id?: string;
    amount: number;
    advance_paid?: number;
  };
}

interface MobileOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

export default function MobileOrderModal({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: MobileOrderModalProps) {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');

  if (!order) return null;

  const orderItems = typeof order.items === 'string' 
    ? JSON.parse(order.items) 
    : order.items || [];

  const paymentInfo = typeof order.payment_info === 'string'
    ? JSON.parse(order.payment_info)
    : order.payment_info || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমান';
      case 'confirmed': return 'নিশ্চিত';
      case 'processing': return 'প্রক্রিয়াকরণ';
      case 'shipped': return 'পাঠানো হয়েছে';
      case 'delivered': return 'ডেলিভার';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "কপি হয়েছে",
      description: `${label} ক্লিপবোর্ডে কপি করা হয়েছে`,
    });
  };

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status && onStatusUpdate) {
      onStatusUpdate(order.id, selectedStatus);
      toast({
        title: "স্ট্যাটাস আপডেট",
        description: "অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে",
      });
    }
  };

  const openWhatsApp = () => {
    const message = `আপনার অর্ডার: ${order.tracking_id}\nস্ট্যাটাস: ${getStatusText(order.status)}\nমোট: ${formatPrice(parseFloat(order.total))}`;
    const url = `https://wa.me/88${order.phone.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800">
                অর্ডার বিস্তারিত
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                ট্র্যাকিং ID: {order.tracking_id}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 h-[calc(95vh-120px)] overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  অর্ডার স্ট্যাটাস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-sm font-medium border flex items-center gap-2 w-fit`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="স্ট্যাটাস পরিবর্তন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">অপেক্ষমান</SelectItem>
                      <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                      <SelectItem value="processing">প্রক্রিয়াকরণ</SelectItem>
                      <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                      <SelectItem value="delivered">ডেলিভার</SelectItem>
                      <SelectItem value="cancelled">বাতিল</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={selectedStatus === order.status}
                    className="w-full"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    স্ট্যাটাস আপডেট
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  গ্রাহক তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">নাম</p>
                    <p className="text-sm font-semibold">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">ফোন</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{order.phone}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.phone, 'ফোন নম্বর')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">ঠিকানা</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p>{order.address}</p>
                      <p className="text-gray-500">{order.thana}, {order.district}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={openWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp এ যোগাযোগ
                </Button>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  অর্ডার আইটেম ({orderItems.length}টি)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderItems.map((item: OrderItem, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          {item.customization && (
                            <div className="mt-1 text-xs text-gray-600 space-y-1">
                              {item.customization.text && (
                                <p>কাস্টম টেক্সট: {item.customization.text}</p>
                              )}
                              {item.customization.color && (
                                <p>রং: {item.customization.color}</p>
                              )}
                              {item.customization.design && (
                                <p>ডিজাইন: {item.customization.design}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">পেমেন্ট মেথড</p>
                    <p className="font-medium">{paymentInfo.method || 'ক্যাশ অন ডেলিভারি'}</p>
                  </div>
                  {paymentInfo.transaction_id && (
                    <div>
                      <p className="text-gray-600">ট্রানজেকশন ID</p>
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-xs">{paymentInfo.transaction_id}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.transaction_id, 'ট্রানজেকশন ID')}
                          className="h-5 w-5 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>সাবটোটাল</span>
                    <span>{formatPrice(parseFloat(order.total))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি চার্জ</span>
                    <span>বিনামূল্যে</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>মোট</span>
                    <span className="text-primary">{formatPrice(parseFloat(order.total))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  address: string;
  status: string;
  total: number;
  items: any[];
  payment_info: any;
  custom_instructions?: string;
  custom_images?: string[];
  created_at: string;
}

const statusConfig = {
  pending: { 
    label: "অপেক্ষমান", 
    color: "bg-yellow-500", 
    textColor: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Clock,
    description: "আপনার অর্ডার গ্রহণ করা হয়েছে এবং যাচাই করা হচ্ছে"
  },
  confirmed: { 
    label: "নিশ্চিত", 
    color: "bg-blue-500", 
    textColor: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: CheckCircle2,
    description: "আপনার অর্ডার নিশ্চিত হয়েছে এবং প্রস্তুতি শুরু হয়েছে"
  },
  processing: { 
    label: "প্রক্রিয়াধীন", 
    color: "bg-purple-500", 
    textColor: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Package,
    description: "আপনার পণ্য তৈরি/প্যাকেজিং করা হচ্ছে"
  },
  shipped: { 
    label: "পাঠানো হয়েছে", 
    color: "bg-indigo-500", 
    textColor: "text-indigo-800",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: Truck,
    description: "আপনার পণ্য ডেলিভারির জন্য পাঠানো হয়েছে"
  },
  delivered: { 
    label: "ডেলিভার হয়েছে", 
    color: "bg-green-500", 
    textColor: "text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    description: "আপনার পণ্য সফলভাবে ডেলিভার হয়েছে"
  },
  cancelled: { 
    label: "বাতিল", 
    color: "bg-red-500", 
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertCircle,
    description: "এই অর্ডারটি বাতিল করা হয়েছে"
  },
};

const statusTimeline = [
  { key: "pending", label: "অর্ডার গ্রহণ" },
  { key: "confirmed", label: "অর্ডার নিশ্চিত" },
  { key: "processing", label: "প্রস্তুতি" },
  { key: "shipped", label: "পাঠানো" },
  { key: "delivered", label: "ডেলিভার" }
];

export default function OrderTracking() {
  const [trackingId, setTrackingId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (searchId) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [searchId]);

  // Live order tracking query with auto-refresh
  const { 
    data: trackingResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery<{success: boolean, order: Order}>({
    queryKey: ["/api/orders/track", searchId, lastUpdate.getTime()],
    queryFn: async () => {
      if (!searchId) throw new Error("No tracking ID provided");
      const response = await fetch(`/api/orders/track/${searchId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Order not found' }));
        throw new Error(errorData.message || 'অর্ডার খুঁজে পাওয়া যায়নি');
      }
      return response.json();
    },
    enabled: !!searchId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  const order = trackingResponse?.order;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast({
        title: "ট্র্যাকিং আইডি প্রয়োজন",
        description: "অনুগ্রহ করে আপনার ট্র্যাকিং আইডি লিখুন",
        variant: "destructive",
      });
      return;
    }
    setSearchId(trackingId.trim());
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    refetch();
  };

  const handleCopyTrackingId = () => {
    if (order?.tracking_id) {
      navigator.clipboard.writeText(order.tracking_id);
      toast({
        title: "কপি হয়েছে!",
        description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি করা হয়েছে",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP p", { locale: bn });
    } catch {
      return dateString;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { locale: bn, addSuffix: true });
    } catch {
      return "সময় পাওয়া যায়নি";
    }
  };

  const getStatusIndex = (status: string) => {
    return statusTimeline.findIndex(s => s.key === status);
  };

  const getCurrentStatusConfig = () => {
    return order ? statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending : statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2">অর্ডার ট্র্যাকিং</h1>
            <p className="text-gray-600 text-base md:text-lg lg:text-xl">আপনার অর্ডারের সর্বশেষ অবস্থা জানুন</p>
          </div>

          {/* Search Section */}
          <Card className="shadow-xl border-0 mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
              <CardTitle className="text-center text-lg md:text-xl lg:text-2xl flex items-center justify-center gap-2">
                <Search className="w-5 h-5 md:w-6 md:h-6" />
                ট্র্যাকিং আইডি দিয়ে খোঁজ করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 lg:p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRN1234567890123)"
                    className="h-12 md:h-14 text-base md:text-lg lg:text-xl border-2 border-gray-200 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    ট্র্যাকিং আইডি আপনার অর্ডার কনফার্মেশন SMS বা ইমেইলে পাবেন
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="h-12 md:h-14 px-6 md:px-8 lg:px-10 text-base md:text-lg lg:text-xl bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      খোঁজ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      খোঁজ করুন
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-800">অর্ডার খুঁজে পাওয়া যায়নি</h3>
                    <p className="text-red-600">
                      {error.message || "দুঃখিত, এই ট্র্যাকিং আইডি দিয়ে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক ট্র্যাকিং আইডি লিখুন।"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-8">
              {/* Status Overview */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className={`${getCurrentStatusConfig().bgColor} ${getCurrentStatusConfig().borderColor} border-2 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {(() => {
                        const StatusIcon = getCurrentStatusConfig().icon;
                        return <StatusIcon className="w-6 h-6" />;
                      })()}
                      <span className="text-lg">অর্ডার স্ট্যাটাস</span>
                    </CardTitle>
                    <Button
                      onClick={handleRefresh}
                      variant="ghost"
                      size="sm"
                      disabled={isFetching}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getCurrentStatusConfig().color} px-4 py-2 text-white font-semibold text-base`}>
                          {getCurrentStatusConfig().label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(order.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{getCurrentStatusConfig().description}</p>
                      
                      {/* Status Timeline */}
                      <div className="hidden sm:block">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
                          {statusTimeline.map((status, index) => {
                            const isCompleted = getStatusIndex(order.status) >= index;
                            const isCurrent = status.key === order.status;
                            return (
                              <div key={status.key} className="relative flex flex-col items-center">
                                <div 
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white z-10 ${
                                    isCompleted 
                                      ? 'border-green-500 bg-green-500' 
                                      : isCurrent 
                                        ? `border-${getCurrentStatusConfig().color.split('-')[1]}-500` 
                                        : 'border-gray-300'
                                  }`}
                                >
                                  {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                  {status.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-80">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">ট্র্যাকিং আইডি</span>
                          <Button
                            onClick={handleCopyTrackingId}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-mono text-sm break-all bg-white p-2 rounded border">
                          {order.tracking_id}
                        </p>
                        <Separator className="my-3" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>মোট পণ্য</span>
                            <span>{order.items?.length || 0}টি</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>মোট দাম</span>
                            <span>৳{parseFloat(order.total.toString()).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer & Delivery Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      গ্রাহকের তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p>{order.address}</p>
                        <p className="text-sm text-gray-600">{order.thana}, {order.district}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      অর্ডার তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">অর্ডারের তারিখ</span>
                      <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    {order.payment_info && (
                      <div>
                        <span className="text-sm text-gray-600">পেমেন্ট পদ্ধতি</span>
                        <p className="font-medium">
                          {order.payment_info.method === 'bkash' ? 'বিকাশ' : 
                           order.payment_info.method === 'nagad' ? 'নগদ' : 
                           order.payment_info.method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 
                           order.payment_info.method || 'N/A'}
                        </p>
                      </div>
                    )}
                    {order.custom_instructions && (
                      <div>
                        <span className="text-sm text-gray-600">বিশেষ নির্দেশনা</span>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">{order.custom_instructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    অর্ডার করা পণ্যসমূহ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name || item.productName || 'পণ্য'}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name || item.productName || 'পণ্যের নাম'}</h4>
                          <p className="text-sm text-gray-600">পরিমাণ: {item.quantity || 1}টি</p>
                          <p className="text-sm font-medium text-green-600">৳{parseFloat((item.price || item.productPrice || 0).toString()).toLocaleString()}</p>
                        </div>
                        {item.customization && (
                          <Badge variant="outline" className="text-xs">
                            কাস্টমাইজড
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Auto-refresh notice */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">এই পেজ প্রতি ৩০ সেকেন্ডে আপডেট হয়</span>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!order && !error && !isLoading && (
            <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">সাহায্য প্রয়োজন?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <Phone className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">ফোনে যোগাযোগ</h4>
                      <p className="text-sm text-gray-600 mb-3">তাৎক্ষণিক সাহায্যের জন্য কল করুন</p>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        কল করুন
                      </Button>
                    </div>
                    <div className="text-center">
                      <ExternalLink className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <h4 className="font-medium mb-2">WhatsApp সাপোর্ট</h4>
                      <p className="text-sm text-gray-600 mb-3">দ্রুত সাহায্য পেতে মেসেজ করুন</p>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        মেসেজ করুন
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
}
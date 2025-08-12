import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, Package, CheckCircle, Clock, Truck, 
  User, Phone, MapPin, Calendar, Hash, Banknote,
  RefreshCw, AlertCircle, CheckCircle2,
  ShoppingBag, Copy
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

interface LiveOrderTrackingProps {
  trackingId?: string;
  onTrackingIdChange?: (id: string) => void;
  autoRefresh?: boolean;
}

const statusConfig = {
  pending: { 
    label: "অপেক্ষমান", 
    color: "bg-yellow-500", 
    textColor: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Clock 
  },
  confirmed: { 
    label: "নিশ্চিত", 
    color: "bg-blue-500", 
    textColor: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: CheckCircle2 
  },
  processing: { 
    label: "প্রক্রিয়াধীন", 
    color: "bg-purple-500", 
    textColor: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Package 
  },
  shipped: { 
    label: "পাঠানো হয়েছে", 
    color: "bg-indigo-500", 
    textColor: "text-indigo-800",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: Truck 
  },
  delivered: { 
    label: "ডেলিভার হয়েছে", 
    color: "bg-green-500", 
    textColor: "text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle 
  },
  cancelled: { 
    label: "বাতিল", 
    color: "bg-red-500", 
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertCircle 
  },
};

export default function LiveOrderTracking({ 
  trackingId: propTrackingId, 
  onTrackingIdChange,
  autoRefresh = true 
}: LiveOrderTrackingProps) {
  const [localTrackingId, setLocalTrackingId] = useState(propTrackingId || "");
  const [searchId, setSearchId] = useState(propTrackingId || "");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const trackingId = propTrackingId || localTrackingId;

  // Live order tracking query with auto-refresh
  const { 
    data: order, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery<Order>({
    queryKey: ["/api/orders", searchId],
    queryFn: async () => {
      if (!searchId) throw new Error("No tracking ID provided");
      const response = await fetch(`/api/orders/${searchId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Order not found' }));
        throw new Error(errorData.error || "Order not found");
      }
      return response.json();
    },
    enabled: !!searchId,
    refetchInterval: autoRefresh ? 3000 : false, // Refetch every 3 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale for live updates
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
    retryDelay: 1000,
  });

  // Update last refresh time when data changes
  useEffect(() => {
    if (order) {
      setLastUpdate(new Date());
    }
  }, [order]);

  // Check for tracking ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl && !propTrackingId) {
      setLocalTrackingId(idFromUrl);
      setSearchId(idFromUrl);
    }
  }, [propTrackingId]);

  const handleSearch = () => {
    if (!trackingId.trim()) return;
    const cleanId = trackingId.trim();
    setSearchId(cleanId);
    onTrackingIdChange?.(cleanId);
    
    // Update URL without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('id', cleanId);
    window.history.replaceState({}, '', url.toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const copyTrackingId = () => {
    if (order?.tracking_id) {
      navigator.clipboard.writeText(order.tracking_id);
      toast({
        title: "কপি হয়েছে!",
        description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি করা হয়েছে",
      });
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateString);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
  };

  const manualRefresh = () => {
    refetch();
    toast({
      title: "রিফ্রেশ করা হচ্ছে...",
      description: "অর্ডারের সর্বশেষ তথ্য আনা হচ্ছে",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      {!propTrackingId && (
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              অর্ডার ট্র্যাক করুন
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={trackingId}
                onChange={(e) => setLocalTrackingId(e.target.value)}
                placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRX1234567890123)"
                className="flex-1 text-lg py-3 border-2"
                onKeyPress={handleKeyPress}
                data-testid="input-tracking-id"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !trackingId.trim()}
                className="px-8 py-3 text-lg"
                data-testid="button-search-order"
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? "খোঁজা হচ্ছে..." : "খোঁজ করুন"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Update Indicator */}
      {autoRefresh && searchId && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isFetching ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isFetching ? 'আপডেট হচ্ছে...' : 'লাইভ আপডেট চালু'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              শেষ আপডেট: {lastUpdate.toLocaleTimeString('bn-BD')}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={manualRefresh}
              disabled={isFetching}
              data-testid="button-manual-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && searchId && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">অর্ডার খুঁজে পাওয়া যায়নি</h3>
            <p className="text-red-600">
              "{searchId}" এই ট্র্যাকিং আইডিতে কোনো অর্ডার পাওয়া যায়নি। 
              অনুগ্রহ করে সঠিক ট্র্যাকিং আইডি দিন।
            </p>
            <Button 
              variant="outline" 
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => setSearchId("")}
            >
              আবার চেষ্টা করুন
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {order && !isLoading && (
        <div className="space-y-6">
          {/* Status Card with Progress */}
          <Card className={`border-2 ${getStatusInfo(order.status || 'pending').borderColor} ${getStatusInfo(order.status || 'pending').bgColor}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {React.createElement(getStatusInfo(order.status || 'pending').icon, { className: "w-6 h-6" })}
                  অর্ডার স্ট্যাটাস
                </span>
                <Badge className={`${getStatusInfo(order.status || 'pending').color} text-white px-4 py-2 text-lg`}>
                  {getStatusInfo(order.status || 'pending').label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Progress Timeline */}
              <div className="flex items-center justify-between mb-6">
                {Object.entries(statusConfig).map(([key, config], index) => {
                  const orderStatus = order.status?.toLowerCase() || 'pending';
                  const isActive = key === orderStatus;
                  const isPast = Object.keys(statusConfig).indexOf(orderStatus) > index;
                  
                  return (
                    <div key={key} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                        isActive ? `${config.color} border-transparent text-white` :
                        isPast ? 'bg-green-500 border-transparent text-white' :
                        'bg-gray-200 border-gray-300 text-gray-500'
                      }`}>
                        {React.createElement(config.icon, { className: "w-5 h-5" })}
                      </div>
                      <span className={`text-xs text-center ${
                        isActive ? config.textColor : 
                        isPast ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {config.label}
                      </span>
                      {index < Object.keys(statusConfig).length - 1 && (
                        <div className={`h-1 w-full mt-2 ${
                          isPast ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                অর্ডার তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold">{order.tracking_id}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyTrackingId}
                        className="h-6 w-6 p-0"
                        data-testid="button-copy-tracking-id"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ফোন নম্বর</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">অর্ডার তারিখ</p>
                    <p className="font-semibold">{formatDate(order.created_at?.toString() || null)}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">ডেলিভারি ঠিকানা</p>
                  <p className="font-semibold">
                    {order.address && `${order.address}, `}
                    {order.thana}, {order.district}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                অর্ডারকৃত পণ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && Array.isArray(order.items) ? (
                  order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                        {item.customization && (
                          <div className="text-xs text-blue-600 mt-2 space-y-1">
                            {item.customization.size && <p>সাইজ: {item.customization.size}</p>}
                            {item.customization.color && <p>রং: {item.customization.color}</p>}
                            {item.customization.text && <p>কাস্টম টেক্সট: {item.customization.text}</p>}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">কোনো পণ্যের তথ্য পাওয়া যায়নি</p>
                )}

                <Separator />

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-bold text-lg">মোট পরিমাণ:</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatPrice((order as any).total_amount || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.payment_info && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeof order.payment_info === 'string' ? (
                    <p>{order.payment_info}</p>
                  ) : order.payment_info && typeof order.payment_info === 'object' ? (
                    <>
                      {(order.payment_info as any).method && (
                        <div>
                          <p className="text-sm text-gray-600">পেমেন্ট পদ্ধতি</p>
                          <p className="font-semibold">{(order.payment_info as any).method}</p>
                        </div>
                      )}
                      {(order.payment_info as any).payment_number && (
                        <div>
                          <p className="text-sm text-gray-600">পেমেন্ট নম্বর</p>
                          <p className="font-semibold">{(order.payment_info as any).payment_number}</p>
                        </div>
                      )}
                      {(order.payment_info as any).trx_id && (
                        <div>
                          <p className="text-sm text-gray-600">ট্রানজেকশন আইডি</p>
                          <p className="font-semibold">{(order.payment_info as any).trx_id}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">কোনো পেমেন্ট তথ্য পাওয়া যায়নি</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Clock, CheckCircle, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  address: string;
  status: string;
  items: OrderItem[];
  total: string;
  payment_info?: string;
  created_at: string;
}

const statusMap = {
  pending: { label: "অপেক্ষমান", color: "bg-yellow-500", icon: Clock },
  processing: { label: "প্রক্রিয়াধীন", color: "bg-blue-500", icon: Package },
  shipped: { label: "পাঠানো হয়েছে", color: "bg-purple-500", icon: Truck },
  delivered: { label: "ডেলিভার হয়েছে", color: "bg-green-500", icon: CheckCircle },
};

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState("");
  const [searchId, setSearchId] = useState("");
  const { totalItems } = useCart();

  // Real-time tracking query with refetch interval
  const { data: order, isLoading, error, refetch } = useQuery<Order>({
    queryKey: ["/api/orders", searchId],
    enabled: !!searchId,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    // Auto-refetch when component mounts or searchId changes
    if (searchId) {
      const interval = setInterval(() => {
        refetch();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [searchId, refetch]);

  const handleSearch = () => {
    if (!trackingId.trim()) return;
    setSearchId(trackingId.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusInfo = (status: string) => {
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">অর্ডার ট্র্যাকিং</h1>
            <p className="text-gray-600">আপনার অর্ডারের বর্তমান অবস্থা দেখুন</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                ট্র্যাকিং আইডি দিন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRX123456789)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={!trackingId.trim()}>
                  খুঁজুন
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>অর্ডার খোঁজা হচ্ছে...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">অর্ডার পাওয়া যায়নি</h3>
                <p className="text-gray-600">দয়া করে সঠিক ট্র্যাকিং আইডি দিন এবং আবার চেষ্টা করুন।</p>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {order && !isLoading && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>অর্ডার স্ট্যাটাস</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      রিয়েল-টাইম আপডেট
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const StatusIcon = getStatusInfo(order.status).icon;
                      return (
                        <>
                          <div className={`p-3 rounded-full ${getStatusInfo(order.status).color}`}>
                            <StatusIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              {getStatusInfo(order.status).label}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              ট্র্যাকিং আইডি: {order.tracking_id}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    ডেলিভারি তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600">ঠিকানা:</p>
                    <p className="font-medium">
                      {order.address}, {order.thana}, {order.district}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>অর্ডার বিবরণ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>মোট:</span>
                      <span>{formatPrice(Number(order.total))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>পেমেন্ট তথ্য</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      ডেলিভারি নিশ্চিত করতে পেমেন্ট করুন:
                    </p>
                    <p className="text-blue-900 font-bold text-lg">
                      bKash/Nagad: 01747292277
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      পেমেন্ট করার পর আমাদের সাথে যোগাযোগ করুন
                    </p>
                  </div>
                  {order.payment_info && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 text-sm">
                        পেমেন্ট তথ্য: {order.payment_info}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Date */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600 text-center">
                    অর্ডার তারিখ: {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
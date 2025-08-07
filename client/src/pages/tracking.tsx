import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { 
  Search, Package, CheckCircle, Clock, Truck, 
  User, Phone, MapPin, Calendar, Hash, Banknote,
  Settings
} from "lucide-react";
import type { Order } from "@shared/schema";
import { formatPrice } from "@/lib/constants";

const statusMap = {
  pending: { label: "অপেক্ষমান", color: "bg-yellow-500", icon: Clock },
  processing: { label: "প্রক্রিয়াধীন", color: "bg-blue-500", icon: Package },
  shipped: { label: "পাঠানো হয়েছে", color: "bg-purple-500", icon: Truck },
  delivered: { label: "ডেলিভার হয়েছে", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "বাতিল", color: "bg-red-500", icon: Clock },
};

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState("");
  const [searchId, setSearchId] = useState("");
  const { totalItems } = useCart();
  const [location, setLocation] = useLocation();

  // Check for tracking ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      setSearchId(idFromUrl);
    }
  }, [location]);

  // Real-time tracking query with refetch interval
  const { data: order, isLoading, error, refetch } = useQuery<Order>({
    queryKey: ["/api/orders", searchId],
    queryFn: async () => {
      if (!searchId) throw new Error("No tracking ID provided");
      const response = await fetch(`/api/orders/${searchId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Order not found' }));
        throw new Error(errorData.error || "Order not found");
      }
      return response.json();
    },
    enabled: !!searchId,
    refetchInterval: 2000, // Refetch every 2 second for real-time updates
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    // Auto-refetch when component mounts or searchId changes
    if (searchId) {
      const interval = setInterval(() => {
        refetch();
      }, 3000); // Reduced frequency to 3 seconds
      return () => clearInterval(interval);
    }
  }, [searchId, refetch]);

  const handleSearch = () => {
    if (!trackingId.trim()) return;
    const cleanId = trackingId.trim();
    setSearchId(cleanId);
    // Update URL without page reload
    const newUrl = `/tracking?id=${cleanId}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusInfo = (status: string) => {
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'তারিখ পাওয়া যায়নি';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderItems = Array.isArray(order?.items) ? order.items : [];
  const orderTotal = order ? parseFloat(order.total.toString()) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Cart Info */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">অর্ডার ট্র্যাকিং</h1>
            <p className="text-gray-600">আপনার অর্ডারের বর্তমান অবস্থা জানুন</p>
            {totalItems > 0 && (
              <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                <p className="text-orange-800">
                  আপনার কার্টে {totalItems}টি পণ্য রয়েছে। 
                  <a href="/cart" className="font-semibold underline ml-2">চেকআউট করুন</a>
                </p>
              </div>
            )}
          </div>

          {/* Search Section */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">ট্র্যাকিং আইডি দিয়ে খোঁজ করুন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRX1234567890123)"
                  className="flex-1 text-lg py-3"
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !trackingId.trim()}
                  className="px-8 py-3 text-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isLoading ? "খোঁজা হচ্ছে..." : "খোঁজ করুন"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && searchId && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">অর্ডার খুঁজে পাওয়া যায়নি</h3>
                <p className="text-red-600">
                  "{searchId}" এই ট্র্যাকিং আইডিতে কোনো অর্ডার পাওয়া যায়নি। 
                  অনুগ্রহ করে সঠিক ট্র্যাকিং আইডি দিন।
                </p>
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
                            <p className="text-xl font-semibold">{getStatusInfo(order.status).label}</p>
                            <p className="text-gray-600">আপনার অর্ডারের বর্তমান অবস্থা</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>অর্ডার তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                        <p className="font-mono font-semibold">{order.tracking_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                        <p className="font-semibold">{order.customer_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">ফোন নম্বর</p>
                        <p className="font-semibold">{order.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">অর্ডার তারিখ</p>
                        <p className="font-semibold">{formatDate(order.created_at || null)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
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

              {/* Order Instructions Alert for Customer */}
              {order && order.items && Array.isArray(order.items) && order.items.some((item: any) => 
                item.customization && (
                  item.customization.customText || 
                  item.customization.customImage || 
                  item.customization.specialInstructions
                )
              ) && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">আপনার কাস্টমাইজেশন নির্দেশনা গ্রহণ করা হয়েছে</h4>
                    </div>
                    <p className="text-green-700 text-sm">
                      আমরা আপনার সব কাস্টমাইজেশন নির্দেশনা (টেক্সট, ছবি, বিশেষ নির্দেশনা) পেয়েছি এবং সেই অনুযায়ী পণ্য তৈরি করা হবে।
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>অর্ডারকৃত পণ্য</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItems.map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>পরিমাণ: {item.quantity}</span>
                              <span>মূল্য: {formatPrice(item.price)}</span>
                              <span className="font-medium">মোট: {formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Customization Details */}
                        {(() => {
                          // Check if there's any customization data to show
                          const hasCustomization = item.customization && (
                            item.customization.size || 
                            item.customization.color || 
                            item.customization.printArea || 
                            (item.customization.customText && item.customization.customText.trim()) ||
                            (item.customization.specialInstructions && item.customization.specialInstructions.trim()) ||
                            item.customization.customImage
                          );
                          
                          if (!hasCustomization) return null;
                          
                          return (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                কাস্টমাইজেশন বিবরণ
                              </h5>
                              <div className="text-sm text-blue-700 space-y-2">
                                {item.customization.size && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">সাইজ:</span>
                                    <span>{item.customization.size}</span>
                                  </div>
                                )}
                                {item.customization.color && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">রং:</span>
                                    <span>{item.customization.color}</span>
                                  </div>
                                )}
                                {item.customization.printArea && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">প্রিন্ট এরিয়া:</span>
                                    <span>{item.customization.printArea}</span>
                                  </div>
                                )}
                                {item.customization.customText && item.customization.customText.trim() && (
                                  <div>
                                    <span className="font-medium">কাস্টম টেক্সট:</span>
                                    <p className="mt-1 p-3 bg-white rounded border text-gray-900 whitespace-pre-wrap border-gray-300">{item.customization.customText.trim()}</p>
                                  </div>
                                )}
                                {item.customization.specialInstructions && item.customization.specialInstructions.trim() && (
                                  <div>
                                    <span className="font-medium">বিশেষ নির্দেশনা:</span>
                                    <p className="mt-1 p-3 bg-white rounded border text-gray-900 whitespace-pre-wrap border-gray-300">{item.customization.specialInstructions.trim()}</p>
                                  </div>
                                )}
                                {item.customization.customImage && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600 font-medium">কাস্টম ছবি আপলোড করা হয়েছে</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                        
                        {/* Legacy customization support */}
                        {!item.customization && (item.customText || item.specialInstructions || item.customImage || item.customImages) && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h5 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              কাস্টমাইজেশন তথ্য
                            </h5>
                            <div className="text-sm text-yellow-700 space-y-2">
                              {item.customText && (
                                <div>
                                  <span className="font-medium">কাস্টম টেক্সট:</span>
                                  <p className="mt-1 p-2 bg-white rounded border text-gray-900">{item.customText}</p>
                                </div>
                              )}
                              {item.specialInstructions && (
                                <div>
                                  <span className="font-medium">বিশেষ নির্দেশনা:</span>
                                  <p className="mt-1 p-2 bg-white rounded border text-gray-900">{item.specialInstructions}</p>
                                </div>
                              )}
                              {(item.customImage || item.customImages) && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-green-600 font-medium">কাস্টম ছবি আপলোড করা হয়েছে</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">মোট</span>
                      </div>
                      <span className="text-xl font-bold text-blue-800">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.payment_info && (
                <Card>
                  <CardHeader>
                    <CardTitle>পেমেন্ট তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">পেমেন্ট পদ্ধতি</p>
                      <p className="font-semibold">
                        {typeof order.payment_info === 'string' 
                          ? order.payment_info 
                          : (order.payment_info as any)?.method || 'ক্যাশ অন ডেলিভারি'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
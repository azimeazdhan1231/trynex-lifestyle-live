import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, CheckCircle, XCircle, Clock, Truck } from "lucide-react";
import { ORDER_STATUSES, formatPrice } from "@/lib/constants";
import type { Order } from "@shared/schema";

export default function TrackingSection() {
  const [trackingId, setTrackingId] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { toast } = useToast();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders", trackingId],
    enabled: searchTriggered && trackingId.length > 0,
  });

  const handleTrackOrder = () => {
    if (!trackingId.trim()) {
      toast({
        title: "ট্র্যাকিং আইডি প্রয়োজন",
        description: "অনুগ্রহ করে ট্র্যাকিং আইডি লিখুন",
        variant: "destructive",
      });
      return;
    }
    // Navigate to tracking page with the tracking ID
    window.open(`/tracking?id=${trackingId.trim()}`, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "processing":
        return <Package className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
  };

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">অর্ডার ট্র্যাক করুন</h3>
          <p className="text-gray-600 mb-8">আপনার অর্ডারের বর্তমান অবস্থা জানুন</p>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-left">ট্র্যাকিং সার্চ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRX1234567890123)"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                />
                <Button onClick={handleTrackOrder} disabled={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "খোঁজা হচ্ছে..." : "ট্র্যাক করুন"}
                </Button>
              </div>
              
              {/* Tracking Results */}
              {searchTriggered && (
                <div className="mt-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">অর্ডার খোঁজা হচ্ছে...</p>
                    </div>
                  ) : error || !order ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <XCircle className="w-6 h-6 text-red-500 mr-3" />
                        <div>
                          <h5 className="font-semibold text-red-800">অর্ডার খুঁজে পাওয়া যায়নি</h5>
                          <p className="text-red-700 text-sm mt-1">
                            ট্র্যাকিং আইডি সঠিক কিনা যাচাই করুন অথবা আবার চেষ্টা করুন।
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                        <h5 className="font-semibold text-green-800">অর্ডার খুঁজে পাওয়া গেছে</h5>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">ট্র্যাকিং আইডি:</span>
                          <span className="font-mono">{order.tracking_id}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-medium">স্ট্যাটাস:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status || "pending")}
                            <Badge 
                              variant="secondary" 
                              className={getStatusInfo(order.status || "pending").color}
                            >
                              {getStatusInfo(order.status || "pending").name}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">গ্রাহকের নাম:</span>
                          <span>{order.customer_name}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">মোট পরিমাণ:</span>
                          <span className="font-semibold text-primary">{formatPrice(order.total)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">অর্ডারের তারিখ:</span>
                          <span>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('bn-BD') : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">ডেলিভারি ঠিকানা:</span>
                          <span className="text-right">
                            {order.district}, {order.thana}
                          </span>
                        </div>
                        
                        {order.status === "pending" && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <strong>আনুমানিক ডেলিভারি:</strong> ৩-৫ কার্যদিবস
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

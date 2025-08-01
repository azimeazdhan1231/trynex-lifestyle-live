import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, MapPin, Phone, CreditCard, Eye, Settings, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderDetailsModal from "@/components/order-details-modal";
import type { Order } from "@shared/schema";

export default function OrdersPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "অননুমোদিত",
        description: "আপনি লগআউট হয়ে গেছেন। আবার লগইন করছি...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/user/orders"],
    enabled: isAuthenticated,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "অপেক্ষায়";
      case "confirmed":
        return "নিশ্চিত";
      case "processing":
        return "প্রক্রিয়াধীন";
      case "shipped":
        return "পাঠানো হয়েছে";
      case "delivered":
        return "ডেলিভার";
      case "cancelled":
        return "বাতিল";
      default:
        return status;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">আমার অর্ডার</h1>
            <p className="text-gray-600 mt-2">আপনার সকল অর্ডারের তালিকা এবং স্ট্যাটাস</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !orders || orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো অর্ডার নেই</h3>
                <p className="text-gray-600 mb-6">
                  আপনি এখনো কোনো অর্ডার করেননি। আমাদের পণ্য দেখুন এবং অর্ডার করুন।
                </p>
                <Button asChild>
                  <a href="/products">পণ্য দেখুন</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          অর্ডার #{order.tracking_id}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at!).toLocaleDateString('bn-BD')}
                          </span>
                          <span>মোট: ৳{order.total}</span>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status || 'pending')}>
                        {getStatusText(order.status || 'pending')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">অর্ডার আইটেম</h4>
                        <div className="space-y-3">
                          {Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
                            <div key={index} className="border rounded p-2 bg-gray-50">
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-700 font-medium">
                                  {item.name} × {item.quantity}
                                </span>
                                <span className="font-medium">৳{item.price}</span>
                              </div>
                              
                              {/* Customization indicator */}
                              {(item.customization || item.customText || item.specialInstructions || item.customImage || item.customImages) && (
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                  <Settings className="w-3 h-3" />
                                  <span>কাস্টমাইজড পণ্য</span>
                                  {(item.customization?.customImage || item.customImage || item.customImages) && (
                                    <>
                                      <span>•</span>
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                      <span className="text-green-600">ছবি সহ</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500">আইটেম লোড করা হচ্ছে...</p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">ডেলিভারি তথ্য</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{order.district}, {order.thana}</p>
                              {order.address && <p>{order.address}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{order.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          {order.payment_info && typeof order.payment_info === 'object' && 'method' in order.payment_info
                            ? order.payment_info.method as string
                            : 'ক্যাশ অন ডেলিভারি'}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        বিস্তারিত দেখুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
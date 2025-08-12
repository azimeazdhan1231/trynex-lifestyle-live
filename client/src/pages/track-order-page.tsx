import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle,
  Loader2,
  Copy,
  Search,
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  ShoppingBag
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Order } from "@shared/schema";

interface OrderTrackingData extends Order {
  tracking_url?: string;
  estimated_delivery?: string;
}

export default function TrackOrderPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState(params.id || "");
  const [searchTrackingId, setSearchTrackingId] = useState("");

  const { data: orderData, isLoading, error, refetch } = useQuery<OrderTrackingData>({
    queryKey: ['/api/orders/track', trackingId],
    enabled: !!trackingId && trackingId.length > 5,
    refetchInterval: 30000, // Refresh every 30 seconds for live tracking
    refetchIntervalInBackground: true
  });

  useEffect(() => {
    if (params.id) {
      setTrackingId(params.id);
    }
  }, [params.id]);

  const handleSearch = () => {
    if (searchTrackingId.trim()) {
      setTrackingId(searchTrackingId.trim());
      setLocation(`/track/${searchTrackingId.trim()}`);
    }
  };

  const copyTrackingId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast({
        title: "কপি সম্পন্ন!",
        description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি হয়েছে",
      });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: "কপি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'অর্ডার গৃহীত';
      case 'processing': return 'প্রস্তুতি চলছে';
      case 'shipped': return 'পাঠানো হয়েছে';
      case 'delivered': return 'সফলভাবে পৌঁছেছে';
      case 'cancelled': return 'বাতিল';
      default: return 'অজানা';
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'অর্ডার গৃহীত', icon: CheckCircle },
      { key: 'processing', label: 'প্রস্তুতি চলছে', icon: Package },
      { key: 'shipped', label: 'পাঠানো হয়েছে', icon: Truck },
      { key: 'delivered', label: 'পৌঁছে গেছে', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            হোমে ফিরুন
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">অর্ডার ট্র্যাকিং</h1>
          <p className="text-gray-600">আপনার অর্ডারের সর্বশেষ অবস্থা দেখুন</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="ট্র্যাকিং আইডি লিখুন..."
                  value={searchTrackingId}
                  onChange={(e) => setSearchTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12"
                />
              </div>
              <Button onClick={handleSearch} disabled={!searchTrackingId.trim()} className="h-12">
                <Search className="w-4 h-4 mr-2" />
                খুঁজুন
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">অর্ডার খোঁজা হচ্ছে...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">অর্ডার পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-4">
                অনুগ্রহ করে ট্র্যাকিং আইডি সঠিকভাবে লিখে আবার চেষ্টা করুন।
              </p>
              <Button onClick={() => refetch()}>
                পুনরায় চেষ্টা করুন
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    অর্ডার তথ্য
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(orderData.status || 'pending')}>
                      {getStatusText(orderData.status || 'pending')}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTrackingId(orderData.tracking_id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                    <p className="font-mono text-lg font-semibold">{orderData.tracking_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">অর্ডারের তারিখ</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(orderData.created_at || '').toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                {orderData.estimated_delivery && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">প্রত্যাশিত ডেলিভারি: {orderData.estimated_delivery}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>অর্ডার স্ট্যাটাস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getProgressSteps(orderData.status || 'pending').map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                          ${step.active ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? 'text-green-800' : 'text-gray-600'}`}>
                            {step.label}
                          </p>
                          {step.active && (
                            <p className="text-sm text-blue-600">বর্তমান অবস্থা</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    গ্রাহক তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">নাম</p>
                    <p className="font-medium">{orderData.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ফোন</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {orderData.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    ডেলিভারি ঠিকানা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">জেলা ও থানা</p>
                    <p className="font-medium">{orderData.district}, {orderData.thana}</p>
                  </div>
                  {orderData.address && (
                    <div>
                      <p className="text-sm text-gray-600">বিস্তারিত ঠিকানা</p>
                      <p className="font-medium">{orderData.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  অর্ডার করা পণ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.items && typeof orderData.items === 'object' && Array.isArray(orderData.items) ? (
                    orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{item.name || 'পণ্য'}</p>
                          <p className="text-sm text-gray-600">পরিমাণ: {item.quantity || 1}</p>
                        </div>
                        <p className="font-semibold">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">পণ্যের তালিকা লোড হচ্ছে...</p>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>মোট</span>
                    <span>{formatPrice(parseInt(orderData.total || '0'))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {orderData.payment_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    পেমেন্ট তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">পেমেন্ট মাধ্যম</p>
                      <p className="font-medium">
                        {typeof orderData.payment_info === 'object' && orderData.payment_info !== null && 'payment_method' in orderData.payment_info 
                          ? String(orderData.payment_info.payment_method) 
                          : 'ক্যাশ অন ডেলিভারি'}
                      </p>
                    </div>
                    {typeof orderData.payment_info === 'object' && orderData.payment_info !== null && 'trx_id' in orderData.payment_info && orderData.payment_info.trx_id && (
                      <div>
                        <p className="text-sm text-gray-600">ট্রানজেকশন আইডি</p>
                        <p className="font-mono">{String(orderData.payment_info.trx_id)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useParams } from "wouter";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Package, CheckCircle, Clock, Truck, 
  User, Phone, MapPin, Calendar, Hash,
  RefreshCw, AlertCircle, ArrowLeft
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const statusConfig = {
  pending: { 
    label: "অপেক্ষমান", 
    color: "bg-yellow-500", 
    textColor: "text-yellow-800",
    icon: Clock,
  },
  confirmed: { 
    label: "নিশ্চিত", 
    color: "bg-blue-500", 
    textColor: "text-blue-800",
    icon: CheckCircle,
  },
  processing: { 
    label: "প্রক্রিয়াধীন", 
    color: "bg-purple-500", 
    textColor: "text-purple-800",
    icon: Package,
  },
  shipped: { 
    label: "পাঠানো হয়েছে", 
    color: "bg-indigo-500", 
    textColor: "text-indigo-800",
    icon: Truck,
  },
  delivered: { 
    label: "ডেলিভার হয়েছে", 
    color: "bg-green-500", 
    textColor: "text-green-800",
    icon: CheckCircle,
  },
  cancelled: { 
    label: "বাতিল", 
    color: "bg-red-500", 
    textColor: "text-red-800",
    icon: AlertCircle,
  },
};

// Helper functions
const getStatusInfo = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'তারিখ পাওয়া যায়নি';
  try {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'তারিখ পাওয়া যায়নি';
  }
};

export default function TrackingPage() {
  const params = useParams();
  const urlTrackingId = params.trackingId;
  const [location, navigate] = useLocation();
  const [localTrackingId, setLocalTrackingId] = useState(urlTrackingId || "");
  const [searchId, setSearchId] = useState(urlTrackingId || "");
  const { toast } = useToast();

  const trackingId = urlTrackingId || localTrackingId;

  const { 
    data: trackingResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<{success: boolean, order: any}>({
    queryKey: ["/api/orders/track", searchId],
    queryFn: async () => {
      if (!searchId) throw new Error("No tracking ID provided");
      const response = await fetch(`/api/orders/track/${searchId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Order not found' }));
        throw new Error(errorData.message || "অর্ডার খুঁজে পাওয়া যায়নি");
      }
      return response.json();
    },
    enabled: !!searchId,
    retry: 2,
    retryDelay: 1000,
  });

  const order = trackingResponse?.order;

  const handleSearch = () => {
    if (!trackingId.trim()) return;
    const cleanId = trackingId.trim();
    setSearchId(cleanId);
    navigate(`/tracking/${cleanId}`);
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status?.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">অর্ডার ট্র্যাকিং</h1>
              <p className="text-gray-600">আপনার অর্ডারের বর্তমান অবস্থা জানুন</p>
            </div>
          </div>

          {/* Search Section */}
          {!urlTrackingId && (
            <Card className="shadow-lg border-2 border-primary/20 mb-8">
              <CardHeader>
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
                    placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRK1234567890)"
                    className="flex-1 text-lg py-3 border-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          )}

          {/* Error State */}
          {error && searchId && (
            <Card className="border-red-200 bg-red-50 mb-8">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">অর্ডার খুঁজে পাওয়া যায়নি</h3>
                <p className="text-red-600 mb-4">
                  "{searchId}" এই ট্র্যাকিং আইডিতে কোনো অর্ডার পাওয়া যায়নি। 
                  অনুগ্রহ করে সঠিক ট্র্যাকিং আইডি দিন।
                </p>
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => {
                    setSearchId("");
                    setLocalTrackingId("");
                    navigate('/tracking');
                  }}
                >
                  আবার চেষ্টা করুন
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {order && !isLoading && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {React.createElement(getStatusInfo(order.status || 'pending').icon, { 
                        className: "w-6 h-6" 
                      })}
                      অর্ডার স্ট্যাটাস
                    </span>
                    <Badge className={`${getStatusInfo(order.status || 'pending').color} text-white px-4 py-2 text-lg`}>
                      {getStatusInfo(order.status || 'pending').label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Order Info Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    অর্ডার তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Hash className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">ট্র্যাকিং আইডি</p>
                        <p className="font-mono font-bold text-blue-800">{order.tracking_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                        <p className="font-semibold">{order.customer_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">ফোন নম্বর</p>
                        <p className="font-semibold">{order.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">অর্ডার তারিখ</p>
                        <p className="font-semibold">{formatDate(order.created_at?.toString() || null)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium">ডেলিভারি ঠিকানা</p>
                      <p className="font-semibold text-green-800">
                        {order.address && `${order.address}, `}
                        {order.thana}, {order.district}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refresh Button */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  তথ্য রিফ্রেশ করুন
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

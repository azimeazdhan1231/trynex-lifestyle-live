import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { 
  Search, Package, CheckCircle, Clock, Truck, 
  User, Phone, MapPin, Calendar, Hash,
  RefreshCw, AlertCircle, ArrowLeft, Copy,
  Eye, EyeOff, Timer, Zap
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Enhanced status configuration with progress tracking
const statusConfig = {
  pending: { 
    label: "অপেক্ষমান", 
    color: "bg-yellow-500", 
    textColor: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Clock,
    progress: 10,
    description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং যাচাই করা হচ্ছে"
  },
  confirmed: { 
    label: "নিশ্চিত", 
    color: "bg-blue-500", 
    textColor: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: CheckCircle,
    progress: 25,
    description: "আপনার অর্ডারটি নিশ্চিত করা হয়েছে এবং প্রস্তুতি শুরু হয়েছে"
  },
  processing: { 
    label: "প্রক্রিয়াধীন", 
    color: "bg-purple-500", 
    textColor: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Package,
    progress: 50,
    description: "আপনার অর্ডারটি প্রস্তুত করা হচ্ছে এবং প্যাকেজিং চলছে"
  },
  shipped: { 
    label: "পাঠানো হয়েছে", 
    color: "bg-indigo-500", 
    textColor: "text-indigo-800",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: Truck,
    progress: 75,
    description: "আপনার অর্ডারটি কুরিয়ারে দেওয়া হয়েছে এবং ডেলিভারির পথে"
  },
  delivered: { 
    label: "ডেলিভার হয়েছে", 
    color: "bg-green-500", 
    textColor: "text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    progress: 100,
    description: "আপনার অর্ডারটি সফলভাবে ডেলিভার করা হয়েছে"
  },
  cancelled: { 
    label: "বাতিল", 
    color: "bg-red-500", 
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertCircle,
    progress: 0,
    description: "আপনার অর্ডারটি বাতিল করা হয়েছে"
  },
};

const ComprehensiveTrackingPage = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [trackingId, setTrackingId] = useState(params.trackingId || '');
  const [localTrackingId, setLocalTrackingId] = useState('');
  const [searchId, setSearchId] = useState(params.trackingId || '');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  // Initialize tracking ID from URL or state
  useEffect(() => {
    if (params.trackingId) {
      setTrackingId(params.trackingId);
      setSearchId(params.trackingId);
      setLocalTrackingId(params.trackingId);
    }
  }, [params.trackingId]);

  // Fetch order data with live updates
  const { 
    data: trackingResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ["/api/orders/track", searchId],
    queryFn: async () => {
      if (!searchId) throw new Error("ট্র্যাকিং আইডি প্রয়োজন");
      
      console.log('🔍 Fetching order for tracking ID:', searchId);
      const response = await fetch(`/api/orders/track/${searchId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'অর্ডার খুঁজে পাওয়া যায়নি' }));
        throw new Error(errorData.message || "অর্ডার খুঁজে পাওয়া যায়নি");
      }

      const result = await response.json();
      console.log('✅ Order data received:', result);
      return result;
    },
    enabled: !!searchId,
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 2, // 2 minutes cache
    retry: 3,
    retryDelay: 1000,
  });

  const order = trackingResponse?.order;

  // Update last refresh time when data changes
  useEffect(() => {
    if (order) {
      setLastUpdate(new Date());
    }
  }, [order]);

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
    setLocation(`/tracking/${trackingId.trim()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  const copyTrackingId = async () => {
    if (order?.tracking_id) {
      try {
        await navigator.clipboard.writeText(order.tracking_id);
        toast({
          title: "কপি হয়েছে!",
          description: "ট্র্যাকিং আইডি ক্লিপবোর্ডে কপি করা হয়েছে",
        });
      } catch {
        toast({
          title: "কপি করতে সমস্যা",
          description: "ম্যানুয়ালি কপি করুন",
          variant: "destructive"
        });
      }
    }
  };

  const manualRefresh = () => {
    setLastUpdate(new Date());
    refetch();
    toast({
      title: "রিফ্রেশ করা হচ্ছে...",
      description: "অর্ডারের সর্বশেষ তথ্য আনা হচ্ছে",
    });
  };

  const StatusIcon = order ? getStatusInfo(order.status || 'pending').icon : Clock;
  const statusInfo = order ? getStatusInfo(order.status || 'pending') : statusConfig.pending;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">অর্ডার ট্র্যাকিং</h1>
            <p className="text-gray-600">আপনার অর্ডারের রিয়েল-টাইম স্ট্যাটাস দেখুন</p>
          </div>
        </div>

        {/* Search Section */}
        {!params.trackingId && (
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                অর্ডার ট্র্যাক করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRX1234567890123)"
                  className="flex-1 text-lg py-3 border-2"
                  onKeyPress={handleKeyPress}
                  data-testid="input-tracking-id"
                />
                <Button 
                  type="submit"
                  disabled={isLoading || !trackingId.trim()}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  data-testid="button-search-order"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isLoading ? "খোঁজা হচ্ছে..." : "খোঁজ করুন"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Live Update Controls */}
        {searchId && (
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isFetching ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isFetching ? 'আপডেট হচ্ছে...' : autoRefresh ? 'লাইভ আপডেট চালু' : 'লাইভ আপডেট বন্ধ'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                {autoRefresh ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {autoRefresh ? 'অটো বন্ধ' : 'অটো চালু'}
              </Button>
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
                className="flex items-center gap-2"
                data-testid="button-manual-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">অর্ডার খোঁজা হচ্ছে...</h3>
                  <p className="text-gray-600">অনুগ্রহ করে অপেক্ষা করুন</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-800">
                <AlertCircle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">অর্ডার খুঁজে পাওয়া যায়নি</h3>
                  <p className="text-sm mt-1">
                    ট্র্যাকিং আইডি সঠিক কিনা যাচাই করুন অথবা কাস্টমার সাপোর্টে যোগাযোগ করুন
                  </p>
                  <p className="text-xs mt-2 text-red-600">
                    ট্র্যাকিং আইডি: {searchId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Found - Success State */}
        {order && !isLoading && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <Card className={`border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} shadow-lg`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${statusInfo.color} text-white`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className={`text-xl ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mt-1">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${statusInfo.textColor}`}>
                      {statusInfo.progress}%
                    </div>
                    <div className="text-xs text-gray-500">সম্পূর্ণ</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${statusInfo.color}`}
                      style={{ width: `${statusInfo.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Progress Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  অর্ডার প্রগ্রেস ট্র্যাকিং
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {Object.entries(statusConfig).filter(([key]) => key !== 'cancelled').map(([key, config], index) => {
                    const currentStatus = order.status?.toLowerCase() || 'pending';
                    const isActive = key === currentStatus;
                    const isPast = Object.keys(statusConfig).indexOf(currentStatus) > Object.keys(statusConfig).indexOf(key);
                    const isCancelled = currentStatus === 'cancelled';
                    
                    return (
                      <div key={key} className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${
                          isCancelled ? 'bg-gray-200 border-gray-300 text-gray-400' :
                          isActive ? `${config.color} border-transparent text-white shadow-lg` :
                          isPast ? 'bg-green-500 border-transparent text-white' :
                          'bg-gray-200 border-gray-300 text-gray-500'
                        }`}>
                          {React.createElement(config.icon, { className: "w-6 h-6" })}
                        </div>
                        <span className={`text-xs font-medium ${
                          isCancelled ? 'text-gray-400' :
                          isActive ? config.textColor : 
                          isPast ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    অর্ডার বিবরণ
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              {showDetails && (
                <CardContent className="space-y-4">
                  {/* Tracking ID */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                      <p className="font-mono font-semibold text-lg">{order.tracking_id}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyTrackingId}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      কপি
                    </Button>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        গ্রাহকের তথ্য
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">নাম:</span> {order.customer_name || 'তথ্য নেই'}</p>
                        <p className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">ফোন:</span> {order.phone}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        ডেলিভারি ঠিকানা
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>{order.address}</p>
                        <p>{order.thana}, {order.district}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        অর্ডার করা পণ্য
                      </h4>
                      <div className="border rounded-lg overflow-hidden">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className={`p-3 flex items-center justify-between ${index > 0 ? 'border-t' : ''}`}>
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                              <p className="text-sm text-gray-600">{formatPrice(item.price)} প্রতি পিস</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-lg font-semibold">মোট:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(parseFloat(order.total || '0'))}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        অর্ডারের তারিখ:
                      </span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-blue-900 mb-2">সাহায্য প্রয়োজন?</h3>
                  <p className="text-blue-700 mb-4">
                    আপনার অর্ডার সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => setLocation('/contact')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      যোগাযোগ করুন
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => setLocation('/')}
                    >
                      হোম পেজে ফিরুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ComprehensiveTrackingPage;
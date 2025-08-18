
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ShoppingBag, Copy, ArrowLeft, Share2, Bell,
  MessageCircle, ExternalLink, Eye, Activity
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";
import Layout from "@/components/Layout";

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
    description: "অর্ডার নিশ্চিত হয়েছে এবং প্রস্তুতির জন্য পাঠানো হয়েছে"
  },
  processing: { 
    label: "প্রক্রিয়াধীন", 
    color: "bg-purple-500", 
    textColor: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Package,
    description: "আপনার অর্ডার প্যাকেজিং এবং প্রস্তুতি চলছে"
  },
  shipped: { 
    label: "পাঠানো হয়েছে", 
    color: "bg-indigo-500", 
    textColor: "text-indigo-800",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: Truck,
    description: "পণ্য পাঠানো হয়েছে এবং ডেলিভারির পথে রয়েছে"
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

export default function PremiumLiveTracking() {
  const { trackingId: urlTrackingId } = useParams();
  const navigate = useNavigate();
  const [localTrackingId, setLocalTrackingId] = useState(urlTrackingId || "");
  const [searchId, setSearchId] = useState(urlTrackingId || "");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const { toast } = useToast();

  const trackingId = urlTrackingId || localTrackingId;

  // Live order tracking query with auto-refresh
  const { 
    data: trackingResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery<{success: boolean, order: Order}>({
    queryKey: ["/api/orders/track", searchId],
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
        throw new Error(errorData.message || "অর্ডার খুঁজে পাওয়া যায়নি");
      }
      return response.json();
    },
    enabled: !!searchId,
    refetchInterval: isLiveMode ? 5000 : false, // Refetch every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: 1000,
  });

  const order = trackingResponse?.order;

  // Update last refresh time and view count when data changes
  useEffect(() => {
    if (order) {
      setLastUpdate(new Date());
      setViewCount(prev => prev + 1);
    }
  }, [order]);

  // Check for tracking ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl && !urlTrackingId) {
      setLocalTrackingId(idFromUrl);
      setSearchId(idFromUrl);
    }
  }, [urlTrackingId]);

  const handleSearch = () => {
    if (!trackingId.trim()) return;
    const cleanId = trackingId.trim();
    setSearchId(cleanId);
    navigate(`/tracking/${cleanId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
      } catch (err) {
        toast({
          title: "ত্রুটি",
          description: "কপি করতে সমস্যা হয়েছে",
          variant: "destructive"
        });
      }
    }
  };

  const shareOrder = () => {
    if (order) {
      const shareUrl = `${window.location.origin}/tracking/${order.tracking_id}`;
      const shareText = `আমার অর্ডার ট্র্যাক করুন: ${order.tracking_id}\n${shareUrl}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'অর্ডার ট্র্যাকিং',
          text: shareText,
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "শেয়ার লিঙ্ক কপি হয়েছে!",
          description: "লিঙ্কটি ক্লিপবোর্ডে কপি করা হয়েছে",
        });
      }
    }
  };

  const contactSupport = () => {
    if (order) {
      const message = `আমার অর্ডার সম্পর্কে জানতে চাই।\n\nট্র্যাকিং আইডি: ${order.tracking_id}\nগ্রাহক: ${order.customer_name}\nস্ট্যাটাস: ${getStatusInfo(order.status || 'pending').label}`;
      const whatsappUrl = `https://wa.me/8801747292277?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
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

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    toast({
      title: isLiveMode ? "লাইভ আপডেট বন্ধ" : "লাইভ আপডেট চালু",
      description: isLiveMode ? "অটো রিফ্রেশ বন্ধ করা হয়েছে" : "অটো রিফ্রেশ চালু করা হয়েছে",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">লাইভ অর্ডার ট্র্যাকিং</h1>
                <p className="text-gray-600">রিয়েল-টাইম অর্ডার আপডেট পান</p>
              </div>
            </div>
            {order && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={shareOrder}>
                  <Share2 className="w-4 h-4 mr-1" />
                  শেয়ার
                </Button>
                <Button variant="outline" size="sm" onClick={contactSupport}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  যোগাযোগ
                </Button>
              </div>
            )}
          </div>

          {/* Search Section */}
          {!urlTrackingId && (
            <Card className="shadow-lg border-2 border-primary/20 mb-8">
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
                    placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRK1234567890)"
                    className="flex-1 text-lg py-3 border-2"
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
          )}

          {/* Live Update Controls */}
          {searchId && (
            <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isFetching ? 'bg-green-500 animate-pulse' : isLiveMode ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <div className="text-sm">
                      <span className={`font-medium ${isLiveMode ? 'text-blue-700' : 'text-gray-600'}`}>
                        {isFetching ? 'আপডেট হচ্ছে...' : isLiveMode ? 'লাইভ আপডেট চালু' : 'লাইভ আপডেট বন্ধ'}
                      </span>
                      <p className="text-xs text-gray-500">
                        শেষ আপডেট: {lastUpdate.toLocaleTimeString('bn-BD')} | 
                        দেখা হয়েছে: {viewCount} বার
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleLiveMode}
                      className={isLiveMode ? 'bg-blue-100 text-blue-700' : ''}
                    >
                      <Bell className={`w-4 h-4 mr-1 ${isLiveMode ? 'animate-pulse' : ''}`} />
                      {isLiveMode ? 'লাইভ অন' : 'লাইভ অফ'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={manualRefresh}
                      disabled={isFetching}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                      রিফ্রেশ
                    </Button>
                  </div>
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
              {/* Status Card with Enhanced Progress */}
              <Card className={`border-2 ${getStatusInfo(order.status || 'pending').borderColor} ${getStatusInfo(order.status || 'pending').bgColor}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {React.createElement(getStatusInfo(order.status || 'pending').icon, { 
                        className: `w-6 h-6 ${isFetching ? 'animate-pulse' : ''}` 
                      })}
                      অর্ডার স্ট্যাটাস
                    </span>
                    <Badge className={`${getStatusInfo(order.status || 'pending').color} text-white px-4 py-2 text-lg animate-pulse`}>
                      {getStatusInfo(order.status || 'pending').label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm mb-6 ${getStatusInfo(order.status || 'pending').textColor}`}>
                    {getStatusInfo(order.status || 'pending').description}
                  </p>
                  
                  {/* Enhanced Progress Timeline */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      {Object.entries(statusConfig).slice(0, 5).map(([key, config], index) => {
                        const orderStatus = order.status?.toLowerCase() || 'pending';
                        const currentIndex = Object.keys(statusConfig).indexOf(orderStatus);
                        const isActive = key === orderStatus;
                        const isPast = index < currentIndex;
                        const isFuture = index > currentIndex;
                        
                        return (
                          <div key={key} className="flex flex-col items-center flex-1 relative">
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-500 ${
                              isActive ? `${config.color} border-transparent text-white shadow-lg scale-110` :
                              isPast ? 'bg-green-500 border-transparent text-white' :
                              'bg-gray-200 border-gray-300 text-gray-500'
                            }`}>
                              {React.createElement(config.icon, { className: "w-6 h-6" })}
                            </div>
                            <span className={`text-xs text-center font-medium transition-all duration-300 ${
                              isActive ? `${config.textColor} font-bold` : 
                              isPast ? 'text-green-700' : 'text-gray-500'
                            }`}>
                              {config.label}
                            </span>
                            {index < 4 && (
                              <div className={`absolute top-6 left-1/2 w-full h-1 transition-all duration-500 ${
                                isPast ? 'bg-green-500' : 'bg-gray-200'
                              }`} style={{ transform: 'translateX(50%)' }}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    অর্ডার তথ্য
                    <Badge variant="outline" className="ml-auto">
                      <Eye className="w-3 h-3 mr-1" />
                      {viewCount} বার দেখা হয়েছে
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <Hash className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 font-medium">ট্র্যাকিং আইডি</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-blue-800">{order.tracking_id}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyTrackingId}
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
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

                  <Separator className="my-6" />

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
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

              {/* Order Items */}
              <Card className="shadow-lg">
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
                        <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-blue-200 transition-all duration-300">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
                            <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                            {item.customization && (
                              <div className="text-xs text-blue-600 mt-2 space-y-1 bg-blue-50 p-2 rounded">
                                {item.customization.size && <p>সাইজ: {item.customization.size}</p>}
                                {item.customization.color && <p>রং: {item.customization.color}</p>}
                                {item.customization.text && <p>কাস্টম টেক্সট: {item.customization.text}</p>}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-green-600">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">কোনো পণ্যের তথ্য পাওয়া যায়নি</p>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <span className="font-bold text-xl">মোট পরিমাণ:</span>
                      <span className="font-bold text-2xl text-green-600">
                        {formatPrice((order as any).total_amount || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.payment_info && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="w-5 h-5" />
                      পেমেন্ট তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {typeof order.payment_info === 'string' ? (
                        <p className="p-4 bg-gray-50 rounded-lg">{order.payment_info}</p>
                      ) : order.payment_info && typeof order.payment_info === 'object' ? (
                        <>
                          {(order.payment_info as any).method && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">পেমেন্ট পদ্ধতি</p>
                              <p className="font-semibold">{(order.payment_info as any).method}</p>
                            </div>
                          )}
                          {(order.payment_info as any).payment_number && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">পেমেন্ট নম্বর</p>
                              <p className="font-semibold">{(order.payment_info as any).payment_number}</p>
                            </div>
                          )}
                          {(order.payment_info as any).trx_id && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">ট্রানজেকশন আইডি</p>
                              <p className="font-semibold">{(order.payment_info as any).trx_id}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 p-4 bg-gray-50 rounded-lg">কোনো পেমেন্ট তথ্য পাওয়া যায়নি</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={contactSupport}
                      className="bg-green-600 hover:bg-green-700 text-white py-3"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      সাহায্য প্রয়োজন?
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={shareOrder}
                      className="py-3 border-2"
                      size="lg"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      শেয়ার করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

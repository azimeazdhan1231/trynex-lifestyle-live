import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Clock, CheckCircle, Truck, MapPin, Phone, User, Calendar, Hash, Banknote, Settings,
  FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: any;
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
  payment_info?: any;
  created_at: string;
}

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
        throw new Error("Order not found");
      }
      return response.json();
    },
    enabled: !!searchId,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
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

  const formatDate = (dateString: string) => {
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
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
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
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "খোঁজা হচ্ছে..." : "খুঁজুন"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && searchId && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">অর্ডার খোঁজা হচ্ছে...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && searchId && !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                        <p className="font-semibold">{formatDate(order.created_at)}</p>
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
              {order && order.items && order.items.some((item: any) => 
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
                        {item.customization && (
                          <div className="bg-blue-50 rounded-lg p-3 mt-3">
                            <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              কাস্টমাইজেশন বিবরণ
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              {item.customization.size && (
                                <div>
                                  <span className="font-medium text-blue-800">সাইজ:</span>
                                  <span className="ml-2">{item.customization.size}</span>
                                </div>
                              )}

                              {item.customization.color && (
                                <div>
                                  <span className="font-medium text-blue-800">রং:</span>
                                  <span className="ml-2">{item.customization.color}</span>
                                </div>
                              )}

                              {item.customization.printArea && (
                                <div>
                                  <span className="font-medium text-blue-800">প্রিন্ট এরিয়া:</span>
                                  <span className="ml-2">{item.customization.printArea}</span>
                                </div>
                              )}
                            </div>

                            {item.customization.customText && (
                              <div className="mt-3">
                                <div className="flex items-start gap-2">
                                  <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-blue-800">কাস্টম টেক্সট:</span>
                                    <p className="mt-1 text-gray-700 bg-white p-2 rounded border">{item.customization.customText}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {item.customization.customImage && (
                              <div className="mt-3">
                                <div className="flex items-start gap-2">
                                  <Package className="w-4 h-4 text-blue-600 mt-1" />
                                  <div className="flex-1">
                                    <span className="font-medium text-blue-800">কাস্টম ইমেজ:</span>
                                    <div className="mt-2">
                                      <img 
                                        src={item.customization.customImage} 
                                        alt="Custom Design" 
                                        className="w-32 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => window.open(item.customization.customImage, '_blank')}
                                      />
                                      <p className="text-sm text-blue-600 mt-1 cursor-pointer hover:underline"
                                         onClick={() => window.open(item.customization.customImage, '_blank')}>
                                        ক্লিক করে বড় করে দেখুন
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* All Custom Images - Unified handling with better fallback */}
                            {(() => {
                              // Collect all possible image sources from various fields
                              const images = [];
                              
                              // From customization object
                              if (item.customization) {
                                if (Array.isArray(item.customization.customImages)) {
                                  images.push(...item.customization.customImages);
                                }
                                if (item.customization.customImage && typeof item.customization.customImage === 'string') {
                                  images.push(item.customization.customImage);
                                }
                              }
                              
                              // From item level (fallback)
                              if (Array.isArray(item.customImages)) {
                                images.push(...item.customImages);
                              }
                              if (item.customImage && typeof item.customImage === 'string') {
                                images.push(item.customImage);
                              }

                              // Remove duplicates, empty values, and invalid URLs
                              const uniqueImages = [...new Set(images)]
                                .filter(img => img && typeof img === 'string' && img.trim())
                                .map(img => img.trim());

                              if (uniqueImages.length === 0) return null;

                              const showImage = (imageUrl: string) => {
                                const overlay = document.createElement('div');
                                overlay.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[99999] p-4 cursor-pointer';
                                overlay.innerHTML = `
                                  <div class="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
                                    <img 
                                      src="${imageUrl}" 
                                      alt="Preview" 
                                      class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                      style="max-width: 95vw; max-height: 95vh;"
                                    >
                                    <button 
                                      class="absolute -top-12 right-0 bg-white text-black rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg" 
                                      onclick="this.closest('.fixed').remove()"
                                      title="বন্ধ করুন"
                                    >
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                  </div>
                                `;
                                document.body.appendChild(overlay);
                                overlay.addEventListener('click', (e) => {
                                  if (e.target === overlay) overlay.remove();
                                });
                                
                                // ESC key to close
                                const handleEsc = (e: KeyboardEvent) => {
                                  if (e.key === 'Escape') {
                                    overlay.remove();
                                    document.removeEventListener('keydown', handleEsc);
                                  }
                                };
                                document.addEventListener('keydown', handleEsc);
                              };

                              return (
                                <div className="mt-3">
                                  <div className="flex items-start gap-2">
                                    <Package className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <span className="font-medium text-blue-800">
                                        কাস্টম ইমেজসমূহ ({uniqueImages.length}টি):
                                      </span>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                                        {uniqueImages.map((imageUrl: string, imgIndex: number) => (
                                          <div key={imgIndex} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                                            <img 
                                              src={imageUrl} 
                                              alt={`Custom Design ${imgIndex + 1}`}
                                              className="w-full h-24 object-cover cursor-pointer transition-all duration-200 group-hover:scale-105"
                                              onClick={() => showImage(imageUrl)}
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                  parent.innerHTML = `
                                                    <div class="w-full h-24 bg-gray-200 flex flex-col items-center justify-center text-gray-500">
                                                      <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                      </svg>
                                                      <span class="text-xs">ইমেজ লোড করা যায়নি</span>
                                                    </div>
                                                  `;
                                                }
                                              }}
                                              loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                              <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                              </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                              <span className="text-white text-xs font-medium">
                                                ইমেজ {imgIndex + 1}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        ইমেজে ক্লিক করে বড় করে দেখুন
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {item.customization.specialInstructions && (
                              <div className="mt-3">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-blue-800">বিশেষ নির্দেশনা:</span>
                                    <p className="mt-1 text-gray-700 bg-white p-2 rounded border">{item.customization.specialInstructions}</p>
                                  </div>
                                </div>
                              </div>
                            )}
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
                          : order.payment_info.method || 'ক্যাশ অন ডেলিভারি'
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
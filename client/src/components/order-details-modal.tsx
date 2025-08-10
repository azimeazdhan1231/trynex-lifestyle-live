import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, User, Phone, MapPin, Calendar, Hash, 
  Eye, Download, FileText, Settings, AlertCircle,
  CheckCircle, Clock, Truck, XCircle, Banknote
} from "lucide-react";
import { ORDER_STATUSES, formatPrice } from "@/lib/constants";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!order) return null;

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
  };

  const statusInfo = getStatusInfo(order.status || "pending");

  // Parse order items safely
  const orderItems = Array.isArray(order.items) ? order.items : 
    (typeof order.items === 'string' ? (() => {
      try {
        return JSON.parse(order.items);
      } catch {
        return [];
      }
    })() : []);

  // Parse payment info safely
  const paymentInfo = order.payment_info ? 
    (typeof order.payment_info === 'string' ? (() => {
      try {
        return JSON.parse(order.payment_info);
      } catch {
        return null;
      }
    })() : order.payment_info) : null;

  const handleImageView = (imageUrl: string) => {
    if (imageUrl && imageUrl.trim()) {
      setImagePreview(imageUrl);
    }
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    if (!imageUrl || !imageUrl.trim()) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(imageUrl, '_blank');
    }
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

  const renderImage = (imageUrl: string, alt: string, index?: number) => {
    if (!imageUrl || !imageUrl.trim()) return null;

    return (
      <div key={index} className="relative group">
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleImageView(imageUrl)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="w-6 h-6" />
              অর্ডার বিস্তারিত - {order.tracking_id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${statusInfo.color} text-white`}>
                      {statusInfo.id === 'pending' && <Clock className="w-6 h-6" />}
                      {statusInfo.id === 'processing' && <Package className="w-6 h-6" />}
                      {statusInfo.id === 'shipped' && <Truck className="w-6 h-6" />}
                      {statusInfo.id === 'delivered' && <CheckCircle className="w-6 h-6" />}
                      {statusInfo.id === 'cancelled' && <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-xl font-semibold">{statusInfo.name}</p>
                      <p className="text-gray-600">বর্তমান অবস্থা</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusInfo.color}>
                    {statusInfo.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    গ্রাহকের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">নাম</p>
                      <p className="font-medium">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">ফোন</p>
                      <p className="font-medium">{order.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">ঠিকানা</p>
                      <div className="font-medium">
                        {order.address && <p>{order.address}</p>}
                        <p>{order.thana}, {order.district}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    অর্ডার তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                      <p className="font-mono font-semibold">{order.tracking_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">অর্ডার তারিখ</p>
                      <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                      <p className="font-semibold text-green-600">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  অর্ডার আইটেম ({orderItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orderItems.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            item.customization?.customImage || 
                            item.customImage || 
                            item.image_url || 
                            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                          }
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-gray-600">পরিমাণ:</span>
                              <span className="font-medium ml-1">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">দাম:</span>
                              <span className="font-medium ml-1">{formatPrice(item.price)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">মোট:</span>
                              <span className="font-medium ml-1">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                            {item.category && (
                              <div>
                                <span className="text-gray-600">ক্যাটাগরি:</span>
                                <span className="font-medium ml-1">{item.category}</span>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Customization Details - Always Show Section */}
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                              <Settings className="w-5 h-5" />
                              কাস্টমাইজেশন বিবরণ
                            </h5>
                            
                            {/* Debug info - shows raw customization data */}
                            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                              <details>
                                <summary className="cursor-pointer text-gray-600">Debug: Raw Data</summary>
                                <pre className="mt-2 text-xs overflow-auto max-h-32">
                                  {JSON.stringify({
                                    customization: item.customization,
                                    customText: item.customText,
                                    customImage: item.customImage,
                                    specialInstructions: item.specialInstructions
                                  }, null, 2)}
                                </pre>
                              </details>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="p-3 bg-white rounded border">
                                <span className="text-blue-600 font-medium">সাইজ:</span>
                                <span className="ml-2 font-semibold">
                                  {item.customization?.size || item.size || 'নির্দিষ্ট করা হয়নি'}
                                </span>
                              </div>
                              <div className="p-3 bg-white rounded border">
                                <span className="text-blue-600 font-medium">রং:</span>
                                <span className="ml-2 font-semibold">
                                  {item.customization?.color || item.color || 'নির্দিষ্ট করা হয়নি'}
                                </span>
                              </div>
                              <div className="p-3 bg-white rounded border">
                                <span className="text-blue-600 font-medium">প্রিন্ট এরিয়া:</span>
                                <span className="ml-2 font-semibold">
                                  {item.customization?.printArea || item.printArea || 'নির্দিষ্ট করা হয়নি'}
                                </span>
                              </div>
                              <div className="p-3 bg-white rounded border">
                                <span className="text-blue-600 font-medium">কাস্টমাইজ টাইপ:</span>
                                <span className="ml-2 font-semibold">
                                  {(item.customization && Object.keys(item.customization).length > 0) ? 'কাস্টমাইজড' : 'স্ট্যান্ডার্ড'}
                                </span>
                              </div>
                            </div>

                            {/* Custom Text Section */}
                            <div className="mt-4">
                              <span className="text-blue-600 font-medium block mb-2">কাস্টম টেক্সট:</span>
                              {(() => {
                                const customText = item.customization?.customText || item.customText;
                                return customText && customText.trim() ? (
                                  <div className="p-4 bg-white rounded border border-gray-300 whitespace-pre-wrap text-gray-800 font-medium">
                                    {customText.trim()}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-50 rounded border text-gray-500 italic">
                                    কোনো কাস্টম টেক্সট প্রদান করা হয়নি
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Special Instructions Section */}
                            <div className="mt-4">
                              <span className="text-blue-600 font-medium block mb-2">বিশেষ নির্দেশনা:</span>
                              {(() => {
                                const instructions = item.customization?.specialInstructions || item.specialInstructions;
                                return instructions && instructions.trim() ? (
                                  <div className="p-4 bg-white rounded border border-gray-300 whitespace-pre-wrap text-gray-800 font-medium">
                                    {instructions.trim()}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-50 rounded border text-gray-500 italic">
                                    কোনো বিশেষ নির্দেশনা প্রদান করা হয়নি
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Custom Images Section */}
                            <div className="mt-4">
                              <span className="text-blue-600 font-medium block mb-3">কাস্টম ছবি:</span>
                              {(() => {
                                const customImage = item.customization?.customImage || item.customImage;
                                if (customImage && customImage.trim()) {
                                  return (
                                    <div className="flex gap-4 items-start p-3 bg-white rounded border">
                                      {renderImage(customImage, `কাস্টম ছবি ${index + 1}`, index)}
                                      <div className="flex flex-col gap-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleImageView(customImage)}
                                          className="flex items-center gap-2"
                                        >
                                          <Eye className="w-4 h-4" />
                                          সম্পূর্ণ দেখুন
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleDownloadImage(
                                            customImage, 
                                            item.customization?.customImageName || `custom-image-${index + 1}.jpg`
                                          )}
                                          className="flex items-center gap-2"
                                        >
                                          <Download className="w-4 h-4" />
                                          ডাউনলোড করুন
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="p-3 bg-gray-50 rounded border text-gray-500 italic">
                                      কোনো কাস্টম ছবি আপলোড করা হয়নি
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>


                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {paymentInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    পেমেন্ট তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">পেমেন্ট পদ্ধতি:</span>
                      <span className="ml-2">{paymentInfo.method || 'ক্যাশ অন ডেলিভারি'}</span>
                    </div>
                    {paymentInfo.account_number && (
                      <div>
                        <span className="font-medium">অ্যাকাউন্ট নম্বর:</span>
                        <span className="ml-2">{paymentInfo.account_number}</span>
                      </div>
                    )}
                  </div>
                  {paymentInfo.screenshot && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">পেমেন্ট স্ক্রিনশট:</p>
                      <div className="flex gap-2">
                        {renderImage(paymentInfo.screenshot, "Payment Screenshot")}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImageView(paymentInfo.screenshot)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            দেখুন
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadImage(paymentInfo.screenshot, "payment-screenshot.jpg")}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            ডাউনলোড
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>ছবি প্রিভিউ</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
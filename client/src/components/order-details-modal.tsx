
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
      // Fallback to direct link
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
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden bg-gray-200 w-24 h-24 rounded-lg border flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
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
                  অর্ডারকৃত পণ্য ({orderItems.length}টি)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orderItems.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-4">
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
                      {(item.customization || item.customText || item.specialInstructions || item.customImages || item.customImage) && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            কাস্টমাইজেশন বিবরণ
                          </h5>

                          {/* Basic customization */}
                          {item.customization && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
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
                          )}

                          {/* Custom Text */}
                          {(item.customization?.customText || item.customText) && (
                            <div className="mb-4">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <span className="font-medium text-blue-800">কাস্টম টেক্সট:</span>
                                  <p className="mt-1 text-gray-700 bg-white p-2 rounded border">
                                    {item.customization?.customText || item.customText}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Special Instructions */}
                          {(item.customization?.specialInstructions || item.specialInstructions) && (
                            <div className="mb-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <span className="font-medium text-blue-800">বিশেষ নির্দেশনা:</span>
                                  <p className="mt-1 text-gray-700 bg-white p-2 rounded border">
                                    {item.customization?.specialInstructions || item.specialInstructions}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Custom Images */}
                          {(() => {
                            // Collect all possible image sources
                            const images = [];
                            
                            // From customization.customImages (array)
                            if (item.customization?.customImages && Array.isArray(item.customization.customImages)) {
                              images.push(...item.customization.customImages);
                            }
                            
                            // From customization.customImage (single)
                            if (item.customization?.customImage && typeof item.customization.customImage === 'string') {
                              images.push(item.customization.customImage);
                            }
                            
                            // From direct customImages (fallback)
                            if (item.customImages && Array.isArray(item.customImages)) {
                              images.push(...item.customImages);
                            }
                            
                            // From direct customImage (fallback)
                            if (item.customImage && typeof item.customImage === 'string') {
                              images.push(item.customImage);
                            }

                            // Remove duplicates and empty values
                            const uniqueImages = [...new Set(images.filter(img => img && img.trim()))];

                            if (uniqueImages.length === 0) return null;

                            return (
                              <div className="mb-4">
                                <div className="flex items-start gap-2">
                                  <Package className="w-4 h-4 text-blue-600 mt-1" />
                                  <div className="flex-1">
                                    <span className="font-medium text-blue-800">
                                      কাস্টম ইমেজসমূহ ({uniqueImages.length}টি):
                                    </span>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                      {uniqueImages.map((imageUrl: string, imgIndex: number) => 
                                        renderImage(imageUrl, `Custom Image ${imgIndex + 1}`, imgIndex)
                                      )}
                                    </div>
                                    
                                    {/* Download All Images Button */}
                                    <div className="flex gap-2 mt-3">
                                      {uniqueImages.map((imageUrl: string, imgIndex: number) => (
                                        <Button
                                          key={imgIndex}
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDownloadImage(imageUrl, `custom-${order.tracking_id}-${index}-${imgIndex}.jpg`)}
                                          className="flex items-center gap-1 text-xs"
                                        >
                                          <Download className="w-3 h-3" />
                                          ইমেজ {imgIndex + 1}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* No customization message */}
                          {!item.customization && !item.customText && !item.specialInstructions && !item.customImages && !item.customImage && (
                            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>এই পণ্যের জন্য কোনো কাস্টমাইজেশন নেই</p>
                            </div>
                          )}
                        </div>
                      )}

                      {index < orderItems.length - 1 && <Separator className="my-4" />}
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
                            onClick={() => handleDownloadImage(paymentInfo.screenshot, `payment-${order.tracking_id}.jpg`)}
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

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  অর্ডার সময়সূচি
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">অর্ডার প্রাপ্ত:</span>
                    <span className="font-medium">{formatDate(order.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>ইমেজ প্রিভিউ</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-6 pt-2">
              <img 
                src={imagePreview} 
                alt="Full size preview" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={() => setImagePreview(null)}
              />
            </div>
            <div className="p-6 pt-2 flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => handleDownloadImage(imagePreview, 'image.jpg')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                ডাউনলোড করুন
              </Button>
              <Button
                variant="outline"
                onClick={() => setImagePreview(null)}
              >
                বন্ধ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

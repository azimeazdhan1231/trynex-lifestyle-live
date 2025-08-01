import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, User, Phone, MapPin, Calendar, Hash, 
  Eye, Download, FileText, Settings, AlertCircle,
  CheckCircle, Clock, Truck, XCircle, Banknote,
  ImageIcon, Palette, Type, MessageSquare
} from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const ORDER_STATUSES = [
  { id: 'pending', name: 'অপেক্ষমান', color: 'bg-yellow-500' },
  { id: 'processing', name: 'প্রক্রিয়াধীন', color: 'bg-blue-500' },
  { id: 'shipped', name: 'পাঠানো হয়েছে', color: 'bg-purple-500' },
  { id: 'delivered', name: 'ডেলিভার হয়েছে', color: 'bg-green-500' },
  { id: 'cancelled', name: 'বাতিল', color: 'bg-red-500' }
];

export default function EnhancedOrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!order) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              অর্ডার তথ্য পাওয়া যায়নি
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">অর্ডারের বিস্তারিত তথ্য লোড করা যায়নি।</p>
            <Button onClick={onClose} className="mt-4">
              বন্ধ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
  };

  const statusInfo = getStatusInfo(order.status || "pending");

  // Parse order items with enhanced error handling
  const orderItems = (() => {
    try {
      if (Array.isArray(order.items)) return order.items;
      if (typeof order.items === 'string') return JSON.parse(order.items);
      return [];
    } catch (error) {
      console.error('Error parsing order items:', error);
      return [];
    }
  })();

  // Parse payment info with enhanced error handling
  const paymentInfo = (() => {
    try {
      if (!order.payment_info) return null;
      if (typeof order.payment_info === 'object') return order.payment_info;
      if (typeof order.payment_info === 'string') return JSON.parse(order.payment_info);
      return null;
    } catch (error) {
      console.error('Error parsing payment info:', error);
      return null;
    }
  })();

  const handleImageView = (imageUrl: string) => {
    if (imageUrl && imageUrl.trim()) {
      setImagePreview(imageUrl);
    }
  };

  const formatDate = (dateString: string) => {
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

  const renderCustomizationImage = (imageData: string | File, alt: string, index?: number) => {
    if (!imageData) return null;

    let imageUrl = '';
    if (typeof imageData === 'string') {
      // Handle base64 data URLs or regular URLs
      imageUrl = imageData.startsWith('data:') ? imageData : imageData;
    } else if (imageData instanceof File) {
      imageUrl = URL.createObjectURL(imageData);
    }

    if (!imageUrl) return null;

    return (
      <div key={index || alt} className="relative group border-2 border-blue-200 rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-24 h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleImageView(imageUrl)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            console.log('Image load error for:', imageUrl);
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
          <ImageIcon className="w-3 h-3" />
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="w-6 h-6 text-blue-600" />
              অর্ডার বিস্তারিত - {order.tracking_id || 'ট্র্যাকিং আইডি নেই'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enhanced Status Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${statusInfo.color} text-white shadow-lg`}>
                      {statusInfo.id === 'pending' && <Clock className="w-6 h-6" />}
                      {statusInfo.id === 'processing' && <Package className="w-6 h-6" />}
                      {statusInfo.id === 'shipped' && <Truck className="w-6 h-6" />}
                      {statusInfo.id === 'delivered' && <CheckCircle className="w-6 h-6" />}
                      {statusInfo.id === 'cancelled' && <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">{statusInfo.name}</p>
                      <p className="text-gray-600">বর্তমান অবস্থা</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`${statusInfo.color} text-white border-0 px-4 py-2 text-sm`}>
                    {statusInfo.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Customer Information */}
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <User className="w-5 h-5" />
                    গ্রাহকের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <User className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">গ্রাহকের নাম</p>
                      <p className="font-semibold text-gray-800">{order.customer_name || 'নাম পাওয়া যায়নি'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">মোবাইল নম্বর</p>
                      <p className="font-semibold text-blue-700">{order.phone || 'ফোন নম্বর নেই'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">ডেলিভারি ঠিকানা</p>
                      <div className="font-medium text-gray-800">
                        {order.address && <p className="mb-1">{order.address}</p>}
                        <p className="text-red-600">{order.thana || 'থানা নেই'}, {order.district || 'জেলা নেই'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Order Information */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Hash className="w-5 h-5" />
                    অর্ডার তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">ট্র্যাকিং আইডি</p>
                      <p className="font-mono font-bold text-purple-700 text-lg">{order.tracking_id || 'ট্র্যাকিং আইডি নেই'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">অর্ডার তারিখ</p>
                      <p className="font-semibold text-gray-800">{order.created_at ? formatDate(order.created_at) : 'তারিখ পাওয়া যায়নি'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Banknote className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                      <p className="font-bold text-green-600 text-xl">{order.total ? formatPrice(order.total) : 'মূল্য পাওয়া যায়নি'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Order Items with Customization Display */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Package className="w-6 h-6" />
                  অর্ডার আইটেম ({orderItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">কোনো পণ্য তথ্য পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orderItems.map((item: any, index: number) => (
                      <Card key={index} className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Product Info */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="text-sm text-gray-600">পণ্যের নাম</p>
                                  <p className="font-semibold text-lg">{item.name || 'পণ্যের নাম নেই'}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">পরিমাণ:</span>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {item.quantity || 1}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">দাম:</span>
                                  <span className="font-semibold text-green-600">{item.price ? formatPrice(item.price) : 'দাম নেই'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Customization Details */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Palette className="w-5 h-5 text-purple-600" />
                                <p className="font-semibold text-purple-800">কাস্টমাইজেশন বিস্তারিত</p>
                              </div>
                              
                              {item.customization ? (
                                <div className="space-y-2 bg-purple-50 p-3 rounded-lg border border-purple-200">
                                  {item.customization.size && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">সাইজ:</span>
                                      <Badge variant="outline" className="border-purple-300 text-purple-700">
                                        {item.customization.size}
                                      </Badge>
                                    </div>
                                  )}
                                  {item.customization.color && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">রং:</span>
                                      <Badge variant="outline" className="border-purple-300 text-purple-700">
                                        {item.customization.color}
                                      </Badge>
                                    </div>
                                  )}
                                  {item.customization.customText && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Type className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-600">কাস্টম টেক্সট:</span>
                                      </div>
                                      <p className="bg-white p-2 rounded border text-sm font-medium">
                                        {item.customization.customText}
                                      </p>
                                    </div>
                                  )}
                                  {item.customization.instructions && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-600">বিশেষ নির্দেশনা:</span>
                                      </div>
                                      <p className="bg-white p-2 rounded border text-sm">
                                        {item.customization.instructions}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">কোনো কাস্টমাইজেশন নেই</p>
                              )}
                            </div>

                            {/* Uploaded Images */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-orange-600" />
                                <p className="font-semibold text-orange-800">আপলোড করা ছবি</p>
                              </div>
                              
                              {item.customization?.customImage || item.customization?.uploadedImages ? (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap gap-3">
                                    {item.customization.customImage && renderCustomizationImage(item.customization.customImage, `কাস্টম ছবি ${index + 1}`)}
                                    {item.customization.uploadedImages && Array.isArray(item.customization.uploadedImages) && 
                                      item.customization.uploadedImages.map((img: any, imgIndex: number) => 
                                        renderCustomizationImage(img, `আপলোড ছবি ${imgIndex + 1}`, imgIndex)
                                      )
                                    }
                                  </div>
                                  <p className="text-xs text-gray-500">ছবি দেখতে ক্লিক করুন</p>
                                </div>
                              ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-gray-500 text-sm">কোনো ছবি আপলোড করা হয়নি</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            {paymentInfo && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Banknote className="w-5 h-5" />
                    পেমেন্ট তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentInfo.method && (
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">পেমেন্ট মাধ্যম</p>
                          <p className="font-semibold">{paymentInfo.method}</p>
                        </div>
                      </div>
                    )}
                    {paymentInfo.trxId && (
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">ট্রানজেকশন আইডি</p>
                          <p className="font-mono font-semibold">{paymentInfo.trxId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {paymentInfo.screenshot && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">পেমেন্ট স্ক্রিনশট</p>
                      {renderCustomizationImage(paymentInfo.screenshot, 'পেমেন্ট স্ক্রিনশট')}
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
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>ছবি প্রিভিউ</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <img 
                src={imagePreview} 
                alt="বড় ছবি"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-center gap-2 pb-4">
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imagePreview;
                  link.download = 'order-image.jpg';
                  link.click();
                }}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                ডাউনলোড
              </Button>
              <Button onClick={() => setImagePreview(null)}>
                বন্ধ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, ORDER_STATUSES } from "@/lib/constants";
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Eye,
  Download,
  FileText,
  Image as ImageIcon
} from "lucide-react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
  };

  const statusInfo = getStatusInfo(order.status || "pending");

  // Parse order items
  const orderItems = Array.isArray(order.items) ? order.items : 
    (typeof order.items === 'string' ? JSON.parse(order.items) : []);

  // Parse payment info
  const paymentInfo = order.payment_info ? 
    (typeof order.payment_info === 'string' ? JSON.parse(order.payment_info) : order.payment_info) : null;

  const handleImageView = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleDownloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            অর্ডার বিস্তারিত - {order.tracking_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">অর্ডার স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1 text-sm ${statusInfo.color}`}
                >
                  {statusInfo.name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  গ্রাহকের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p>{order.address}</p>
                    <p className="text-sm text-gray-600">{order.thana}, {order.district}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>মোট পরিমাণ:</span>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
                
                {paymentInfo && (
                  <>
                    {paymentInfo.method && (
                      <div className="flex justify-between">
                        <span>পেমেন্ট মেথড:</span>
                        <span>{paymentInfo.method}</span>
                      </div>
                    )}
                    {paymentInfo.trx_id && (
                      <div className="flex justify-between">
                        <span>ট্রানজেকশন আইডি:</span>
                        <span className="font-mono text-sm">{paymentInfo.trx_id}</span>
                      </div>
                    )}
                    {paymentInfo.account_number && (
                      <div className="flex justify-between">
                        <span>অ্যাকাউন্ট নম্বর:</span>
                        <span>{paymentInfo.account_number}</span>
                      </div>
                    )}
                    {paymentInfo.screenshot && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">পেমেন্ট স্ক্রিনশট:</p>
                        <div className="relative">
                          <img 
                            src={paymentInfo.screenshot} 
                            alt="Payment Screenshot" 
                            className="w-full max-w-xs rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageView(paymentInfo.screenshot)}
                          />
                          <div className="flex gap-2 mt-2">
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                অর্ডার আইটেম ({orderItems.length}টি পণ্য)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>পরিমাণ: <span className="font-medium">{item.quantity}</span></div>
                          <div>মূল্য: <span className="font-medium">{formatPrice(item.price)}</span></div>
                          {item.size && (
                            <div>সাইজ: <span className="font-medium">{item.size}</span></div>
                          )}
                          {item.color && (
                            <div>রং: <span className="font-medium">{item.color}</span></div>
                          )}
                        </div>
                        
                        {/* Custom Instructions */}
                        {(item.customText || item.specialInstructions) && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              কাস্টম নির্দেশনা
                            </h5>
                            {item.customText && (
                              <p className="text-sm text-blue-800 mb-1">
                                <strong>কাস্টম টেক্সট:</strong> {item.customText}
                              </p>
                            )}
                            {item.specialInstructions && (
                              <p className="text-sm text-blue-800">
                                <strong>বিশেষ নির্দেশনা:</strong> {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Custom Images */}
                        {item.customImages && item.customImages.length > 0 && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-900 mb-3 flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" />
                              কাস্টম ইমেজ ({item.customImages.length}টি)
                            </h5>
                            <div className="grid grid-cols-3 gap-2">
                              {item.customImages.map((imageUrl: string, imgIndex: number) => (
                                <div key={imgIndex} className="relative group">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Custom ${imgIndex + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleImageView(imageUrl)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {item.customImages.map((imageUrl: string, imgIndex: number) => (
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
                        )}

                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">সাবটোটাল:</span>
                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                অর্ডার সময়সূচি
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">অর্ডার প্রাপ্ত:</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${statusInfo.color.includes('green') ? 'bg-green-500' : statusInfo.color.includes('yellow') ? 'bg-yellow-500' : statusInfo.color.includes('blue') ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-600">বর্তমান স্ট্যাটাস:</span>
                  <span className="font-medium">{statusInfo.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


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
  Image as ImageIcon,
  Hash,
  Palette,
  Type,
  Layers
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            অর্ডার বিস্তারিত - {order.tracking_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-5 h-5" />
                অর্ডার স্ট্যাটাস ও তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
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
                <div className="text-right">
                  <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
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

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Package className="w-5 h-5" />
                অর্ডার আইটেম ({orderItems.length}টি পণ্য)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orderItems.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-6 bg-gray-50">
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Product Basic Info */}
                      <div className="lg:col-span-1">
                        <div className="flex gap-4">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
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
                            <div className="mt-3 pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">সাবটোটাল:</span>
                                <span className="font-semibold text-lg">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customization Details */}
                      <div className="lg:col-span-2">
                        {(item.customization || item.customText || item.specialInstructions || item.customImages) && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                              <Layers className="w-5 h-5" />
                              কাস্টমাইজেশন বিবরণ
                            </h5>
                            
                            <div className="space-y-4">
                              {/* Basic Customization */}
                              {item.customization && (
                                <div className="grid md:grid-cols-2 gap-4">
                                  {item.customization.size && (
                                    <div className="flex items-center gap-2">
                                      <Layers className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium text-blue-800">সাইজ:</span>
                                      <span>{item.customization.size}</span>
                                    </div>
                                  )}
                                  {item.customization.color && (
                                    <div className="flex items-center gap-2">
                                      <Palette className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium text-blue-800">রং:</span>
                                      <span>{item.customization.color}</span>
                                    </div>
                                  )}
                                  {item.customization.printArea && (
                                    <div className="flex items-center gap-2">
                                      <Package className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium text-blue-800">প্রিন্ট এরিয়া:</span>
                                      <span>{item.customization.printArea}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Custom Text */}
                              {(item.customization?.customText || item.customText) && (
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex items-start gap-2">
                                    <Type className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                      <span className="font-medium text-blue-800">কাস্টম টেক্সট:</span>
                                      <p className="mt-1 text-gray-700">{item.customization?.customText || item.customText}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Special Instructions */}
                              {(item.customization?.specialInstructions || item.specialInstructions) && (
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                      <span className="font-medium text-blue-800">বিশেষ নির্দেশনা:</span>
                                      <p className="mt-1 text-gray-700">{item.customization?.specialInstructions || item.specialInstructions}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Custom Images */}
                              {(item.customization?.customImages || item.customImages || item.customization?.customImage) && (
                                <div className="bg-white p-3 rounded border">
                                  <h6 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    আপলোড করা ইমেজসমূহ
                                  </h6>
                                  
                                  <div className="grid grid-cols-4 gap-3">
                                    {/* Handle single custom image */}
                                    {item.customization?.customImage && (
                                      <div className="relative group">
                                        <img 
                                          src={item.customization.customImage} 
                                          alt="Custom Design"
                                          className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => handleImageView(item.customization.customImage)}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      </div>
                                    )}

                                    {/* Handle multiple custom images */}
                                    {(item.customization?.customImages || item.customImages) && 
                                      (item.customization?.customImages || item.customImages).map((imageUrl: string, imgIndex: number) => (
                                        <div key={imgIndex} className="relative group">
                                          <img 
                                            src={imageUrl} 
                                            alt={`Custom ${imgIndex + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleImageView(imageUrl)}
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                            <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        </div>
                                      ))
                                    }
                                  </div>

                                  {/* Download All Images Button */}
                                  <div className="flex gap-2 mt-3">
                                    {item.customization?.customImage && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadImage(item.customization.customImage, `custom-${order.tracking_id}-${index}-single.jpg`)}
                                        className="flex items-center gap-1 text-xs"
                                      >
                                        <Download className="w-3 h-3" />
                                        ইমেজ ডাউনলোড
                                      </Button>
                                    )}
                                    {(item.customization?.customImages || item.customImages) && 
                                      (item.customization?.customImages || item.customImages).map((imageUrl: string, imgIndex: number) => (
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
                                      ))
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!(item.customization || item.customText || item.specialInstructions || item.customImages) && (
                          <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>এই পণ্যের জন্য কোনো কাস্টমাইজেশন নেই</p>
                          </div>
                        )}
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
                <Calendar className="w-5 h-5" />
                অর্ডার সময়সূচি
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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
                  <div className={`w-3 h-3 rounded-full ${statusInfo.color.includes('green') ? 'bg-green-500' : statusInfo.color.includes('yellow') ? 'bg-yellow-500' : statusInfo.color.includes('blue') ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-600">বর্তমান স্ট্যাটাস:</span>
                  <span className="font-medium">{statusInfo.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

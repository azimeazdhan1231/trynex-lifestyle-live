import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// ScrollArea import moved inline
import { 
  Package, User, Phone, MapPin, Calendar, Hash, 
  Eye, Download, FileText, Settings, AlertCircle,
  CheckCircle, Clock, Truck, XCircle, Banknote,
  ShoppingCart, CreditCard, MessageSquare, Copy,
  ExternalLink, Image as ImageIcon
} from "lucide-react";
import { ORDER_STATUSES, formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function PerfectOrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'payment' | 'custom'>('details');
  const { toast } = useToast();

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

  // Parse custom images safely
  const customImages = order.custom_images ? 
    (typeof order.custom_images === 'string' ? (() => {
      try {
        return JSON.parse(order.custom_images);
      } catch {
        return [];
      }
    })() : order.custom_images) : [];

  const handleCopyTrackingNumber = () => {
    navigator.clipboard.writeText(order.tracking_number);
    toast({
      title: "কপি হয়েছে",
      description: "ট্র্যাকিং নম্বর কপি করা হয়েছে",
    });
  };

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
      
      toast({
        title: "ডাউনলোড শুরু হয়েছে",
        description: `${filename} ডাউনলোড হচ্ছে`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      window.open(imageUrl, '_blank');
    }
  };

  const tabs = [
    { id: 'details', label: 'অর্ডার বিবরণ', icon: FileText },
    { id: 'items', label: 'পণ্য তালিকা', icon: Package },
    { id: 'payment', label: 'পেমেন্ট তথ্য', icon: CreditCard },
    { id: 'custom', label: 'কাস্টম তথ্য', icon: ImageIcon }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                  অর্ডার বিস্তারিত তথ্য
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  ট্র্যাকিং নম্বর: {order.tracking_number}
                </DialogDescription>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge 
                  className={`${statusInfo.color} px-3 py-1 text-sm font-medium`}
                >
                  <statusInfo.icon className="w-4 h-4 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTrackingNumber}
                  className="text-xs"
                  data-testid="button-copy-tracking"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  কপি করুন
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 max-h-[500px] overflow-y-auto">
            {/* Order Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base text-gray-900">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        গ্রাহকের তথ্য
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">নাম:</span>
                        <span className="font-medium">{order.customer_name || 'নাম নেই'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ফোন:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{order.phone || 'ফোন নেই'}</span>
                          {order.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`tel:${order.phone}`, '_blank')}
                              className="h-6 w-6 p-0"
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-gray-600">ঠিকানা:</span>
                        <span className="font-medium text-right max-w-[200px]">
                          {order.address || 'ঠিকানা নেই'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base text-gray-900">
                        <Package className="w-5 h-5 mr-2 text-green-500" />
                        অর্ডার সামারি
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">অর্ডার তারিখ:</span>
                        <span className="font-medium">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'Asia/Dhaka'
                          }) : 'তারিখ নেই'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">পণ্যের সংখ্যা:</span>
                        <span className="font-medium">{orderItems.length}টি পণ্য</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">মোট পরিমাণ:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                      {order.delivery_fee && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                          <span>{formatPrice(order.delivery_fee)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base text-gray-900">
                        <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
                        বিশেষ নির্দেশনা
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {order.special_instructions}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                {orderItems.length > 0 ? (
                  orderItems.map((item: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {item.image_url && (
                            <div className="flex-shrink-0">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md border cursor-pointer hover:opacity-75"
                                onClick={() => handleImageView(item.image_url)}
                              />
                            </div>
                          )}
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-gray-600">পরিমাণ: {item.quantity}টি</span>
                              <span className="font-medium text-green-600">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              প্রতি পিস: {formatPrice(item.price)}
                            </div>
                            
                            {/* Show customization data if available */}
                            {item.customization && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                                <h5 className="text-sm font-medium text-blue-900 mb-2">কাস্টমাইজেশন:</h5>
                                <div className="space-y-1 text-sm text-blue-800">
                                  {item.customization.color && (
                                    <div>রং: <span className="font-medium">{item.customization.color}</span></div>
                                  )}
                                  {item.customization.size && (
                                    <div>সাইজ: <span className="font-medium">{item.customization.size}</span></div>
                                  )}
                                  {item.customization.text && (
                                    <div>টেক্সট: <span className="font-medium">{item.customization.text}</span></div>
                                  )}
                                  {item.customization.font && (
                                    <div>ফন্ট: <span className="font-medium">{item.customization.font}</span></div>
                                  )}
                                  {item.customization.instructions && (
                                    <div>নির্দেশনা: <span className="font-medium">{item.customization.instructions}</span></div>
                                  )}
                                  {item.customization.custom_images && item.customization.custom_images.length > 0 && (
                                    <div>
                                      <div className="mb-2">কাস্টম ছবি:</div>
                                      <div className="flex flex-wrap gap-2">
                                        {item.customization.custom_images.map((img: string, idx: number) => (
                                          <img
                                            key={idx}
                                            src={img}
                                            alt={`Custom image ${idx + 1}`}
                                            className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75"
                                            onClick={() => handleImageView(img)}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">কোনো পণ্যের তথ্য পাওয়া যায়নি</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-base text-gray-900">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                      পেমেন্ট তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {paymentInfo ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">পেমেন্ট পদ্ধতি:</span>
                          <Badge variant="outline" className="capitalize">
                            {paymentInfo.method === 'advance_payment' ? 'অ্যাডভান্স পেমেন্ট' : 
                             paymentInfo.method === 'cash_on_delivery' ? 'ক্যাশ অন ডেলিভারি' : 
                             paymentInfo.method || 'N/A'}
                          </Badge>
                        </div>
                        {paymentInfo.payment_number && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">পেমেন্ট নম্বর:</span>
                            <span className="font-medium">{paymentInfo.payment_number}</span>
                          </div>
                        )}
                        {paymentInfo.trx_id && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">ট্রানজেকশন আইডি:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {paymentInfo.trx_id}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(paymentInfo.trx_id);
                                  toast({ title: "কপি হয়েছে", description: "Transaction ID কপি করা হয়েছে" });
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {paymentInfo.amount_paid && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">প্রদানকৃত অর্থ:</span>
                            <span className="font-bold text-green-600">
                              {formatPrice(paymentInfo.amount_paid)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">পেমেন্ট তথ্য পাওয়া যায়নি</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Financial Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-base text-gray-900">
                      <Banknote className="w-5 h-5 mr-2 text-green-500" />
                      আর্থিক সামারি
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">সাবটোটাল:</span>
                      <span>{formatPrice((order.total_amount || 0) - (order.delivery_fee || 0))}</span>
                    </div>
                    {order.delivery_fee && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                        <span>{formatPrice(order.delivery_fee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>সর্বমোট:</span>
                      <span className="text-green-600">{formatPrice(order.total_amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Custom Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-6">
                {/* Custom Instructions */}
                {order.custom_instructions && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base text-gray-900">
                        <Settings className="w-5 h-5 mr-2 text-purple-500" />
                        কাস্টমাইজেশন নির্দেশনা
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                        {order.custom_instructions}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Custom Images */}
                {customImages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base text-gray-900">
                        <ImageIcon className="w-5 h-5 mr-2 text-orange-500" />
                        আপলোডকৃত ছবি ({customImages.length}টি)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {customImages.map((imageUrl: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Custom image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => handleImageView(imageUrl)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-md transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleImageView(imageUrl)}
                                  className="h-8 w-8 p-0"
                                  data-testid={`button-view-image-${index}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleDownloadImage(imageUrl, `custom-image-${index + 1}.jpg`)}
                                  className="h-8 w-8 p-0"
                                  data-testid={`button-download-image-${index}`}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Custom Data */}
                {!order.custom_instructions && customImages.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Settings className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">কোনো কাস্টম তথ্য পাওয়া যায়নি</p>
                      <p className="text-sm text-gray-400 mt-2">
                        এই অর্ডারে কোনো বিশেষ নির্দেশনা বা ছবি আপলোড করা হয়নি
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>ছবি প্রিভিউ</DialogTitle>
              <DialogDescription>
                ফুল সাইজে দেখতে ছবিতে ক্লিক করুন
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-md"
                onClick={() => window.open(imagePreview, '_blank')}
              />
              <div className="flex justify-center mt-4 space-x-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(imagePreview, '_blank')}
                  data-testid="button-open-full-size"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ফুল সাইজে দেখুন
                </Button>
                <Button
                  onClick={() => handleDownloadImage(imagePreview, 'image.jpg')}
                  data-testid="button-download-preview"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ডাউনলোড করুন
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, User, Phone, MapPin, Package, Calendar, 
  Hash, DollarSign, FileText, Image as ImageIcon,
  Palette, Settings
} from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "অপেক্ষমান";
      case "processing": return "প্রক্রিয়াকরণ";
      case "shipped": return "পাঠানো হয়েছে";
      case "delivered": return "সরবরাহ করা হয়েছে";
      case "cancelled": return "বাতিল";
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            অর্ডার বিস্তারিত - #{order.tracking_id}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  অর্ডার স্ট্যাটাস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={`px-4 py-2 text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </Badge>
                  <div className="text-right text-sm text-gray-600">
                    <p>অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
                    <p>সময়: {new Date(order.created_at).toLocaleTimeString('bn-BD')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  গ্রাহক তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">নাম</p>
                      <p className="font-medium">{order.customer_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">ফোন</p>
                      <p className="font-medium">{order.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">ঠিকানা</p>
                      <p className="font-medium">{order.address}</p>
                      <p className="text-sm text-gray-500">{order.district}, {order.thana}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  অর্ডার আইটেম
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items && order.items.map((item: any, index: number) => (
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
                            <Palette className="w-4 h-4" />
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
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-800">কাস্টম ছবি:</span>
                                <span className="text-green-600">{item.customization.customImage.name || "আপলোড করা হয়েছে"}</span>
                              </div>
                            </div>
                          )}

                          {item.customization.specialInstructions && (
                            <div className="mt-3">
                              <div className="flex items-start gap-2">
                                <Settings className="w-4 h-4 text-blue-600 mt-0.5" />
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
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>সাবটোটাল:</span>
                    <span>{formatPrice(Number(order.total) - 80)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>{formatPrice(80)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>মোট:</span>
                    <span className="text-primary">{formatPrice(Number(order.total))}</span>
                  </div>
                  
                  {order.payment_info && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">পেমেন্ট তথ্য:</p>
                      <p className="font-medium">{order.payment_info}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  ট্র্যাকিং তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">ট্র্যাকিং আইডি</p>
                    <p className="text-lg font-bold text-blue-800 font-mono">{order.tracking_id}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>গ্রাহক এই আইডি দিয়ে অর্ডার ট্র্যাক করতে পারবেন</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
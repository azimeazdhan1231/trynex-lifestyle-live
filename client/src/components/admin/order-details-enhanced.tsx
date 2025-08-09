import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  Image as ImageIcon,
  FileText,
  Truck,
  Calendar,
  DollarSign,
  Eye,
  Download,
  Palette,
  Type,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Order } from "@shared/schema";

interface OrderDetailsEnhancedProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  onAddNote: (orderId: string, note: string) => void;
}

export default function OrderDetailsEnhanced({ 
  order, 
  onUpdateStatus, 
  onAddNote 
}: OrderDetailsEnhancedProps) {
  const [newNote, setNewNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [showCustomizationDetails, setShowCustomizationDetails] = useState(true);

  const orderItems = typeof order.items === 'string' 
    ? JSON.parse(order.items) 
    : order.items || [];

  const paymentInfo = typeof order.payment_info === 'string'
    ? JSON.parse(order.payment_info)
    : order.payment_info || {};

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onUpdateStatus(order.id, selectedStatus);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(order.id, newNote);
      setNewNote("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBangla = (status: string) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমাণ';
      case 'confirmed': return 'নিশ্চিত';
      case 'processing': return 'প্রক্রিয়াধীন';
      case 'shipped': return 'পাঠানো হয়েছে';
      case 'delivered': return 'ডেলিভার হয়েছে';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                অর্ডার #{order.tracking_id}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusBangla(order.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Update */}
          <div className="flex items-center gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">অপেক্ষমাণ</SelectItem>
                <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                <SelectItem value="cancelled">বাতিল</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStatusUpdate}
              disabled={selectedStatus === order.status}
              size="sm"
            >
              স্ট্যাটাস আপডেট করুন
            </Button>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">ডেলিভারি ফি</p>
                <p className="font-semibold">{formatPrice(order.delivery_fee || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">পেমেন্ট</p>
                <p className="font-semibold">
                  {paymentInfo.method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : paymentInfo.method?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            গ্রাহকের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">নাম</span>
              </div>
              <p className="text-gray-900">{order.customer_name}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">ফোন</span>
              </div>
              <p className="text-gray-900">{order.phone}</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">ঠিকানা</span>
            </div>
            <p className="text-gray-900">
              {order.address}<br />
              {order.thana}, {order.district}
            </p>
          </div>

          {paymentInfo.delivery_instructions && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">ডেলিভারি নির্দেশনা</span>
              </div>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">
                {paymentInfo.delivery_instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items with Customization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            অর্ডার আইটেম ও কাস্টমাইজেশন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {orderItems.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || "/placeholder.jpg"}
                      alt={item.product_name || item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{item.product_name || item.name}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">পরিমাণ: {item.quantity}</span>
                      <span className="text-sm text-gray-600">দাম: {formatPrice(item.price)}</span>
                      <span className="font-semibold">মোট: {formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>

                {/* Customization Details */}
                {item.customization && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        কাস্টমাইজেশন বিবরণ
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCustomizationDetails(!showCustomizationDetails)}
                      >
                        {showCustomizationDetails ? 'লুকান' : 'দেখান'}
                      </Button>
                    </div>

                    {showCustomizationDetails && (
                      <div className="space-y-3">
                        {/* Basic Customization */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {item.customization.size && (
                            <div>
                              <span className="text-gray-600">সাইজ:</span>
                              <span className="ml-2 font-medium">{item.customization.size}</span>
                            </div>
                          )}
                          {item.customization.color && (
                            <div className="flex items-center">
                              <span className="text-gray-600">রং:</span>
                              <div className="ml-2 flex items-center gap-2">
                                <span className="font-medium">{item.customization.color}</span>
                                <Palette className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          )}
                          {item.customization.material && (
                            <div>
                              <span className="text-gray-600">উপাদান:</span>
                              <span className="ml-2 font-medium">{item.customization.material}</span>
                            </div>
                          )}
                          {item.customization.printArea && (
                            <div>
                              <span className="text-gray-600">প্রিন্ট এরিয়া:</span>
                              <span className="ml-2 font-medium">{item.customization.printArea}</span>
                            </div>
                          )}
                          {item.customization.printQuality && (
                            <div>
                              <span className="text-gray-600">প্রিন্ট কোয়ালিটি:</span>
                              <span className="ml-2 font-medium">{item.customization.printQuality}</span>
                            </div>
                          )}
                          {item.customization.deliveryPreference && (
                            <div>
                              <span className="text-gray-600">ডেলিভারি:</span>
                              <span className="ml-2 font-medium">{item.customization.deliveryPreference}</span>
                            </div>
                          )}
                        </div>

                        {/* Custom Text */}
                        {item.customization.customText && (
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <Type className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-800">কাস্টম টেক্সট</span>
                            </div>
                            <p className="text-blue-900">{item.customization.customText}</p>
                          </div>
                        )}

                        {/* Special Instructions */}
                        {item.customization.specialInstructions && (
                          <div className="bg-yellow-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">বিশেষ নির্দেশনা</span>
                            </div>
                            <p className="text-yellow-900">{item.customization.specialInstructions}</p>
                          </div>
                        )}

                        {/* Additional Requests */}
                        {item.customization.additionalRequests && (
                          <div className="bg-green-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800">অতিরিক্ত অনুরোধ</span>
                            </div>
                            <p className="text-green-900">{item.customization.additionalRequests}</p>
                          </div>
                        )}

                        {/* Custom Image */}
                        {item.customization.customImage && (
                          <div className="bg-purple-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-3">
                              <ImageIcon className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-purple-800">আপলোড করা ছবি</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <img
                                src={item.customization.customImage}
                                alt="Custom uploaded image"
                                className="w-24 h-24 object-cover rounded border"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(item.customization.customImage, '_blank')}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  দেখুন
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = item.customization.customImage;
                                    link.download = `custom-image-${item.product_name}-${Date.now()}.jpg`;
                                    link.click();
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  ডাউনলোড
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            অ্যাডমিন নোট
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="অর্ডার সম্পর্কে নোট যোগ করুন..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              নোট যোগ করুন
            </Button>
          </div>

          {/* Existing Notes */}
          {order.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">পূর্ববর্তী নোট:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <pre className="whitespace-pre-wrap text-sm">{order.notes}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
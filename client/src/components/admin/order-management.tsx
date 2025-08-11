import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { 
  Eye, Package, Phone, MapPin, Calendar, User, CreditCard, 
  Clock, Truck, CheckCircle, XCircle, ImageIcon, AlertTriangle
} from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderManagementProps {
  orders: Order[];
}

// Order status translations
const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function OrderManagement({ orders }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "সফল",
        description: "অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const formatDate = (dateInput: string | Date | null) => {
    if (!dateInput) return "";
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>অর্ডার ব্যবস্থাপনা</CardTitle>
          <CardDescription>অর্ডার দেখুন এবং স্ট্যাটাস আপডেট করুন</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Orders Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ট্র্যাকিং ID</TableHead>
                  <TableHead>গ্রাহক</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>মোট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono" data-testid={`text-order-tracking-${order.id}`}>
                      {order.tracking_id}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-order-customer-${order.id}`}>
                      {order.customer_name}
                    </TableCell>
                    <TableCell data-testid={`text-order-phone-${order.id}`}>
                      {order.phone}
                    </TableCell>
                    <TableCell data-testid={`text-order-total-${order.id}`}>
                      {formatPrice(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status || "pending"}
                        onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUSES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell data-testid={`text-order-date-${order.id}`}>
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        data-testid={`button-view-order-${order.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        বিস্তারিত
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার বিস্তারিত</DialogTitle>
            <DialogDescription>
              ট্র্যাকিং ID: {selectedOrder?.tracking_id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    গ্রাহকের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">নাম</p>
                    <p className="font-medium" data-testid="text-order-detail-customer">
                      {selectedOrder.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ফোন</p>
                    <p className="font-medium" data-testid="text-order-detail-phone">
                      {selectedOrder.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">জেলা</p>
                    <p className="font-medium" data-testid="text-order-detail-district">
                      {selectedOrder.district}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">থানা</p>
                    <p className="font-medium" data-testid="text-order-detail-thana">
                      {selectedOrder.thana}
                    </p>
                  </div>
                  {selectedOrder.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">ঠিকানা</p>
                      <p className="font-medium" data-testid="text-order-detail-address">
                        {selectedOrder.address}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card data-testid="card-order-items">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    অর্ডার আইটেম
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => {
                      return (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium" data-testid={`text-order-item-name-${index}`}>
                            {item.name || 'অজানা পণ্য'}
                          </p>
                          <p className="text-sm text-gray-600">
                            পরিমাণ: {item.quantity || 0} × {formatPrice(Number(item.price || 0))}
                          </p>
                        </div>
                        <p className="font-medium" data-testid={`text-order-item-total-${index}`}>
                          {formatPrice(Number(item.price || 0) * (item.quantity || 0))}
                        </p>
                      </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold">মোট:</p>
                      <p className="text-lg font-bold text-green-600" data-testid="text-order-detail-total">
                        {formatPrice(Number(selectedOrder.total))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {selectedOrder.payment_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      পেমেন্ট তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {typeof selectedOrder.payment_info === 'object' && selectedOrder.payment_info && Object.entries(selectedOrder.payment_info).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-600 capitalize">{key}</p>
                          <p className="font-medium" data-testid={`text-payment-${key}`}>
                            {value ? String(value) : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Instructions and Images from Order Items */}
              {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.some((item: any) => {
                const hasCustomization = item.customization && (
                  item.customization.color || 
                  item.customization.size || 
                  item.customization.text || 
                  item.customization.special_instructions || 
                  (item.customization.uploaded_images && Array.isArray(item.customization.uploaded_images) && item.customization.uploaded_images.length > 0)
                );
                return hasCustomization;
              }) && (
                <Card data-testid="card-customization-details">
                  <CardHeader>
                    <CardTitle>কাস্টমাইজেশন বিস্তারিত</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, itemIndex: number) => {
                      if (!item.customization) return null;
                      
                      const customization = item.customization;
                      const hasCustomizations = customization.color || customization.size || 
                        customization.text || customization.special_instructions || 
                        (customization.uploaded_images && customization.uploaded_images.length > 0);
                      
                      if (!hasCustomizations) return null;
                      
                      return (
                        <div key={itemIndex} className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="font-semibold text-lg mb-3">{item.name}</h4>
                          
                          {/* Customization Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                            {customization.color && (
                              <div>
                                <span className="text-gray-600">রং:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div 
                                    className="w-4 h-4 rounded border"
                                    style={{ 
                                      backgroundColor: customization.color === 'white' ? '#FFFFFF' : 
                                                     customization.color === 'black' ? '#000000' :
                                                     customization.color === 'red' ? '#EF4444' :
                                                     customization.color === 'blue' ? '#3B82F6' :
                                                     customization.color === 'green' ? '#10B981' :
                                                     customization.color === 'yellow' ? '#F59E0B' :
                                                     customization.color === 'pink' ? '#EC4899' :
                                                     customization.color === 'purple' ? '#8B5CF6' :
                                                     customization.color 
                                    }}
                                  />
                                  <span className="font-medium capitalize">{customization.color}</span>
                                </div>
                              </div>
                            )}
                            
                            {customization.size && (
                              <div>
                                <span className="text-gray-600">সাইজ:</span>
                                <span className="font-medium ml-1">{customization.size}</span>
                              </div>
                            )}
                            
                            {customization.text && (
                              <div className="col-span-2">
                                <span className="text-gray-600">টেক্সট:</span>
                                <span className="font-medium ml-1">"{customization.text}"</span>
                              </div>
                            )}
                            
                            {customization.font && customization.font !== 'default' && (
                              <div>
                                <span className="text-gray-600">ফন্ট:</span>
                                <span className="font-medium ml-1">{customization.font}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Special Instructions */}
                          {customization.special_instructions && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-800 mb-2">বিশেষ নির্দেশনা:</h5>
                              <p className="text-gray-700 bg-white p-3 rounded border">
                                {customization.special_instructions}
                              </p>
                            </div>
                          )}
                          
                          {/* Custom Uploaded Images */}
                          {customization.uploaded_images && Array.isArray(customization.uploaded_images) && customization.uploaded_images.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-800 mb-3">আপলোড করা ছবি:</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {customization.uploaded_images.map((imageData: any, imageIndex: number) => {
                                  // Handle different image data formats
                                  let imageUrl = '';
                                  if (typeof imageData === 'string') {
                                    imageUrl = imageData;
                                  } else if (imageData && typeof imageData === 'object') {
                                    // Handle File object or blob URL
                                    if (imageData.name || imageData.type) {
                                      // This is a File object - we can't display it directly
                                      return (
                                        <div key={imageIndex} className="bg-gray-200 rounded-lg p-4 text-center">
                                          <ImageIcon className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                                          <p className="text-xs text-gray-600">
                                            {imageData.name || 'আপলোড করা ফাইল'}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            (ফাইল সেভ করা হয়নি)
                                          </p>
                                        </div>
                                      );
                                    }
                                  }
                                  
                                  if (!imageUrl) return null;
                                  
                                  return (
                                    <div key={imageIndex} className="relative group">
                                      <img
                                        src={imageUrl}
                                        alt={`Custom image ${imageIndex + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border"
                                        data-testid={`img-custom-${itemIndex}-${imageIndex}`}
                                        onError={(e) => {
                                          // Handle broken image URLs
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                      <div className="hidden w-full h-24 bg-gray-200 rounded-lg border flex items-center justify-center">
                                        <div className="text-center">
                                          <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                          <p className="text-xs text-gray-500">ছবি লোড করা যায়নি</p>
                                        </div>
                                      </div>
                                      
                                      {/* Image preview on hover */}
                                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => window.open(imageUrl, '_blank')}
                                          className="text-xs"
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          দেখুন
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Note about image storage */}
                              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                নোট: শুধুমাত্র সার্ভারে সংরক্ষিত ছবি প্রদর্শিত হবে। লোকাল ফাইল প্রদর্শিত হবে না।
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Order Status and Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    অর্ডার স্ট্যাটাস
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Badge className={STATUS_COLORS[selectedOrder.status as keyof typeof STATUS_COLORS]}>
                      {ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES] || selectedOrder.status}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      অর্ডার তারিখ: {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
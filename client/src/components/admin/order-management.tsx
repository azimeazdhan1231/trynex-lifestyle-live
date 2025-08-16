import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { Eye, ShoppingCart, Clock, Package, Truck, CheckCircle, XCircle, Search, Filter } from "lucide-react";
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

export default function OrderManagement({ orders }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest("PATCH", `/api/orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "সফল",
        description: "অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।",
      });
      setOrderDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const parseOrderItems = (items: any) => {
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch {
        return [{
          productName: items,
          name: items,
          quantity: 1, 
          productPrice: 0, 
          customization: null, 
          customizationCost: 0, 
          totalPrice: 0,
          custom_images: null,
          special_instructions: null
        }];
      }
    }
    if (Array.isArray(items)) {
      return items.map((item: any) => ({
        productName: item.productName || item.name || 'কাস্টম আইটেম',
        name: item.name || item.productName || 'কাস্টম আইটেম',
        quantity: item.quantity || 1,
        productPrice: Number(item.productPrice || item.price || 0),
        customization: item.customization || item.custom_options || null,
        customizationCost: Number(item.customizationCost || item.customization_cost || 0),
        totalPrice: Number(item.totalPrice || (item.productPrice * item.quantity) || 0),
        custom_images: item.custom_images || null,
        special_instructions: item.special_instructions || null
      }));
    }
    return [];
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const processingOrders = orders.filter(order => order.status === "processing").length;
  const shippedOrders = orders.filter(order => order.status === "shipped").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;
  const cancelledOrders = orders.filter(order => order.status === "cancelled").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <Package className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">অপেক্ষমান</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">প্রক্রিয়াধীন</p>
                <p className="text-2xl font-bold text-blue-600">{processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">পাঠানো</p>
                <p className="text-2xl font-bold text-purple-600">{shippedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">ডেলিভার</p>
                <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">বাতিল</p>
                <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Orders Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>অর্ডার ব্যবস্থাপনা</CardTitle>
              <CardDescription>সকল অর্ডার দেখুন এবং পরিচালনা করুন</CardDescription>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="নাম, ট্র্যাকিং ID বা ফোন নম্বর দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব অর্ডার</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                  <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                  <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  <TableHead>মোট পরিমাণ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {order.tracking_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.district}, {order.thana}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">{order.phone}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatPrice(Number(order.total))}</p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={getStatusColor(order.status || "pending")}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status || "pending")}
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('bn-BD') : ''}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrderDetails(order)}
                        data-testid={`button-view-order-${order.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        বিস্তারিত
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all" 
                  ? "কোনো অর্ডার খুঁজে পাওয়া যায়নি।"
                  : "কোনো অর্ডার পাওয়া যায়নি।"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার বিস্তারিত</DialogTitle>
            <DialogDescription>
              অর্ডার ID: {selectedOrder?.tracking_id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">গ্রাহক তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>নাম:</strong> {selectedOrder.customer_name}</p>
                      <p><strong>ফোন:</strong> {selectedOrder.phone}</p>
                      <p><strong>জেলা:</strong> {selectedOrder.district}</p>
                      <p><strong>থানা:</strong> {selectedOrder.thana}</p>
                    </div>
                    <div>
                      {selectedOrder.address && <p><strong>ঠিকানা:</strong> {selectedOrder.address}</p>}
                      <p><strong>অর্ডারের তারিখ:</strong> {new Date(selectedOrder.created_at || '').toLocaleDateString('bn-BD')}</p>
                      <p><strong>মোট পরিমাণ:</strong> {formatPrice(Number(selectedOrder.total))}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-base font-medium">অর্ডার স্ট্যাটাস আপডেট করুন:</Label>
                    <Select
                      value={selectedOrder.status || "pending"}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="mt-2" data-testid="select-order-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">অপেক্ষমান</SelectItem>
                        <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                        <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                        <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                        <SelectItem value="cancelled">বাতিল</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedOrder.custom_instructions && (
                    <div className="mt-4">
                      <strong>বিশেষ নির্দেশনা:</strong>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedOrder.custom_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">অর্ডারকৃত পণ্য</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parseOrderItems(selectedOrder.items).map((item: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-lg">{item.productName}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <p><span className="font-medium">পরিমাণ:</span> {item.quantity}</p>
                              <p><span className="font-medium">দাম:</span> {formatPrice(item.productPrice)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(item.totalPrice)}</p>
                          </div>
                        </div>

                        {/* Show customization details if available */}
                        {item.customization && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="font-medium text-blue-800 mb-2">কাস্টমাইজেশন বিবরণ:</p>
                            
                            {/* Text customization */}
                            {item.customization.text && (
                              <div className="mb-2">
                                <span className="text-blue-700 font-medium">টেক্সট:</span>
                                <p className="text-blue-600 bg-white p-2 rounded border mt-1">"{item.customization.text}"</p>
                              </div>
                            )}

                            {/* Font and color */}
                            {(item.customization.font || item.customization.color) && (
                              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                                {item.customization.font && (
                                  <p><span className="font-medium text-blue-700">ফন্ট:</span> {item.customization.font}</p>
                                )}
                                {item.customization.color && (
                                  <p><span className="font-medium text-blue-700">রং:</span> 
                                    <span 
                                      className="inline-block w-4 h-4 rounded ml-2 border" 
                                      style={{ backgroundColor: item.customization.color }}
                                    ></span>
                                    {item.customization.color}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Special instructions */}
                            {item.customization.specialInstructions && (
                              <div className="mb-2">
                                <span className="text-blue-700 font-medium">বিশেষ নির্দেশনা:</span>
                                <p className="text-blue-600 text-sm mt-1">{item.customization.specialInstructions}</p>
                              </div>
                            )}

                            {/* Custom images */}
                            {item.customization.uploaded_images && item.customization.uploaded_images.length > 0 && (
                              <div>
                                <span className="text-blue-700 font-medium">আপলোড করা ছবি:</span>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  {item.customization.uploaded_images.map((imageData: any, imageIndex: number) => {
                                    const imageUrl = imageData.dataUrl || imageData.url || imageData;
                                    return (
                                      <div key={imageIndex} className="relative group">
                                        <img
                                          src={imageUrl}
                                          alt={`Custom image ${imageIndex + 1}`}
                                          className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-75"
                                          onClick={() => window.open(imageUrl, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded transition-all duration-200 flex items-center justify-center">
                                          <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Customization Cost */}
                            {item.customizationCost > 0 && (
                              <div className="text-xs text-blue-600 mt-2">
                                অতিরিক্ত চার্জ: {formatPrice(item.customizationCost)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order total */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>মোট:</span>
                      <span>{formatPrice(Number(selectedOrder.total))}</span>
                    </div>
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
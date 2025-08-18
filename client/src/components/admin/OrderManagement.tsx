import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Search, 
  RefreshCw, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Calendar,
  User,
  CreditCard,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@shared/schema';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: any;
}

interface ExtendedOrder extends Order {
  items: OrderItem[];
}

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    refetch 
  } = useQuery<ExtendedOrder[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 30000,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: 'সফল!', 
        description: 'অর্ডারের স্ট্যাটাস আপডেট হয়েছে' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  const orderStatuses = [
    { id: 'pending', name: 'অপেক্ষমান', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { id: 'confirmed', name: 'নিশ্চিত', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 'processing', name: 'প্রক্রিয়াধীন', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { id: 'shipped', name: 'পাঠানো হয়েছে', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { id: 'delivered', name: 'ডেলিভার হয়েছে', color: 'bg-green-100 text-green-800 border-green-300' },
    { id: 'cancelled', name: 'বাতিল', color: 'bg-red-100 text-red-800 border-red-300' },
  ];

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.id === status) || orderStatuses[0];
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.thana.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openOrderDetails = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  return (
    <div className="space-y-6">
      {/* Header with Search and Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="অর্ডার খুঁজুন (ট্র্যাকিং ID, নাম, ফোন)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-order-search"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-order-status-filter">
              <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব অর্ডার</SelectItem>
              {orderStatuses.map(status => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={ordersLoading}
            data-testid="button-refresh-orders"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      {/* Order Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <ShoppingCart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.total}</p>
              <p className="text-xs text-gray-600">মোট অর্ডার</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.pending}</p>
              <p className="text-xs text-gray-600">অপেক্ষমান</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.confirmed}</p>
              <p className="text-xs text-gray-600">নিশ্চিত</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.processing}</p>
              <p className="text-xs text-gray-600">প্রক্রিয়াধীন</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Truck className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.shipped}</p>
              <p className="text-xs text-gray-600">পাঠানো</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.delivered}</p>
              <p className="text-xs text-gray-600">ডেলিভার</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{orderStats.cancelled}</p>
              <p className="text-xs text-gray-600">বাতিল</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CreditCard className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-gray-600">মোট আয়</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>অর্ডার তালিকা</span>
            <Badge variant="outline" className="text-sm">
              {filteredOrders.length} টি অর্ডার
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">লোড হচ্ছে...</span>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ট্র্যাকিং ID</TableHead>
                    <TableHead>কাস্টমার</TableHead>
                    <TableHead>ঠিকানা</TableHead>
                    <TableHead>মোট</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            #{order.tracking_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {order.customer_name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {order.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {order.district}, {order.thana}
                            </p>
                            {order.address && (
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {order.address}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600">
                            {formatPrice(parseFloat(order.total))}
                          </div>
                          {order.items && (
                            <div className="text-xs text-gray-500">
                              {order.items.length} টি আইটেম
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge 
                              variant="outline" 
                              className={`${statusInfo.color} flex items-center gap-1 w-fit`}
                            >
                              {getStatusIcon(order.status)}
                              {statusInfo.name}
                            </Badge>
                            <Select
                              value={order.status}
                              onValueChange={(status) => 
                                updateOrderStatusMutation.mutate({ 
                                  orderId: order.id, 
                                  status 
                                })
                              }
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              <SelectTrigger 
                                className="h-8 text-xs" 
                                data-testid={`select-order-status-${order.id}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {orderStatuses.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(order.created_at).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOrderDetails(order)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            বিস্তারিত
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">কোন অর্ডার পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm">
                {searchQuery || statusFilter !== 'all' 
                  ? 'অন্য শব্দ বা ফিল্টার দিয়ে চেষ্টা করুন'
                  : 'এখনও কোন অর্ডার আসেনি'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>অর্ডার বিস্তারিত - #{selectedOrder?.tracking_id}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">কাস্টমার তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p>{selectedOrder.district}, {selectedOrder.thana}</p>
                        {selectedOrder.address && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedOrder.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">অর্ডার তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ট্র্যাকিং ID:</span>
                      <span className="font-mono">#{selectedOrder.tracking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">স্ট্যাটাস:</span>
                      <Badge className={getStatusInfo(selectedOrder.status).color}>
                        {getStatusInfo(selectedOrder.status).name}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">অর্ডারের তারিখ:</span>
                      <span>
                        {new Date(selectedOrder.created_at).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>মোট:</span>
                      <span className="text-green-600">
                        {formatPrice(parseFloat(selectedOrder.total))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">অর্ডার আইটেমসমূহ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>পণ্য</TableHead>
                          <TableHead>পরিমাণ</TableHead>
                          <TableHead>দাম</TableHead>
                          <TableHead>মোট</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.customization && (
                                  <p className="text-sm text-gray-600">
                                    কাস্টমাইজেশন: হ্যাঁ
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatPrice(item.price)}</TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              {selectedOrder.payment_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">পেমেন্ট তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedOrder.payment_info, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Instructions */}
              {selectedOrder.custom_instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">বিশেষ নির্দেশনা</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.custom_instructions}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
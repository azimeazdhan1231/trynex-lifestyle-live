import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  MapPin,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  address: string;
  status: string;
  total: string;
  items: any;
  payment_info: any;
  custom_instructions: string;
  custom_images: string;
  created_at: string;
}

export default function OrderManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    data: orders,
    isLoading,
    error,
    refetch,
    isError
  } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 30000, // Auto refresh every 30 seconds for live updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: "অর্ডার লোড করতে সমস্যা হয়েছে"
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest(`/api/orders/${orderId}`, 'PATCH', { status });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "✅ সফল",
        description: `অর্ডার স্ট্যাটাস '${getStatusText(status)}' এ আপডেট হয়েছে`,
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setSelectedOrder(null);
      
      // Trigger a fresh fetch to ensure data is current
      refetch();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "অজানা সমস্যা হয়েছে";
      toast({
        title: "❌ ত্রুটি",
        description: `অর্ডার আপডেট করতে সমস্যা: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
      console.error('Order update error:', error);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'অপেক্ষমান';
      case 'confirmed':
        return 'নিশ্চিত';
      case 'shipped':
        return 'পাঠানো';
      case 'delivered':
        return 'ডেলিভার';
      case 'cancelled':
        return 'বাতিল';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders?.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      order.tracking_id.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.phone.includes(searchTerm) ||
      order.district.toLowerCase().includes(searchLower) ||
      order.thana.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateStatus = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  const exportOrders = () => {
    const csvContent = [
      ['ট্র্যাকিং আইডি', 'গ্রাহকের নাম', 'ফোন', 'ঠিকানা', 'স্ট্যাটাস', 'মোট', 'তারিখ'],
      ...filteredOrders.map(order => [
        order.tracking_id,
        order.customer_name,
        order.phone,
        `${order.address}, ${order.thana}, ${order.district}`,
        getStatusText(order.status),
        order.total,
        new Date(order.created_at).toLocaleDateString('bn-BD')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">অর্ডার লোড করতে সমস্যা</h3>
              <p className="text-red-600 mb-4">
                {error?.message || "সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"}
              </p>
              <div className="flex justify-center space-x-3">
                <Button 
                  onClick={() => refetch()} 
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  পুনরায় চেষ্টা
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                >
                  পেইজ রিলোড করুন
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">অর্ডার ব্যবস্থাপনা</h1>
          <p className="text-gray-600">সকল অর্ডার দেখুন এবং পরিচালনা করুন</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportOrders} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            এক্সপোর্ট
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}
          </Button>
          {orders && (
            <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
              <Clock className="w-4 h-4 mr-1" />
              সর্বশেষ আপডেট: {new Date().toLocaleTimeString('bn-BD')}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ট্র্যাকিং আইডি, নাম বা ফোন দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব অর্ডার</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                  <SelectItem value="shipped">পাঠানো</SelectItem>
                  <SelectItem value="delivered">ডেলিভার</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              <p className="text-sm text-gray-600">মোট অর্ডার</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredOrders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">অপেক্ষমান</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredOrders.filter(o => o.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">নিশ্চিত</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredOrders.filter(o => o.status === 'shipped').length}
              </p>
              <p className="text-sm text-gray-600">পাঠানো</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {filteredOrders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-sm text-gray-600">ডেলিভার</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>অর্ডার তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">ট্র্যাকিং আইডি</th>
                  <th className="text-left py-3 px-2">গ্রাহক</th>
                  <th className="text-left py-3 px-2">ফোন</th>
                  <th className="text-left py-3 px-2">ঠিকানা</th>
                  <th className="text-left py-3 px-2">মোট</th>
                  <th className="text-left py-3 px-2">স্ট্যাটাস</th>
                  <th className="text-left py-3 px-2">তারিখ</th>
                  <th className="text-left py-3 px-2">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="font-mono text-sm font-medium text-blue-600">
                        {order.tracking_id}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{order.customer_name}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {order.phone}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {order.thana}, {order.district}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-green-600">
                        {formatPrice(parseFloat(order.total || '0'))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(order.created_at).toLocaleDateString('bn-BD')}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>
                              অর্ডার বিস্তারিত - {order.tracking_id}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">গ্রাহকের তথ্য</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">নাম</label>
                                      <p className="font-medium">{selectedOrder.customer_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">ফোন</label>
                                      <p className="font-medium">{selectedOrder.phone}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">ঠিকানা</label>
                                      <p className="font-medium">
                                        {selectedOrder.address}<br />
                                        {selectedOrder.thana}, {selectedOrder.district}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">অর্ডার তথ্য</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">ট্র্যাকিং আইডি</label>
                                      <p className="font-mono">{selectedOrder.tracking_id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">তারিখ</label>
                                      <p>{new Date(selectedOrder.created_at).toLocaleDateString('bn-BD')}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">মোট পরিমাণ</label>
                                      <p className="text-xl font-bold text-green-600">
                                        {formatPrice(parseFloat(selectedOrder.total || '0'))}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">বর্তমান স্ট্যাটাস</label>
                                      <div className="mt-1">
                                        <Badge className={getStatusColor(selectedOrder.status)}>
                                          {getStatusText(selectedOrder.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Order Items */}
                              <Card>
                                <CardHeader>
                                  <CardTitle>অর্ডার আইটেম</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {(() => {
                                      try {
                                        const items = typeof selectedOrder.items === 'string' 
                                          ? JSON.parse(selectedOrder.items || '[]') 
                                          : (Array.isArray(selectedOrder.items) ? selectedOrder.items : []);
                                        return items;
                                      } catch (e) {
                                        console.error('Error parsing order items:', e);
                                        return [];
                                      }
                                    })().map((item: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                          {item.image_url && (
                                            <img
                                              src={item.image_url}
                                              alt={item.name}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          )}
                                          <div>
                                            <p className="font-medium">{item.name || item.product_name}</p>
                                            <p className="text-sm text-gray-600">
                                              পরিমাণ: {item.quantity} × {formatPrice(parseFloat(item.price || '0'))}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold">
                                            {formatPrice(parseFloat(item.price || '0') * parseInt(item.quantity || '1'))}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Custom Instructions & Images */}
                              {(selectedOrder.custom_instructions || selectedOrder.custom_images) && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>কাস্টমাইজেশন</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {selectedOrder.custom_instructions && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">বিশেষ নির্দেশনা</label>
                                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                                          {selectedOrder.custom_instructions}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {selectedOrder.custom_images && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">আপলোড করা ছবি</label>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                          {(() => {
                                            try {
                                              const images = typeof selectedOrder.custom_images === 'string' 
                                                ? JSON.parse(selectedOrder.custom_images || '[]') 
                                                : (Array.isArray(selectedOrder.custom_images) ? selectedOrder.custom_images : []);
                                              return images;
                                            } catch (e) {
                                              console.error('Error parsing custom images:', e);
                                              return [];
                                            }
                                          })().map((imageUrl: string, index: number) => (
                                            <img
                                              key={index}
                                              src={imageUrl}
                                              alt={`Custom image ${index + 1}`}
                                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                              onClick={() => window.open(imageUrl, '_blank')}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Status Update */}
                              <Card>
                                <CardHeader>
                                  <CardTitle>স্ট্যাটাস আপডেট</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                      <Button
                                        key={status}
                                        variant={selectedOrder.status === status ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                        disabled={updateOrderMutation.isPending}
                                        className="flex items-center gap-2"
                                      >
                                        {getStatusIcon(status)}
                                        {getStatusText(status)}
                                      </Button>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                {filteredOrders.length} টি অর্ডারের মধ্যে {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} দেখানো হচ্ছে
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
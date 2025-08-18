import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Edit,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from "lucide-react";

interface CustomOrder {
  id: string;
  trackingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  district: string;
  thana: string;
  productName: string;
  productType: string;
  customizationInstructions?: string;
  customizationImages?: string[];
  quantity: number;
  basePrice: string;
  customizationCost: string;
  totalPrice: string;
  paymentMethod: string;
  trxId?: string;
  paymentScreenshot?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions = [
  { value: "pending", label: "অপেক্ষমান" },
  { value: "confirmed", label: "নিশ্চিত" },
  { value: "processing", label: "প্রক্রিয়াধীন" },
  { value: "shipped", label: "পাঠানো হয়েছে" },
  { value: "delivered", label: "ডেলিভার হয়েছে" },
  { value: "cancelled", label: "বাতিল" },
];

export default function EnhancedAdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch custom orders
  const { data: customOrders = [], isLoading: loadingCustomOrders } = useQuery({
    queryKey: ['/api/custom-orders'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch regular orders
  const { data: regularOrders = [], isLoading: loadingRegularOrders } = useQuery({
    queryKey: ['/api/orders'],
    refetchInterval: 30000,
  });

  // Type assertions for the data
  const customOrdersList = customOrders as CustomOrder[];
  const regularOrdersList = regularOrders as any[];

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/custom-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-orders'] });
      toast({
        title: "স্ট্যাটাস আপডেট হয়েছে",
        description: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে",
      });
      setShowOrderDetails(false);
    },
    onError: () => {
      toast({
        title: "আপডেট ব্যর্থ",
        description: "স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Filter and search orders
  const filteredCustomOrders = useMemo(() => {
    return customOrdersList.filter((order: CustomOrder) => {
      const matchesSearch = 
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.includes(searchTerm) ||
        order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [customOrdersList, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = customOrdersList.length + regularOrdersList.length;
    const totalCustomOrders = customOrdersList.length;
    const totalRegularOrders = regularOrdersList.length;
    
    const totalRevenue = [
      ...customOrdersList.map((order: CustomOrder) => parseFloat(order.totalPrice || '0')),
      ...regularOrdersList.map((order: any) => parseFloat(order.total || '0'))
    ].reduce((sum, price) => sum + price, 0);

    const pendingOrders = customOrdersList.filter((order: CustomOrder) => order.status === 'pending').length;
    
    return {
      totalOrders,
      totalCustomOrders,
      totalRegularOrders,
      totalRevenue,
      pendingOrders,
    };
  }, [customOrdersList, regularOrdersList]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const viewOrderDetails = (order: CustomOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">অ্যাডমিন প্যানেল</h1>
          <p className="text-gray-600">অর্ডার ও কাস্টম অর্ডার ম্যানেজমেন্ট</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          রিপোর্ট ডাউনলোড
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">মোট অর্ডার</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">কাস্টম অর্ডার</p>
                <p className="text-2xl font-bold">{stats.totalCustomOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">রেগুলার অর্ডার</p>
                <p className="text-2xl font-bold">{stats.totalRegularOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">মোট রেভিনিউ</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">অপেক্ষমান</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>কাস্টম অর্ডার ম্যানেজমেন্ট</CardTitle>
          <CardDescription>
            গ্রাহকদের কাস্টম অর্ডারগুলো দেখুন এবং পরিচালনা করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">অনুসন্ধান</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="search"
                  placeholder="নাম, ফোন, ট্র্যাকিং আইডি অথবা পণ্যের নাম লিখুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="status-filter">স্ট্যাটাস ফিল্টার</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব অর্ডার</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Orders Table */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[600px]">
              {loadingCustomOrders ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>লোড হচ্ছে...</p>
                </div>
              ) : filteredCustomOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">কোনো কাস্টম অর্ডার পাওয়া যায়নি</p>
                  <p className="text-sm">নতুন অর্ডারের জন্য অপেক্ষা করুন</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredCustomOrders.map((order: CustomOrder) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold text-lg">{order.customerName}</h3>
                            <Badge className={statusColors[order.status as keyof typeof statusColors] || statusColors.pending}>
                              {statusOptions.find(s => s.value === order.status)?.label || order.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {order.trackingId}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {order.customerPhone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              {order.productName} ({order.quantity}টি)
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {order.district}, {order.thana}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {formatPrice(parseFloat(order.totalPrice || '0'))}
                            </div>
                          </div>

                          {order.customizationInstructions && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800">
                                <strong>কাস্টমাইজেশন:</strong> {order.customizationInstructions}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            বিস্তারিত
                          </Button>
                          
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>অর্ডার বিস্তারিত - {selectedOrder?.trackingId}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOrderDetails(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    গ্রাহকের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>নাম</Label>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <Label>ফোন</Label>
                    <p className="font-medium">{selectedOrder.customerPhone}</p>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div>
                      <Label>ইমেইল</Label>
                      <p className="font-medium">{selectedOrder.customerEmail}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <Label>ঠিকানা</Label>
                    <p className="font-medium">
                      {selectedOrder.customerAddress}, {selectedOrder.thana}, {selectedOrder.district}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    পণ্যের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>পণ্যের নাম</Label>
                      <p className="font-medium">{selectedOrder.productName}</p>
                    </div>
                    <div>
                      <Label>ধরণ</Label>
                      <p className="font-medium">{selectedOrder.productType}</p>
                    </div>
                    <div>
                      <Label>পরিমাণ</Label>
                      <p className="font-medium">{selectedOrder.quantity}টি</p>
                    </div>
                  </div>
                  
                  {selectedOrder.customizationInstructions && (
                    <div>
                      <Label>কাস্টমাইজেশন নির্দেশনা</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p>{selectedOrder.customizationInstructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Display customization images */}
                  {selectedOrder.customizationImages && selectedOrder.customizationImages.length > 0 && (
                    <div>
                      <Label>কাস্টম ছবি</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedOrder.customizationImages.map((imageUrl: string, index: number) => (
                          <div key={index} className="border rounded-lg p-2">
                            <img
                              src={imageUrl}
                              alt={`Custom image ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>বেস প্রাইস</Label>
                      <p className="font-medium">{formatPrice(parseFloat(selectedOrder.basePrice || '0'))}</p>
                    </div>
                    <div>
                      <Label>কাস্টমাইজেশন খরচ</Label>
                      <p className="font-medium">{formatPrice(parseFloat(selectedOrder.customizationCost || '0'))}</p>
                    </div>
                    <div>
                      <Label>মোট দাম</Label>
                      <p className="font-bold text-green-600">{formatPrice(parseFloat(selectedOrder.totalPrice || '0'))}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>পেমেন্ট পদ্ধতি</Label>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                    {selectedOrder.trxId && (
                      <div>
                        <Label>ট্রানজেকশন আইডি</Label>
                        <p className="font-medium">{selectedOrder.trxId}</p>
                      </div>
                    )}
                  </div>

                  {selectedOrder.paymentScreenshot && (
                    <div>
                      <Label>পেমেন্ট স্ক্রিনশট</Label>
                      <div className="mt-2">
                        <img
                          src={selectedOrder.paymentScreenshot}
                          alt="Payment screenshot"
                          className="max-w-xs h-auto border rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status and Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    অর্ডার স্ট্যাটাস ও নোট
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>স্ট্যাটাস</Label>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(newStatus) => handleStatusUpdate(selectedOrder.id, newStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>তারিখ</Label>
                      <p className="font-medium">
                        {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <Label>অতিরিক্ত নোট</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p>{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
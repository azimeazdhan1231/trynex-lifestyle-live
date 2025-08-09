import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, Users, TrendingUp, ShoppingCart, DollarSign, Eye, RefreshCw, AlertTriangle, Clock
} from "lucide-react";

const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

// Dashboard Stats Component
function DashboardStats() {
  const { data: orders = [] } = useQuery({ queryKey: ["/api/orders"] });
  const { data: products = [] } = useQuery({ queryKey: ["/api/products"] });

  const stats = React.useMemo(() => {
    const totalOrders = Array.isArray(orders) ? orders.length : 0;
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.total as string) || 0);
    }, 0) : 0;
    const pendingOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'pending').length : 0;
    const lowStockProducts = Array.isArray(products) ? products.filter((product: any) => product.stock < 10).length : 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      totalProducts: Array.isArray(products) ? products.length : 0
    };
  }, [orders, products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">সর্বমোট অর্ডার সংখ্যা</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">অপেক্ষমান অর্ডার</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">প্রক্রিয়াকরণের জন্য অপেক্ষমান</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">কম স্টক</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">১০টির কম স্টক</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Order Details Modal
function OrderDetailsModal({ isOpen, onClose, order }: any) {
  const [newStatus, setNewStatus] = useState(order?.status || 'pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "সফল!",
        description: `অর্ডার স্ট্যাটাস আপডেট হয়েছে`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  if (!order) return null;

  const orderItems = (() => {
    try {
      if (Array.isArray(order.items)) return order.items;
      if (typeof order.items === 'string') return JSON.parse(order.items);
      return [];
    } catch {
      return [];
    }
  })();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka'
      });
    } catch {
      return 'তারিখ পাওয়া যায়নি';
    }
  };

  const handleStatusUpdate = () => {
    if (order.id && newStatus && newStatus !== order.status) {
      updateStatusMutation.mutate({ 
        orderId: order.id, 
        status: newStatus 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>অর্ডার বিস্তারিত - #{order.tracking_id}</DialogTitle>
          <DialogDescription>
            অর্ডার তৈরি: {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>কাস্টমার তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><strong>নাম:</strong> {order.customer_name}</div>
              <div><strong>ফোন:</strong> {order.phone}</div>
              <div><strong>এলাকা:</strong> {order.district}, {order.thana}</div>
              {order.address && <div><strong>ঠিকানা:</strong> {order.address}</div>}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
              </Badge>
              
              <div className="space-y-2">
                <Label>স্ট্যাটাস পরিবর্তন করুন</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={updateStatusMutation.isPending || newStatus === order.status}
                  className="w-full"
                >
                  {updateStatusMutation.isPending ? "আপডেট হচ্ছে..." : "স্ট্যাটাস আপডেট করুন"}
                </Button>
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
            <div className="space-y-4">
              {orderItems.length > 0 ? (
                orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name || item.product_name}</h4>
                      <p className="text-sm text-gray-600">
                        পরিমাণ: {item.quantity} × {formatPrice(Number(item.price || item.product_price || 0))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(Number(item.quantity || 1) * Number(item.price || item.product_price || 0))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">কোন আইটেম পাওয়া যায়নি</p>
              )}
              
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>মোট:</span>
                <span>{formatPrice(Number(order.total || 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.custom_instructions && (
          <Card>
            <CardHeader>
              <CardTitle>কাস্টম নির্দেশনা</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                {order.custom_instructions}
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Orders Management
function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orders = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Dhaka'
      });
    } catch {
      return 'N/A';
    }
  };

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">অর্ডার লোড করতে সমস্যা</h3>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>অর্ডার তালিকা ({Array.isArray(orders) ? orders.length : 0}টি)</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ট্র্যাকিং ID</TableHead>
                  <TableHead>কাস্টমার</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>মোট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      অর্ডার লোড হচ্ছে...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(orders) || orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      কোন অর্ডার পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.tracking_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer_name}
                      </TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(Number(order.total || 0))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'shipped' ? 'secondary' :
                          order.status === 'processing' ? 'outline' : 'destructive'
                        }>
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOrderModal(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        order={selectedOrder}
      />
    </div>
  );
}

// Products Management
function ProductsManagement() {
  const { data: products = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000,
  });

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">পণ্য লোড করতে সমস্যা</h3>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>পণ্য তালিকা ({Array.isArray(products) ? products.length : 0}টি)</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : !Array.isArray(products) || products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">কোন পণ্য পাওয়া যায়নি</h3>
              </div>
            ) : (
              products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <Badge 
                      className="absolute top-2 right-2"
                      variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                    >
                      স্টক: {product.stock}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(Number(product.price))}
                      </span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Admin Panel Component
export default function SimpleAdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="products">পণ্য</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DashboardStats />
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
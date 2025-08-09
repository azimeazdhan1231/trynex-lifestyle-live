import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { formatPrice } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, PlusCircle, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, ImageIcon, Phone, MapPin, Clock, Download
} from "lucide-react";
import type { Product, Category, Order, PromoCode } from "@shared/schema";

const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

// Enhanced Order Details Modal Component
function OrderDetailsModal({ isOpen, onClose, order, onStatusUpdate }: any) {
  const [newStatus, setNewStatus] = useState(order?.status || 'pending');
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status }
      });
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "অর্ডার স্ট্যাটাস আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onStatusUpdate?.();
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  if (!order) return null;

  // Parse order items safely
  const orderItems = (() => {
    try {
      if (Array.isArray(order.items)) return order.items;
      if (typeof order.items === 'string') return JSON.parse(order.items);
      return [];
    } catch {
      return [];
    }
  })();

  // Parse payment info safely
  const paymentInfo = (() => {
    try {
      if (!order.payment_info) return null;
      if (typeof order.payment_info === 'object') return order.payment_info;
      if (typeof order.payment_info === 'string') return JSON.parse(order.payment_info);
      return null;
    } catch {
      return null;
    }
  })();

  // Parse custom images safely
  const customImages = (() => {
    try {
      if (!order.custom_images) return [];
      if (Array.isArray(order.custom_images)) return order.custom_images;
      if (typeof order.custom_images === 'string') return JSON.parse(order.custom_images);
      return [];
    } catch {
      return [];
    }
  })();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Convert to Bangladesh timezone (UTC+6)
      const bangladeshTime = new Date(date.getTime() + (6 * 60 * 60 * 1000));
      return bangladeshTime.toLocaleDateString('bn-BD', {
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
    if (order.id && newStatus) {
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
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            অর্ডার বিস্তারিত - #{order.tracking_id}
          </DialogTitle>
          <DialogDescription>
            অর্ডার তৈরি: {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                কাস্টমার তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{order.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{order.district}, {order.thana}</span>
              </div>
              {order.address && (
                <div className="text-sm text-gray-600">
                  <strong>ঠিকানা:</strong> {order.address}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                অর্ডার স্ট্যাটাস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                  {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status-select">স্ট্যাটাস পরিবর্তন করুন</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status-select">
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
                  disabled={updateStatusMutation.isPending}
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
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              অর্ডার আইটেম
            </CardTitle>
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
            </div>
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        {order.custom_instructions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                কাস্টম নির্দেশনা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                {order.custom_instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Custom Images */}
        {customImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                আপলোড করা ছবি ({customImages.length}টি)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {customImages.map((image: any, index: number) => (
                  <div key={index} className="relative group">
                    <img 
                      src={typeof image === 'string' ? image : image.url || image.src} 
                      alt={`Custom Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(typeof image === 'string' ? image : image.url || image.src, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Information */}
        {paymentInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                পেমেন্ট তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <strong>পেমেন্ট মেথড:</strong> {paymentInfo.method || 'নির্দিষ্ট নয়'}
              </div>
              {paymentInfo.transaction_id && (
                <div className="text-sm">
                  <strong>ট্রানজেকশন ID:</strong> {paymentInfo.transaction_id}
                </div>
              )}
              {paymentInfo.amount && (
                <div className="text-sm">
                  <strong>পরিমাণ:</strong> {formatPrice(Number(paymentInfo.amount))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>অর্ডার সামারি</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>মোট পরিমাণ:</span>
              <span>{formatPrice(Number(order.total || 0))}</span>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>বন্ধ করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPanelFixed() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  // Data fetching with proper error handling
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders
  } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    retry: 3,
    staleTime: 30000, // 30 seconds
  });

  const { 
    data: products = [], 
    isLoading: productsLoading,
    refetch: refetchProducts 
  } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    retry: 3,
    staleTime: 60000, // 1 minute
  });

  const { 
    data: categories = [],
    refetch: refetchCategories 
  } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"],
    retry: 3,
    staleTime: 300000, // 5 minutes
  });

  const { 
    data: promoCodes = [],
    refetch: refetchPromoCodes 
  } = useQuery<PromoCode[]>({ 
    queryKey: ["/api/promo-codes"],
    retry: 3,
    staleTime: 300000, // 5 minutes
  });

  // Dashboard calculations
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: Order) => {
    return sum + Number(order.total || 0);
  }, 0) : 0;

  const todayOrders = Array.isArray(orders) ? orders.filter((order: Order) => {
    const today = new Date().toDateString();
    const orderDate = new Date(order.created_at).toDateString();
    return today === orderDate;
  }).length : 0;

  const pendingOrders = Array.isArray(orders) ? orders.filter((order: Order) => 
    order.status === 'pending'
  ).length : 0;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleStatusUpdate = () => {
    refetchOrders();
  };

  // Error handling display
  if (ordersError) {
    console.error('Orders loading error:', ordersError);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">অ্যাডমিন প্যানেল</h1>
          <p className="text-gray-600 mt-2">আপনার স্টোর পরিচালনা করুন</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="products">পণ্য</TabsTrigger>
            <TabsTrigger value="categories">ক্যাটেগরি</TabsTrigger>
            <TabsTrigger value="offers">অফার</TabsTrigger>
            <TabsTrigger value="promo">প্রোমো কোড</TabsTrigger>
            <TabsTrigger value="analytics">বিশ্লেষণ</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground">+{todayOrders} আজকে</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">সর্বমোট আয়</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">পেন্ডিং অর্ডার</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">প্রক্রিয়াকরণের জন্য অপেক্ষমান</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">স্টকে পণ্য</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  সব অর্ডার ({orders.length})
                </CardTitle>
                <CardDescription>
                  {ordersLoading && "অর্ডার লোড হচ্ছে..."}
                  {ordersError && "অর্ডার লোড করতে সমস্যা হয়েছে"}
                  {!ordersLoading && !ordersError && "সর্বশেষ অর্ডারগুলি"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
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
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">লোড হচ্ছে...</TableCell>
                        </TableRow>
                      ) : orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">কোন অর্ডার পাওয়া যায়নি</TableCell>
                        </TableRow>
                      ) : (
                        orders.map((order: Order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.tracking_id}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.phone}</TableCell>
                            <TableCell>{formatPrice(Number(order.total))}</TableCell>
                            <TableCell>
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString('bn-BD')}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                বিস্তারিত
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
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  পণ্যসমূহ ({products.length})
                </CardTitle>
                <CardDescription>
                  আপনার পণ্যের তালিকা পরিচালনা করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>নাম</TableHead>
                        <TableHead>ক্যাটেগরি</TableHead>
                        <TableHead>মূল্য</TableHead>
                        <TableHead>স্টক</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">লোড হচ্ছে...</TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">কোন পণ্য পাওয়া যায়নি</TableCell>
                        </TableRow>
                      ) : (
                        products.map((product: Product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{formatPrice(Number(product.price))}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Badge variant={Number(product.stock) > 0 ? 'default' : 'destructive'}>
                                {Number(product.stock) > 0 ? 'স্টকে আছে' : 'স্টক শেষ'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs (Categories, Offers, Promo, Analytics) */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>ক্যাটেগরি পরিচালনা</CardTitle>
              </CardHeader>
              <CardContent>
                <p>ক্যাটেগরি পরিচালনার অংশ শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>অফার পরিচালনা</CardTitle>
              </CardHeader>
              <CardContent>
                <p>অফার পরিচালনার অংশ শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promo">
            <Card>
              <CardHeader>
                <CardTitle>প্রোমো কোড পরিচালনা</CardTitle>
              </CardHeader>
              <CardContent>
                <p>প্রোমো কোড পরিচালনার অংশ শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>বিশ্লেষণ ও রিপোর্ট</CardTitle>
              </CardHeader>
              <CardContent>
                <p>বিশ্লেষণ ও রিপোর্টের অংশ শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Modal */}
        <OrderDetailsModal 
          isOpen={orderDetailsOpen}
          onClose={() => setOrderDetailsOpen(false)}
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}
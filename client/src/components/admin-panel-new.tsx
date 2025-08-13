import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, PlusCircle, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, ImageIcon, Phone, MapPin, Clock, Download,
  LogOut, Menu, X
} from "lucide-react";
import type { Product, Category, Order, PromoCode, Offer, CustomOrder } from "@shared/schema";

// Import management components
import ProductManagement from "@/components/admin/product-management";
import CategoryManagement from "@/components/admin/category-management";
import OrderManagement from "@/components/admin/order-management";
import OfferManagement from "@/components/admin/offer-management";
import PromoCodeManagement from "@/components/admin/promo-code-management";
import SiteSettingsManagement from "@/components/admin/site-settings-management";

// Order status translations
const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

interface AdminPanelProps {
  onLogout?: () => void;
}

export default function AdminPanelNew({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"],
    refetchInterval: 60000,
  });

  const { data: promoCodes = [], isLoading: promoCodesLoading } = useQuery<PromoCode[]>({ 
    queryKey: ["/api/promo-codes"],
    refetchInterval: 60000,
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery<Offer[]>({ 
    queryKey: ["/api/offers"],
    refetchInterval: 60000,
  });

  const { data: customOrders = [], isLoading: customOrdersLoading } = useQuery<CustomOrder[]>({ 
    queryKey: ["/api/custom-orders"],
    refetchInterval: 30000,
  });

  // Calculate dashboard stats
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => (product.stock || 0) < 5).length;
  const outOfStockProducts = products.filter(product => (product.stock || 0) === 0).length;

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    toast({
      title: "লগআউট সফল",
      description: "আপনি সফলভাবে লগআউট হয়েছেন।",
    });
    if (onLogout) {
      onLogout();
    }
  };

  // Handle order details view
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Parse order items safely
  const parseOrderItems = (items: any) => {
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            productName: item.productName || item.name || 'কাস্টম আইটেম',
            quantity: item.quantity || 1,
            productPrice: Number(item.productPrice || item.price || 0),
            customization: item.customization || null,
            customizationCost: Number(item.customizationCost || 0),
            totalPrice: Number(item.totalPrice || (item.productPrice * item.quantity) || 0)
          }));
        } else {
          return [{ 
            productName: parsed.productName || 'কাস্টম আইটেম', 
            quantity: 1, 
            productPrice: Number(parsed.productPrice || 0),
            customization: parsed.customization || null,
            customizationCost: Number(parsed.customizationCost || 0),
            totalPrice: Number(parsed.totalPrice || parsed.productPrice || 0)
          }];
        }
      } catch {
        return [{ productName: String(items), quantity: 1, productPrice: 0, customization: null, customizationCost: 0, totalPrice: 0 }];
      }
    }
    if (Array.isArray(items)) {
      return items.map((item: any) => ({
        productName: item.productName || item.name || 'কাস্টম আইটেম',
        quantity: item.quantity || 1,
        productPrice: Number(item.productPrice || item.price || 0),
        customization: item.customization || null,
        customizationCost: Number(item.customizationCost || 0),
        totalPrice: Number(item.totalPrice || (item.productPrice * item.quantity) || 0)
      }));
    }
    return [];
  };

  // Parse payment info safely
  const parsePaymentInfo = (paymentInfo: any) => {
    if (typeof paymentInfo === 'string') {
      try {
        return JSON.parse(paymentInfo);
      } catch {
        return {};
      }
    }
    return paymentInfo || {};
  };

  // Handle order status change
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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Loading state
  if (ordersLoading || productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">এডমিন ড্যাশবোর্ড</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">লগআউট</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs List */}
          <TabsList className="hidden md:grid w-full grid-cols-7 lg:grid-cols-7">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">পণ্য</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">ক্যাটেগরি</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="custom-orders" data-testid="tab-custom-orders">কাস্টম অর্ডার</TabsTrigger>
            <TabsTrigger value="offers" data-testid="tab-offers">অফার</TabsTrigger>
            <TabsTrigger value="promo-codes" data-testid="tab-promo-codes">প্রোমো কোড</TabsTrigger>
          </TabsList>

          {/* Mobile Tabs Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "dashboard", label: "ড্যাশবোর্ড", icon: BarChart3 },
                  { value: "products", label: "পণ্য", icon: Package },
                  { value: "categories", label: "ক্যাটেগরি", icon: Tag },
                  { value: "orders", label: "অর্ডার", icon: ShoppingCart },
                  { value: "custom-orders", label: "কাস্টম অর্ডার", icon: Palette },
                  { value: "offers", label: "অফার", icon: Gift },
                  { value: "promo-codes", label: "প্রমো কোড", icon: Award },
                  { value: "site-settings", label: "সাইট সেটিংস", icon: Settings },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={activeTab === value ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => {
                      setActiveTab(value);
                      setIsMobileMenuOpen(false);
                    }}
                    data-testid={`tab-mobile-${value}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card data-testid="card-total-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-revenue">
                    {formatPrice(totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-total-orders">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-orders">
                    {totalOrders}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-pending-orders">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">অপেক্ষমান অর্ডার</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-pending-orders">
                    {pendingOrders}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-total-products">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-products">
                    {totalProducts}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders and Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card data-testid="card-recent-orders">
                <CardHeader>
                  <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium" data-testid={`text-order-customer-${order.id}`}>
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-blue-600 font-mono" data-testid={`text-order-tracking-${order.id}`}>
                            {order.tracking_id}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`text-order-total-${order.id}`}>
                            {formatPrice(Number(order.total))}
                          </p>
                        </div>
                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card data-testid="card-stock-alerts">
                <CardHeader>
                  <CardTitle>স্টক সতর্কতা</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-700">স্টক শেষ</p>
                        <p className="text-sm text-red-600">{outOfStockProducts} টি পণ্য</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-700">কম স্টক</p>
                        <p className="text-sm text-yellow-600">{lowStockProducts} টি পণ্য</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductManagement products={products} categories={categories} />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManagement categories={categories} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">অর্ডার ম্যানেজমেন্ট</h3>
                <Badge variant="outline" className="text-sm">
                  মোট: {orders.length} টি অর্ডার
                </Badge>
              </div>

              {/* Orders Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ট্র্যাকিং আইডি</TableHead>
                        <TableHead>গ্রাহক</TableHead>
                        <TableHead>পণ্যসমূহ</TableHead>
                        <TableHead>মোট</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const orderItems = parseOrderItems(order.items);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.tracking_id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customer_name}</p>
                                <p className="text-sm text-gray-500">{order.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                {orderItems.length > 0 ? orderItems.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm mb-1">
                                    <div className="font-medium">{item.productName || item.name || 'কাস্টম আইটেম'}</div>
                                    <div className="text-gray-500">পরিমাণ: {item.quantity || 1} | দাম: ৳{item.productPrice || item.price || 0}</div>
                                    {item.customization && (
                                      <Badge variant="outline" className="ml-1 text-xs">
                                        কাস্টম
                                      </Badge>
                                    )}
                                  </div>
                                )) : <span className="text-gray-500">কোনো পণ্য পাওয়া যায়নি</span>}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(Number(order.total))}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status || "pending"}
                                onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                              >
                                <SelectTrigger className="w-32">
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
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrderDetails(order)}
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
                </CardContent>
              </Card>
            </div>

            {/* Order Details Dialog */}
            <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>অর্ডার বিস্তারিত</DialogTitle>
                  <DialogDescription>
                    ট্র্যাকিং আইডি: {selectedOrder?.tracking_id}
                  </DialogDescription>
                </DialogHeader>

                {selectedOrder && (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">গ্রাহকের তথ্য</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p><strong>নাম:</strong> {selectedOrder.customer_name}</p>
                          <p><strong>ফোন:</strong> {selectedOrder.phone}</p>
                          <p><strong>ঠিকানা:</strong> {selectedOrder.address}</p>
                          <p><strong>জেলা:</strong> {selectedOrder.district}</p>
                          <p><strong>থানা:</strong> {selectedOrder.thana}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">অর্ডার তথ্য</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <strong>ট্র্যাকিং আইডি:</strong> 
                            <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded ml-2">
                              {selectedOrder.tracking_id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <strong>স্ট্যাটাস:</strong>
                            <Select
                              value={selectedOrder.status || "pending"}
                              onValueChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
                            >
                              <SelectTrigger className="w-40">
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

                          <div className="space-y-1">
                            <p><strong>মোট মূল্য:</strong> <span className="text-green-600 font-semibold text-xl">{formatPrice(Number(selectedOrder.total))}</span></p>
                            {(() => {
                              const items = parseOrderItems(selectedOrder.items);
                              const subtotal = items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
                              const customizationTotal = items.reduce((sum, item) => sum + item.customizationCost, 0);
                              const deliveryCharge = Number(selectedOrder.total) - subtotal - customizationTotal;

                              return (
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>পণ্যের মূল্য: {formatPrice(subtotal)}</p>
                                  {customizationTotal > 0 && <p>কাস্টমাইজেশন চার্জ: {formatPrice(customizationTotal)}</p>}
                                  {deliveryCharge > 0 && <p>ডেলিভারি চার্জ: {formatPrice(deliveryCharge)}</p>}
                                </div>
                              );
                            })()}
                          </div>
                          <p><strong>অর্ডারের তারিখ:</strong> {new Date(selectedOrder.created_at || '').toLocaleDateString('bn-BD')}</p>
                          {selectedOrder.custom_instructions && (
                            <div>
                              <strong>বিশেষ নির্দেশনা:</strong>
                              <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedOrder.custom_instructions}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

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
                                    {item.customizationCost > 0 && (
                                      <p><span className="font-medium">কাস্টমাইজেশন চার্জ:</span> {formatPrice(item.customizationCost)}</p>
                                    )}
                                    <p><span className="font-medium">সাবটোটাল:</span> <span className="text-green-600 font-semibold">{formatPrice(item.totalPrice || (item.productPrice * item.quantity))}</span></p>
                                  </div>
                                  {item.customization && (
                                    <div className="mt-2">
                                      <Badge variant="outline" className="text-xs mb-1">কাস্টমাইজড</Badge>
                                      <p className="text-xs text-gray-600 bg-white p-2 rounded border">
                                        {typeof item.customization === 'string' 
                                          ? item.customization 
                                          : JSON.stringify(item.customization, null, 2)
                                        }
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Info */}
                    {selectedOrder.payment_info && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">পেমেন্ট তথ্য</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(parsePaymentInfo(selectedOrder.payment_info)).map(([key, value]) => (
                              <p key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Custom Images and Customization Details */}
                    {(selectedOrder.custom_images || selectedOrder.custom_instructions) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            কাস্টমাইজেশন বিবরণ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Custom Images */}
                          {selectedOrder.custom_images && (
                            <div>
                              <h4 className="font-medium mb-2">আপলোড করা ইমেজসমূহ:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(() => {
                                  try {
                                    const images = typeof selectedOrder.custom_images === 'string' 
                                      ? JSON.parse(selectedOrder.custom_images) 
                                      : selectedOrder.custom_images;

                                    if (Array.isArray(images) && images.length > 0) {
                                      return images.map((image: string, idx: number) => (
                                        <div key={idx} className="relative group">
                                          <img
                                            src={image}
                                            alt={`কাস্টম ইমেজ ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                            onClick={() => window.open(image, '_blank')}
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                                            <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          <p className="text-xs text-center mt-1 text-gray-600">ইমেজ {idx + 1}</p>
                                        </div>
                                      ));
                                    } else {
                                      return (
                                        <div className="col-span-full text-center py-4">
                                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                          <p className="text-gray-500 text-sm">কোনো কাস্টম ইমেজ নেই</p>
                                        </div>
                                      );
                                    }
                                  } catch (error) {
                                    return (
                                      <div className="col-span-full text-center py-4">
                                        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                        <p className="text-red-500 text-sm">ইমেজ লোড করতে সমস্যা হয়েছে</p>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Additional customization data from items */}
                          {(() => {
                            const items = parseOrderItems(selectedOrder.items);
                            const hasCustomization = items.some(item => item.customization);
                            if (hasCustomization) {
                              return (
                                <div>
                                  <h4 className="font-medium mb-2">কাস্টমাইজেশন তথ্য:</h4>
                                  <div className="space-y-2">
                                    {items.filter(item => item.customization).map((item, idx) => (
                                      <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="font-medium text-blue-900">{item.productName}</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                          {typeof item.customization === 'string' 
                                            ? item.customization 
                                            : JSON.stringify(item.customization, null, 2)
                                          }
                                        </p>
                                        {item.customizationCost > 0 && (
                                          <p className="text-xs text-blue-600 mt-1">অতিরিক্ত চার্জ: {formatPrice(item.customizationCost)}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
                    বন্ধ করুন
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Custom Orders Tab */}
          <TabsContent value="custom-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  কাস্টম অর্ডার ম্যানেজমেন্ট
                </CardTitle>
                <CardDescription>
                  গ্রাহকদের কাস্টমাইজেশন অর্ডার দেখুন এবং পরিচালনা করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customOrdersLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : customOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">কোনো কাস্টম অর্ডার নেই</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{customOrders.length}</div>
                          <div className="text-sm text-gray-600">মোট কাস্টম অর্ডার</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {customOrders.filter(order => order.status === 'pending').length}
                          </div>
                          <div className="text-sm text-gray-600">অপেক্ষমান</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {customOrders.filter(order => order.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-600">সম্পন্ন</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ট্র্যাকিং আইডি</TableHead>
                          <TableHead>গ্রাহক তথ্য</TableHead>
                          <TableHead>প্রোডাক্ট</TableHead>
                          <TableHead>মোট মূল্য</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead>তারিখ</TableHead>
                          <TableHead>কার্যক্রম</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customOrders.map((customOrder) => (
                          <TableRow key={customOrder.id}>
                            <TableCell>
                              <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {customOrder.tracking_id || customOrder.trackingId || `CUSTOM-${customOrder.id}`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{customOrder.customer_name || customOrder.name}</div>
                                <div className="text-sm text-gray-600">{customOrder.customer_phone || customOrder.whatsapp}</div>
                                <div className="text-xs text-gray-500">{customOrder.district || 'N/A'}, {customOrder.thana || 'N/A'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{customOrder.product_name || `Product ID: ${customOrder.product_id}`}</div>
                              {customOrder.customization && (
                                <div className="text-xs text-gray-500 mt-1">
                                  কাস্টমাইজেশন: {typeof customOrder.customization === 'string' 
                                    ? customOrder.customization.substring(0, 50) + '...'
                                    : 'বিস্তারিত দেখুন'}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                {formatPrice(parseFloat(customOrder.total_price || customOrder.totalPrice || '0'))}
                              </div>
                              {customOrder.base_price && (
                                <div className="text-xs text-gray-500">
                                  বেস: {formatPrice(parseFloat(customOrder.base_price))}
                                </div>
                              )}
                              {customOrder.customization_cost && parseFloat(customOrder.customization_cost) > 0 && (
                                <div className="text-xs text-blue-600">
                                  কাস্টম চার্জ: {formatPrice(parseFloat(customOrder.customization_cost))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                customOrder.status === 'pending' ? 'default' :
                                customOrder.status === 'confirmed' ? 'secondary' :
                                customOrder.status === 'in_production' ? 'outline' :
                                customOrder.status === 'completed' ? 'default' :
                                'destructive'
                              }>
                                {customOrder.status === 'pending' ? 'অপেক্ষমান' :
                                 customOrder.status === 'confirmed' ? 'নিশ্চিত' :
                                 customOrder.status === 'in_production' ? 'উৎপাদনে' :
                                 customOrder.status === 'completed' ? 'সম্পন্ন' :
                                 'বাতিল'
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(customOrder.createdAt || customOrder.created_at).toLocaleDateString('bn-BD')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Show custom order details
                                    const details = `
ট্র্যাকিং: ${customOrder.tracking_id || customOrder.trackingId || 'N/A'}
গ্রাহক: ${customOrder.customer_name || customOrder.name || 'N/A'} (${customOrder.customer_phone || customOrder.whatsapp || 'N/A'})
ঠিকানা: ${customOrder.customerAddress || customOrder.address || 'N/A'}, ${customOrder.district || 'N/A'}, ${customOrder.thana || 'N/A'}
কাস্টমাইজেশন: ${customOrder.customizationInstructions || customOrder.customization || 'কোনো নির্দেশনা নেই'}
মোট: ${formatPrice(parseFloat(customOrder.total_price || customOrder.totalPrice || '0'))}
পেমেন্ট: ${customOrder.paymentMethod || 'N/A'}
${customOrder.notes ? `নোট: ${customOrder.notes}` : ''}
                                    `;
                                    alert(details);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Select
                                  value={customOrder.status}
                                  onValueChange={(newStatus) => {
                                    // Update custom order status
                                    // This would be implemented with a mutation
                                    console.log('Update custom order status:', customOrder.id, newStatus);
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">অপেক্ষমান</SelectItem>
                                    <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                                    <SelectItem value="in_production">উৎপাদনে</SelectItem>
                                    <SelectItem value="completed">সম্পন্ন</SelectItem>
                                    <SelectItem value="cancelled">বাতিল</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <OfferManagement offers={offers} />
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes">
            <PromoCodeManagement promoCodes={promoCodes} />
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="site-settings">
            <SiteSettingsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
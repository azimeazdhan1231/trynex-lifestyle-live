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
import type { Product, Category, Order, PromoCode, Offer } from "@shared/schema";

// Import management components
import ProductManagement from "@/components/admin/product-management";
import CategoryManagement from "@/components/admin/category-management";
import OrderManagement from "@/components/admin/order-management";
import OfferManagement from "@/components/admin/offer-management";
import PromoCodeManagement from "@/components/admin/promo-code-management";

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
        return JSON.parse(items);
      } catch {
        return [{ productName: items, quantity: 1, productPrice: 0 }];
      }
    }
    return Array.isArray(items) ? items : [];
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
          <TabsList className="hidden md:grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">পণ্য</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">ক্যাটেগরি</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">অর্ডার</TabsTrigger>
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
                  { value: "offers", label: "অফার", icon: Gift },
                  { value: "promo-codes", label: "প্রোমো কোড", icon: Award }
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
                        <div>
                          <p className="font-medium" data-testid={`text-order-customer-${order.id}`}>
                            {order.customer_name}
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
                                {orderItems.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm">
                                    {item.productName || item.name} × {item.quantity}
                                    {item.customization && (
                                      <Badge variant="outline" className="ml-1 text-xs">
                                        কাস্টম
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(Number(order.total))}
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                                {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                              </Badge>
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
                        <CardContent className="space-y-2">
                          <p><strong>স্ট্যাটাস:</strong> 
                            <Badge className="ml-2">
                              {ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES] || selectedOrder.status}
                            </Badge>
                          </p>
                          <p><strong>মোট মূল্য:</strong> {formatPrice(Number(selectedOrder.total))}</p>
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
                            <div key={idx} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <p className="font-medium">{item.productName || item.name}</p>
                                <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                                {item.customization && (
                                  <div className="mt-1">
                                    <Badge variant="outline" className="text-xs">কাস্টমাইজড</Badge>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {typeof item.customization === 'string' 
                                        ? item.customization 
                                        : JSON.stringify(item.customization)
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                              <p className="font-medium">{formatPrice(item.productPrice * item.quantity)}</p>
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

                    {/* Custom Images */}
                    {selectedOrder.custom_images && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">কাস্টম ইমেজ</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {JSON.parse(selectedOrder.custom_images).map((image: string, idx: number) => (
                              <img
                                key={idx}
                                src={image}
                                alt={`Custom ${idx + 1}`}
                                className="w-full h-32 object-cover rounded border"
                              />
                            ))}
                          </div>
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

          {/* Offers Tab */}
          <TabsContent value="offers">
            <OfferManagement offers={offers} />
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes">
            <PromoCodeManagement promoCodes={promoCodes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
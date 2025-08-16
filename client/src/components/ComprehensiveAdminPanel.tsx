import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Eye,
  BarChart3, Gift, Tag, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, ImageIcon, Phone, MapPin, Clock, Download,
  LogOut, Menu, X, RefreshCw, Truck, CheckCircle, XCircle
} from "lucide-react";
import type { Product, Category, Order, PromoCode, Offer, CustomOrder } from "@shared/schema";

// Import management components
import ProductManagement from "@/components/admin/product-management";
import CategoryManagement from "@/components/admin/category-management";
import OrderManagement from "@/components/admin/order-management";
import OfferManagement from "@/components/admin/offer-management";
import PromoCodeManagement from "@/components/admin/promo-code-management";
import SiteSettingsManagement from "@/components/admin/site-settings-management";

interface AdminPanelProps {
  onLogout?: () => void;
}

export default function ComprehensiveAdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data with error handling
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({ 
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

  // Calculate comprehensive dashboard stats
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const processingOrders = orders.filter(order => order.status === "processing").length;
  const shippedOrders = orders.filter(order => order.status === "shipped").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;
  const cancelledOrders = orders.filter(order => order.status === "cancelled").length;
  
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => (product.stock || 0) < 5).length;
  const outOfStockProducts = products.filter(product => (product.stock || 0) === 0).length;
  const featuredProducts = products.filter(product => product.is_featured).length;
  
  const activeOffers = offers.filter(offer => offer.active).length;
  const activePromoCodes = promoCodes.filter(promo => promo.is_active).length;
  const totalCustomOrders = customOrders.length;
  const pendingCustomOrders = customOrders.filter(order => order.status === "pending").length;

  // Order status update mutation
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

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

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

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
    queryClient.invalidateQueries({ queryKey: ["/api/custom-orders"] });
    toast({
      title: "ডেটা রিফ্রেশ হয়েছে",
      description: "সকল তথ্য সর্বশেষ অবস্থায় আপডেট করা হয়েছে।",
    });
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

  // Error state
  if (ordersError || productsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ডেটা লোড করতে সমস্যা হয়েছে</h2>
          <p className="text-gray-600 mb-4">অনুগ্রহ করে পেজ রিফ্রেশ করুন বা কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            পেজ রিফ্রেশ করুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">এডমিন ড্যাশবোর্ড</h1>
              <Badge variant="outline" className="ml-3 text-green-600 border-green-200">
                TryneX Lifestyle
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                রিফ্রেশ
              </Button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logout Button */}
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                লগআউট
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "dashboard", label: "ড্যাশবোর্ড", icon: BarChart3 },
                { value: "orders", label: "অর্ডার", icon: ShoppingCart },
                { value: "products", label: "পণ্য", icon: Package },
                { value: "categories", label: "ক্যাটেগরি", icon: Tag },
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
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Navigation */}
          <TabsList className="hidden md:grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              অর্ডার ({pendingOrders})
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              পণ্য
            </TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">
              <Tag className="h-4 w-4 mr-2" />
              ক্যাটেগরি
            </TabsTrigger>
            <TabsTrigger value="custom-orders" data-testid="tab-custom-orders">
              <Palette className="h-4 w-4 mr-2" />
              কাস্টম অর্ডার ({pendingCustomOrders})
            </TabsTrigger>
            <TabsTrigger value="offers" data-testid="tab-offers">
              <Gift className="h-4 w-4 mr-2" />
              অফার
            </TabsTrigger>
            <TabsTrigger value="promo-codes" data-testid="tab-promo-codes">
              <Award className="h-4 w-4 mr-2" />
              প্রমো কোড
            </TabsTrigger>
            <TabsTrigger value="site-settings" data-testid="tab-site-settings">
              <Settings className="h-4 w-4 mr-2" />
              সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-total-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">
                    {formatPrice(totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">সকল অর্ডার থেকে</p>
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
                  <p className="text-xs text-muted-foreground">সকল সময়ের</p>
                </CardContent>
              </Card>

              <Card data-testid="card-pending-orders">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">অপেক্ষমান অর্ডার</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-orders">
                    {pendingOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">প্রক্রিয়াকরণের জন্য</p>
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
                  <p className="text-xs text-muted-foreground">সক্রিয় পণ্য</p>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">কম স্টক</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {lowStockProducts}
                  </div>
                  <p className="text-xs text-muted-foreground">৫ এর কম স্টক</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">স্টক শেষ</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {outOfStockProducts}
                  </div>
                  <p className="text-xs text-muted-foreground">স্টক নেই</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">সক্রিয় অফার</CardTitle>
                  <Gift className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {activeOffers}
                  </div>
                  <p className="text-xs text-muted-foreground">চলমান অফার</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">সক্রিয় প্রমো কোড</CardTitle>
                  <Award className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {activePromoCodes}
                  </div>
                  <p className="text-xs text-muted-foreground">ব্যবহারযোগ্য কোড</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
                <CardDescription>সর্বশেষ ১০টি অর্ডার</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">অর্ডার ID: {order.tracking_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(Number(order.total))}</p>
                          <p className="text-sm text-gray-600">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('bn-BD') : ''}
                          </p>
                        </div>
                        <Badge 
                          variant={order.status === "pending" ? "secondary" : "default"}
                          className={
                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "delivered" ? "bg-green-100 text-green-800" :
                            order.status === "cancelled" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }
                        >
                          {order.status === "pending" ? "অপেক্ষমান" :
                           order.status === "processing" ? "প্রক্রিয়াধীন" :
                           order.status === "shipped" ? "পাঠানো" :
                           order.status === "delivered" ? "ডেলিভার" :
                           order.status === "cancelled" ? "বাতিল" : order.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                          data-testid={`button-view-order-${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">কোনো অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrderManagement orders={orders} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductManagement products={products} categories={categories} />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManagement categories={categories} />
          </TabsContent>

          {/* Custom Orders Tab */}
          <TabsContent value="custom-orders">
            <Card>
              <CardHeader>
                <CardTitle>কাস্টম অর্ডার ব্যবস্থাপনা</CardTitle>
                <CardDescription>
                  কাস্টমাইজেশন অর্ডার দেখুন এবং পরিচালনা করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customOrders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-600">ট্র্যাকিং ID: {order.tracking_id}</p>
                        </div>
                        <Badge 
                          variant={order.status === "pending" ? "secondary" : "default"}
                          className={
                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-blue-100 text-blue-800"
                          }
                        >
                          {order.status === "pending" ? "অপেক্ষমান" :
                           order.status === "confirmed" ? "নিশ্চিত" :
                           order.status === "in_production" ? "তৈরি হচ্ছে" :
                           order.status === "completed" ? "সম্পন্ন" :
                           order.status === "cancelled" ? "বাতিল" : order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>বেস প্রাইস:</strong> {formatPrice(Number(order.basePrice))}</p>
                        <p><strong>মোট প্রাইস:</strong> {formatPrice(Number(order.totalPrice))}</p>
                        <p><strong>জেলা:</strong> {order.district}</p>
                        <p><strong>থানা:</strong> {order.thana}</p>
                      </div>
                      {order.customizationInstructions && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">কাস্টমাইজেশন নির্দেশনা:</p>
                          <p className="text-sm text-gray-600">{order.customizationInstructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {customOrders.length === 0 && (
                    <div className="text-center py-8">
                      <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">কোনো কাস্টম অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  )}
                </div>
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
                  <p><strong>নাম:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>ফোন:</strong> {selectedOrder.phone}</p>
                  <p><strong>জেলা:</strong> {selectedOrder.district}</p>
                  <p><strong>থানা:</strong> {selectedOrder.thana}</p>
                  {selectedOrder.address && <p><strong>ঠিকানা:</strong> {selectedOrder.address}</p>}
                  
                  <div className="mt-4">
                    <strong>অর্ডার স্ট্যাটাস আপডেট করুন:</strong>
                    <Select
                      value={selectedOrder.status || "pending"}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="mt-2">
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
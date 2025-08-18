import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { 
  Package, ShoppingCart, DollarSign, Clock, LogOut, Menu, X, 
  BarChart3, Tag, Gift, Award, Settings
} from "lucide-react";
import type { Product, Order } from "@shared/schema";

// Import the working management components
import ProductManagement from "@/components/admin/ProductManagement";
import OrderManagement from "@/components/admin/OrderManagement";

interface AdminPanelProps {
  onLogout?: () => void;
}

export default function AdminPanelMobile({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data for dashboard
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000,
  });

  // Calculate dashboard stats
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => (product.stock || 0) < 5).length;

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

  // Loading state
  if (ordersLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { value: "dashboard", label: "ড্যাশবোর্ড", icon: BarChart3 },
    { value: "products", label: "পণ্য", icon: Package },
    { value: "orders", label: "অর্ডার", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">এডমিন ড্যাশবোর্ড</h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">লগআউট</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Desktop Tabs List */}
          <TabsList className="hidden md:grid w-full grid-cols-3">
            {navigationItems.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile Tabs Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-1 gap-2">
                {navigationItems.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={activeTab === value ? "default" : "outline"}
                    className="justify-start w-full"
                    onClick={() => {
                      setActiveTab(value);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Tab Selector for small screens */}
          <div className="md:hidden bg-white rounded-lg shadow-sm">
            <div className="flex overflow-x-auto">
              {navigationItems.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === value
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Stats Cards - Mobile Optimized */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">মোট আয়</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {formatPrice(totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">মোট অর্ডার</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">অপেক্ষমান</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{pendingOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">মোট পণ্য</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{totalProducts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">সাম্প্রতিক অর্ডার</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-blue-600 font-mono">
                            {order.tracking_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(Number(order.total))}
                          </p>
                        </div>
                        <Badge variant={order.status === 'pending' ? 'destructive' : 'default'}>
                          {order.status === 'pending' ? 'অপেক্ষমান' : 'সম্পন্ন'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">স্টক সতর্কতা</CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts > 0 ? (
                    <div className="space-y-3">
                      {products
                        .filter(product => (product.stock || 0) < 5)
                        .slice(0, 5)
                        .map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                            <Badge variant="destructive">
                              স্টক: {product.stock || 0}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">সব পণ্যের স্টক পর্যাপ্ত রয়েছে</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <ProductManagement />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
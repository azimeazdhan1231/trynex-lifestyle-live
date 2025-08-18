import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  LogOut,
  Settings,
  Gift,
  Tag,
  UserPlus,
  Eye,
  DollarSign,
  Activity,
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import ProductManagement from './admin/ProductManagement';
import OrderManagement from './admin/OrderManagement';
import CategoryManagement from './admin/category-management';
import OfferManagement from './admin/offer-management';
import PromoCodeManagement from './admin/promo-code-management';
import SiteSettingsManagement from './admin/site-settings-management';

interface AdminPanelNewProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface RecentOrder {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  total: string;
  status: string;
  created_at: string;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  total_sales: number;
  revenue: number;
}

export default function AdminPanelNew({ onLogout }: AdminPanelNewProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Enhanced dashboard stats query
  const { 
    data: dashboardStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['/api/admin/dashboard-stats', refreshKey],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json() as DashboardStats;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Recent orders query
  const { 
    data: recentOrders = [], 
    isLoading: ordersLoading 
  } = useQuery({
    queryKey: ['/api/admin/recent-orders', refreshKey],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/recent-orders?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch recent orders');
      return response.json() as RecentOrder[];
    },
    refetchInterval: 30000,
  });

  // Top products query
  const { 
    data: topProducts = [], 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ['/api/admin/top-products', refreshKey],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/top-products?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch top products');
      return response.json() as TopProduct[];
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "রিফ্রেশ সফল",
      description: "ডেটা আপডেট করা হয়েছে",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + ' কোটি';
    if (num >= 100000) return (num / 100000).toFixed(1) + ' লক্ষ';
    if (num >= 1000) return (num / 1000).toFixed(1) + ' হাজার';
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'অপেক্ষমান';
      case 'confirmed': return 'নিশ্চিত';
      case 'processing': return 'প্রক্রিয়াধীন';
      case 'shipped': return 'পাঠানো হয়েছে';
      case 'delivered': return 'ডেলিভার হয়েছে';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">অ্যাডমিন প্যানেল</h1>
                <p className="text-sm text-gray-500">ড্যাশবোর্ড ও ব্যবস্থাপনা</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                disabled={statsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                লগআউট
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm border shadow-sm">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Package className="h-4 w-4 mr-2" />
              পণ্য
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              অর্ডার
            </TabsTrigger>
            <TabsTrigger 
              value="categories"
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              <Tag className="h-4 w-4 mr-2" />
              ক্যাটেগরি
            </TabsTrigger>
            <TabsTrigger 
              value="offers"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
            >
              <Gift className="h-4 w-4 mr-2" />
              অফার
            </TabsTrigger>
            <TabsTrigger 
              value="promo-codes"
              className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
            >
              <Tag className="h-4 w-4 mr-2" />
              প্রোমো
            </TabsTrigger>
            <TabsTrigger 
              value="customers"
              className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700"
            >
              <Users className="h-4 w-4 mr-2" />
              কাস্টমার
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 mb-1">মোট আয়</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {statsLoading ? '...' : formatPrice(dashboardStats?.totalRevenue || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
                        <span className="text-xs text-emerald-600">
                          +{dashboardStats?.revenueGrowth || 0}% এই মাসে
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-200/50 rounded-full">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">মোট অর্ডার</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {statsLoading ? '...' : formatNumber(dashboardStats?.totalOrders || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-xs text-blue-600">
                          +{dashboardStats?.orderGrowth || 0}% এই মাসে
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-200/50 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Orders */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">অপেক্ষমান অর্ডার</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {statsLoading ? '...' : formatNumber(dashboardStats?.pendingOrders || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <Clock className="h-3 w-3 text-amber-600 mr-1" />
                        <span className="text-xs text-amber-600">প্রক্রিয়ার জন্য অপেক্ষা</span>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-200/50 rounded-full">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Products */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">মোট পণ্য</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {statsLoading ? '...' : formatNumber(dashboardStats?.totalProducts || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <Package className="h-3 w-3 text-purple-600 mr-1" />
                        <span className="text-xs text-purple-600">সক্রিয় পণ্য</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-200/50 rounded-full">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="bg-white/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    সাম্প্রতিক অর্ডার
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div 
                          key={order.id} 
                          className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border hover:bg-gray-100/80 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-mono text-blue-600">
                                #{order.tracking_id}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(order.status)}`}
                              >
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.district}, {order.thana}
                              <Phone className="h-3 w-3 ml-3 mr-1" />
                              {order.phone}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(Number(order.total))}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">কোন সাম্প্রতিক অর্ডার নেই</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="bg-white/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    জনপ্রিয় পণ্য
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {topProducts.slice(0, 5).map((product, index) => (
                        <div 
                          key={product.id} 
                          className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border hover:bg-gray-100/80 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-600">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(product.revenue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.total_sales} বিক্রি
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">কোন বিক্রিত পণ্যের তথ্য নেই</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  পণ্য ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                  অর্ডার ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-orange-600" />
                  ক্যাটেগরি ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-pink-600" />
                  অফার ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OfferManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-indigo-600" />
                  প্রোমো কোড ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PromoCodeManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-cyan-600" />
                  কাস্টমার ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">কাস্টমার ব্যবস্থাপনা</h3>
                  <p className="text-gray-500 mb-4">সকল কাস্টমারের তথ্য এবং অর্ডার ইতিহাস দেখুন</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    শীঘ্রই আসছে
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  সাইট সেটিংস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SiteSettingsManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
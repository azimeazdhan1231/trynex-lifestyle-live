
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Eye,
  RefreshCw,
  DollarSign,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  overview: {
    total_revenue: number;
    revenue_change: number;
    total_orders: number;
    orders_change: number;
    total_customers: number;
    customers_change: number;
    conversion_rate: number;
    conversion_change: number;
  };
  revenue_chart: Array<{
    month: string;
    revenue: number;
  }>;
  top_products: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recent_activities: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
  }>;
  category_distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  traffic_sources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch admin stats with error handling
  const {
    data: adminStats,
    isLoading: adminStatsLoading,
    error: adminStatsError,
    refetch: refetchAdminStats
  } = useQuery({
    queryKey: ['/api/admin/stats', refreshKey],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json();
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch orders with error handling
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['/api/admin/orders', refreshKey],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    refetchInterval: 10000,
    retry: 2,
  });

  // Fetch products with error handling
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['/api/admin/products', refreshKey],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    refetchInterval: 60000,
    retry: 2,
  });

  // Fallback analytics data
  const {
    data: fallbackAnalytics,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useQuery({
    queryKey: ['/api/analytics', refreshKey],
    refetchInterval: 30000,
    retry: 1,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchAdminStats();
    refetchOrders();
    refetchProducts();
  };

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

  // Calculate stats from available data
  const calculateStats = () => {
    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0) || 0;
    const pendingOrders = orders?.filter(order => order.status === 'pending')?.length || 0;
    const processingOrders = orders?.filter(order => order.status === 'processing')?.length || 0;
    const shippedOrders = orders?.filter(order => order.status === 'shipped')?.length || 0;
    const deliveredOrders = orders?.filter(order => order.status === 'delivered')?.length || 0;
    const lowStockProducts = products?.filter(product => (product.stock || 0) < 5)?.length || 0;

    return {
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      lowStockProducts,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  };

  const stats = calculateStats();

  if (adminStatsLoading || ordersLoading || productsLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার ব্যবসার সম্পূর্ণ চিত্র</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Error Alert */}
      {(adminStatsError || ordersError || productsError) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-amber-800">
                কিছু ডেটা লোড করতে সমস্যা হচ্ছে। উপলব্ধ ডেটা দেখানো হচ্ছে।
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(adminStats?.totalRevenue || stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{adminStats?.revenueGrowth || '0'}%
              </span>
              {' '}গত মাস থেকে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.totalOrders || stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">
                {adminStats?.pendingOrders || stats.pendingOrders} অপেক্ষমান
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পণ্য</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.totalProducts || stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">
                {adminStats?.lowStockProducts || stats.lowStockProducts} কম স্টক
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">গড় অর্ডার</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(adminStats?.averageOrderValue || stats.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              প্রতি অর্ডার গড় মূল্য
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>অর্ডার স্ট্যাটাস</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">অপেক্ষমান</span>
                </div>
                <span className="font-bold text-yellow-700">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">প্রক্রিয়াকরণ</span>
                </div>
                <span className="font-bold text-blue-700">{stats.processingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">পাঠানো</span>
                </div>
                <span className="font-bold text-green-700">{stats.shippedOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-medium">ডেলিভার</span>
                </div>
                <span className="font-bold text-emerald-700">{stats.deliveredOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>দ্রুত কাজ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                নতুন পণ্য যোগ করুন
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                অর্ডার দেখুন
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                রিপোর্ট দেখুন
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                গ্রাহক তালিকা
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>সাম্প্রতিক অর্ডার</span>
            <Badge variant="outline">
              {orders?.length || 0} টি অর্ডার
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">ট্র্যাকিং আইডি</th>
                    <th className="text-left py-2">গ্রাহক</th>
                    <th className="text-left py-2">ফোন</th>
                    <th className="text-left py-2">মোট</th>
                    <th className="text-left py-2">স্ট্যাটাস</th>
                    <th className="text-left py-2">তারিখ</th>
                    <th className="text-left py-2">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-sm">{order.tracking_id}</td>
                      <td className="py-3">{order.customer_name}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {order.phone}
                        </div>
                      </td>
                      <td className="py-3 font-bold">
                        {formatPrice(parseFloat(order.total || 0))}
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        </div>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              কোন অর্ডার পাওয়া যায়নি
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>সিস্টেম স্ট্যাটাস</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">ডাটাবেস</p>
                <p className="text-sm text-gray-600">সক্রিয়</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">API</p>
                <p className="text-sm text-gray-600">সক্রিয়</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div>
                <p className="font-medium">বিশ্লেষণ</p>
                <p className="text-sm text-gray-600">আংশিক</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

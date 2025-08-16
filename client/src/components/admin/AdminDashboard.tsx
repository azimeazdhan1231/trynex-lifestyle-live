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
  BarChart3
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

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery<DashboardStats>({
    queryKey: ['/api/analytics', refreshKey],
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['/api/orders', refreshKey],
    refetchInterval: 10000, // Auto refresh every 10 seconds
  });

  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['/api/products', refreshKey],
    refetchInterval: 60000, // Auto refresh every minute
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchStats();
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

  if (statsLoading || ordersLoading || productsLoading) {
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

  if (statsError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে
          <Button onClick={handleRefresh} className="ml-4">
            পুনরায় চেষ্টা
          </Button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.overview.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={`${stats?.overview.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.overview.revenue_change >= 0 ? '+' : ''}
                {stats?.overview.revenue_change?.toFixed(1) || 0}%
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
              {stats?.overview.total_orders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={`${stats?.overview.orders_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.overview.orders_change >= 0 ? '+' : ''}
                {stats?.overview.orders_change?.toFixed(1) || 0}%
              </span>
              {' '}গত মাস থেকে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">গ্রাহক</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.total_customers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={`${stats?.overview.customers_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.overview.customers_change >= 0 ? '+' : ''}
                {stats?.overview.customers_change?.toFixed(1) || 0}%
              </span>
              {' '}গত মাস থেকে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কনভার্শন রেট</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.conversion_rate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={`${stats?.overview.conversion_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.overview.conversion_change >= 0 ? '+' : ''}
                {stats?.overview.conversion_change?.toFixed(1) || 0}%
              </span>
              {' '}গত মাস থেকে
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>মাসিক আয়</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {stats?.revenue_chart?.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(item.revenue / Math.max(...stats.revenue_chart.map(d => d.revenue))) * 200}px`
                    }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_activities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>শীর্ষ পণ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.top_products?.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} বিক্রি</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>ক্যাটাগরি বিতরণ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.category_distribution?.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="font-bold">{category.value}%</span>
                </div>
              ))}
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
                {orders?.slice(0, 10)?.map((order: any) => (
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
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>ট্রাফিক উৎস</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.traffic_sources?.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {source.source.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{source.source}</p>
                    <p className="text-sm text-gray-500">{source.visitors} ভিজিটর</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{source.percentage}%</p>
                  <div className="w-16 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
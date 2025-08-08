import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Heart,
  MessageSquare
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { formatPrice } from "@/lib/constants";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
}

interface CustomerData {
  new: number;
  returning: number;
}

export default function EnhancedDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  
  // Queries for different data sets
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats", dateRange],
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData[]>({
    queryKey: ["/api/admin/dashboard/revenue", dateRange],
    staleTime: 1000 * 60 * 5,
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery<TopProduct[]>({
    queryKey: ["/api/admin/dashboard/top-products", dateRange],
    staleTime: 1000 * 60 * 5,
  });

  const { data: customerData, isLoading: customerLoading } = useQuery<CustomerData>({
    queryKey: ["/api/admin/dashboard/customers", dateRange],
    staleTime: 1000 * 60 * 5,
  });

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
    }, 1000 * 60 * 5); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [refetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
    ]);
    setRefreshing(false);
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // Mock data for demonstration (replace with real API data)
  const mockStats: DashboardStats = stats || {
    totalRevenue: 125420,
    revenueChange: 12.5,
    totalOrders: 1247,
    ordersChange: 8.3,
    totalCustomers: 892,
    customersChange: 15.7,
    averageOrderValue: 2450,
    aovChange: -2.1,
    conversionRate: 3.2,
    conversionChange: 0.8,
    totalProducts: 156,
    lowStockProducts: 12,
    pendingOrders: 23,
    shippedOrders: 45,
    deliveredOrders: 156,
    cancelledOrders: 8
  };

  const mockRevenueData: RevenueData[] = revenueData || [
    { date: '2025-01-01', revenue: 15420, orders: 45 },
    { date: '2025-01-02', revenue: 18230, orders: 52 },
    { date: '2025-01-03', revenue: 21450, orders: 61 },
    { date: '2025-01-04', revenue: 19800, orders: 58 },
    { date: '2025-01-05', revenue: 23100, orders: 67 },
    { date: '2025-01-06', revenue: 25870, orders: 72 },
    { date: '2025-01-07', revenue: 22340, orders: 63 },
  ];

  const mockTopProducts: TopProduct[] = topProducts || [
    { id: '1', name: 'কাস্টম মগ', sales: 145, revenue: 29000, stock: 23 },
    { id: '2', name: 'ব্যক্তিগত টি-শার্ট', sales: 132, revenue: 52800, stock: 45 },
    { id: '3', name: 'ফটো ফ্রেম', sales: 98, revenue: 19600, stock: 12 },
    { id: '4', name: 'কিচেইন', sales: 89, revenue: 8900, stock: 67 },
    { id: '5', name: 'কাস্টম পোস্টার', sales: 76, revenue: 22800, stock: 8 },
  ];

  const orderStatusData = [
    { name: 'ডেলিভার হয়েছে', value: mockStats.deliveredOrders, color: '#10B981' },
    { name: 'পাঠানো হয়েছে', value: mockStats.shippedOrders, color: '#3B82F6' },
    { name: 'অপেক্ষমাণ', value: mockStats.pendingOrders, color: '#F59E0B' },
    { name: 'বাতিল', value: mockStats.cancelledOrders, color: '#EF4444' },
  ];

  const customerTypeData = [
    { name: 'নতুন গ্রাহক', value: customerData?.new || 340, color: '#8B5CF6' },
    { name: 'পুরাতন গ্রাহক', value: customerData?.returning || 552, color: '#06B6D4' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড ওভারভিউ</h2>
          <p className="text-gray-600">রিয়েল-টাইম বিজনেস পারফরম্যান্স</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="7d">গত ৭ দিন</option>
            <option value="30d">গত ৩০ দিন</option>
            <option value="90d">গত ৯০ দিন</option>
            <option value="1y">গত ১ বছর</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(mockStats.totalRevenue)}</div>
            <div className="flex items-center text-xs">
              {getChangeIcon(mockStats.revenueChange)}
              <span className={`ml-1 ${getChangeColor(mockStats.revenueChange)}`}>
                {formatChange(mockStats.revenueChange)} গত মাসের তুলনায়
              </span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-75"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {getChangeIcon(mockStats.ordersChange)}
              <span className={`ml-1 ${getChangeColor(mockStats.ordersChange)}`}>
                {formatChange(mockStats.ordersChange)} গত মাসের তুলনায়
              </span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-75"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট গ্রাহক</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {getChangeIcon(mockStats.customersChange)}
              <span className={`ml-1 ${getChangeColor(mockStats.customersChange)}`}>
                {formatChange(mockStats.customersChange)} গত মাসের তুলনায়
              </span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-purple-500 opacity-75"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">গড় অর্ডার ভ্যালু</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(mockStats.averageOrderValue)}</div>
            <div className="flex items-center text-xs">
              {getChangeIcon(mockStats.aovChange)}
              <span className={`ml-1 ${getChangeColor(mockStats.aovChange)}`}>
                {formatChange(mockStats.aovChange)} গত মাসের তুলনায়
              </span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-orange-500 opacity-75"></div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              রাজস্ব প্রবণতা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value: number) => [`${formatPrice(value)}`, 'রাজস্ব']}
                    labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              অর্ডার স্ট্যাটাস বিতরণ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              শীর্ষ বিক্রিত পণ্য
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.sales} বিক্রি • স্টক: {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatPrice(product.revenue)}</p>
                    <Badge variant={product.stock < 20 ? "destructive" : "secondary"} className="text-xs">
                      {product.stock < 20 ? "কম স্টক" : "পর্যাপ্ত"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              গ্রাহক বিশ্লেষণ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Customer Type Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {customerTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Conversion Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">রূপান্তর হার</span>
                  <span className="text-sm font-bold">{mockStats.conversionRate}%</span>
                </div>
                <Progress value={mockStats.conversionRate} className="h-2" />
                <div className="flex items-center text-xs">
                  {getChangeIcon(mockStats.conversionChange)}
                  <span className={`ml-1 ${getChangeColor(mockStats.conversionChange)}`}>
                    {formatChange(mockStats.conversionChange)} গত মাসের তুলনায়
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            দ্রুত অ্যাকশন প্রয়োজন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">কম স্টক</span>
              </div>
              <p className="text-2xl font-bold text-red-800">{mockStats.lowStockProducts}</p>
              <p className="text-sm text-red-600">পণ্যগুলিতে স্টক কম</p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">অপেক্ষমাণ অর্ডার</span>
              </div>
              <p className="text-2xl font-bold text-yellow-800">{mockStats.pendingOrders}</p>
              <p className="text-sm text-yellow-600">নিশ্চিতকরণের অপেক্ষায়</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">আজকের ডেলিভারি</span>
              </div>
              <p className="text-2xl font-bold text-green-800">32</p>
              <p className="text-sm text-green-600">সফল ডেলিভারি</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
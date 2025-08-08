import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("last_30_days");
  
  // Real API query for analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", dateRange],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  
  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overviewData = (analytics as any)?.overview || {
    total_revenue: 0,
    revenue_change: 0,
    total_orders: 0,
    orders_change: 0,
    total_customers: 0,
    customers_change: 0,
    conversion_rate: 0,
    conversion_change: 0
  };

  const monthlyData = (analytics as any)?.monthly_revenue || [];
  const topProductsData = (analytics as any)?.top_products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">অ্যানালিটিক্স ড্যাশবোর্ড</h2>
          <p className="text-gray-600">ব্যবসার পারফরম্যান্স ট্র্যাক করুন</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">গত ৭ দিন</SelectItem>
            <SelectItem value="last_30_days">গত ৩০ দিন</SelectItem>
            <SelectItem value="last_90_days">গত ৯০ দিন</SelectItem>
            <SelectItem value="last_year">গত বছর</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(overviewData.total_revenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(overviewData.revenue_change)}
              <span className={`text-xs font-medium ${getChangeColor(overviewData.revenue_change)}`}>
                {Math.abs(overviewData.revenue_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overviewData.total_orders}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(overviewData.orders_change)}
              <span className={`text-xs font-medium ${getChangeColor(overviewData.orders_change)}`}>
                {Math.abs(overviewData.orders_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট গ্রাহক</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {overviewData.total_customers}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(overviewData.customers_change)}
              <span className={`text-xs font-medium ${getChangeColor(overviewData.customers_change)}`}>
                {Math.abs(overviewData.customers_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কনভার্শন রেট</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overviewData.conversion_rate}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(overviewData.conversion_change)}
              <span className={`text-xs font-medium ${getChangeColor(overviewData.conversion_change)}`}>
                {Math.abs(overviewData.conversion_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>মাসিক আয়</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((item: { month: string; revenue: number; orders: number }, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.month}</span>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{formatPrice(item.revenue)}</div>
                  <div className="text-sm text-gray-600">{item.orders} টি অর্ডার</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>জনপ্রিয় পণ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProductsData.map((product: { name: string; sales: number; revenue: number }, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.sales} টি বিক্রি</div>
                </div>
                <div className="font-bold text-green-600">{formatPrice(product.revenue)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
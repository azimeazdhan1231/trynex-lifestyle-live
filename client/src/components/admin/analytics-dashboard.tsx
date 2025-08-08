import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package, Calendar, Eye, MousePointer, ArrowUpRight } from "lucide-react";

// All data now comes from real API endpoints

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
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
              {formatCurrency(analytics.overview.total_revenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(analytics.overview.revenue_change)}
              <span className={`text-xs font-medium ${getChangeColor(analytics.overview.revenue_change)}`}>
                {Math.abs(analytics.overview.revenue_change)}%
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
              {analytics.overview.total_orders}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(analytics.overview.orders_change)}
              <span className={`text-xs font-medium ${getChangeColor(analytics.overview.orders_change)}`}>
                {Math.abs(analytics.overview.orders_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">গ্রাহক</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.overview.total_customers}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(analytics.overview.customers_change)}
              <span className={`text-xs font-medium ${getChangeColor(analytics.overview.customers_change)}`}>
                {Math.abs(analytics.overview.customers_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কনভার্শন রেট</CardTitle>
            <MousePointer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.overview.conversion_rate}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon(analytics.overview.conversion_change)}
              <span className={`text-xs font-medium ${getChangeColor(analytics.overview.conversion_change)}`}>
                {Math.abs(analytics.overview.conversion_change)}%
              </span>
              <span className="text-xs text-gray-600">গত মাস থেকে</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>মাসিক আয় ও অর্ডার</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.revenue_chart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(Number(value)) : value,
                    name === "revenue" ? "আয়" : "অর্ডার"
                  ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" name="revenue" />
                <Bar dataKey="orders" fill="#10b981" name="orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>ক্যাটাগরি অনুযায়ী বিক্রয়</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.category_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "শতাংশ"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>শীর্ষ বিক্রিত পণ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} টি বিক্রি</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>ট্রাফিক সোর্স</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.traffic_sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{source.visitors.toLocaleString()}</span>
                    <Badge variant="secondary">{source.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recent_activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
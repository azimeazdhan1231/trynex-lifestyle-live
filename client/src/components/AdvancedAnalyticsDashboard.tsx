import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatPrice } from "@/lib/constants";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Star,
  Eye,
  BarChart3
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

const FILTER_OPTIONS = [
  { value: "today", label: "আজ", days: 0 },
  { value: "yesterday", label: "গতকাল", days: 1 },
  { value: "7days", label: "গত ৭ দিন", days: 7 },
  { value: "30days", label: "গত ৩০ দিন", days: 30 },
  { value: "this-month", label: "এই মাস", days: null },
  { value: "last-month", label: "গত মাস", days: null },
  { value: "this-year", label: "এই বছর", days: null },
  { value: "custom", label: "কাস্টম রেঞ্জ", days: null }
];

export default function AdvancedAnalyticsDashboard() {
  const [dateFilter, setDateFilter] = useState("30days");
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    const selected = FILTER_OPTIONS.find(opt => opt.value === dateFilter);
    
    switch (dateFilter) {
      case "today":
        return { from: now, to: now };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return { from: yesterday, to: yesterday };
      case "7days":
        return { from: subDays(now, 7), to: now };
      case "30days":
        return { from: subDays(now, 30), to: now };
      case "this-month":
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case "last-month":
        const lastMonth = subDays(startOfMonth(now), 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      case "this-year":
        return { from: startOfYear(now), to: endOfYear(now) };
      case "custom":
        return customDateRange.from && customDateRange.to ? customDateRange : { from: subDays(now, 30), to: now };
      default:
        return { from: subDays(now, 30), to: now };
    }
  };

  const { from, to } = getDateRange();

  // Fetch real data with date filtering
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery<any[]>({
    queryKey: ["/api/orders", from?.toISOString(), to?.toISOString()],
    enabled: !!from && !!to
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({ 
    queryKey: ["/api/products"] 
  });

  const { data: customOrders = [], isLoading: customOrdersLoading } = useQuery<any[]>({
    queryKey: ["/api/custom-orders", from?.toISOString(), to?.toISOString()],
    enabled: !!from && !!to
  });

  // Calculate real analytics based on actual data
  const analytics = useMemo(() => {
    const filteredOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at || order.createdAt);
      return orderDate >= from! && orderDate <= to!;
    });

    const filteredCustomOrders = customOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= from! && orderDate <= to!;
    });

    // Revenue calculations
    const totalRevenue = filteredOrders.reduce((sum: number, order: any) => 
      sum + (Number(order.total) || 0), 0
    );

    const customOrderRevenue = filteredCustomOrders.reduce((sum: number, order: any) => 
      sum + (Number(order.totalPrice) || 0), 0
    );

    const combinedRevenue = totalRevenue + customOrderRevenue;

    // Order statistics
    const totalOrdersCount = filteredOrders.length + filteredCustomOrders.length;
    const pendingOrders = [
      ...filteredOrders.filter((o: any) => o.status === 'pending'),
      ...filteredCustomOrders.filter((o: any) => o.status === 'pending')
    ].length;

    const deliveredOrders = [
      ...filteredOrders.filter((o: any) => o.status === 'delivered'),
      ...filteredCustomOrders.filter((o: any) => o.status === 'delivered')
    ].length;

    // Product statistics
    const lowStockProducts = products.filter((p: any) => (p.stock || 0) < 10).length;
    const outOfStockProducts = products.filter((p: any) => (p.stock || 0) === 0).length;

    // Calculate growth rate (compare with previous period)
    const periodLength = Math.ceil((to!.getTime() - from!.getTime()) / (1000 * 60 * 60 * 24));
    const previousFrom = new Date(from!.getTime() - periodLength * 24 * 60 * 60 * 1000);
    const previousTo = from!;

    const previousOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at || order.createdAt);
      return orderDate >= previousFrom && orderDate < previousTo;
    });

    const previousRevenue = previousOrders.reduce((sum: number, order: any) => 
      sum + (Number(order.total) || 0), 0
    );

    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;

    const orderGrowth = previousOrders.length > 0 
      ? ((filteredOrders.length - previousOrders.length) / previousOrders.length) * 100 
      : filteredOrders.length > 0 ? 100 : 0;

    return {
      totalRevenue: combinedRevenue,
      regularOrderRevenue: totalRevenue,
      customOrderRevenue,
      totalOrders: totalOrdersCount,
      regularOrders: filteredOrders.length,
      customOrders: filteredCustomOrders.length,
      pendingOrders,
      deliveredOrders,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      revenueGrowth,
      orderGrowth,
      averageOrderValue: totalOrdersCount > 0 ? combinedRevenue / totalOrdersCount : 0,
      conversionRate: totalOrdersCount > 0 ? (deliveredOrders / totalOrdersCount) * 100 : 0
    };
  }, [orders, customOrders, products, from, to]);

  const isLoading = ordersLoading || productsLoading || customOrdersLoading;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">অ্যানালিটিক্স ড্যাশবোর্ড</h2>
          <p className="text-gray-600">রিয়েল টাইম ডেটা এবং পারফরমেন্স ট্র্যাকিং</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="সময়সীমা নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {customDateRange.from && customDateRange.to ? (
                    `${format(customDateRange.from, "dd MMM")} - ${format(customDateRange.to, "dd MMM")}`
                  ) : (
                    "তারিখ নির্বাচন করুন"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange.from}
                  selected={customDateRange.from && customDateRange.to ? { from: customDateRange.from, to: customDateRange.to } : undefined}
                  onSelect={(range: any) => {
                    setCustomDateRange(range || {});
                    if (range?.from && range?.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Refresh Button */}
          <Button variant="outline" onClick={() => refetchOrders()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Date Range Display */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <CalendarIcon className="w-4 h-4 inline mr-2" />
          ডেটা রেঞ্জ: {format(from!, "dd MMMM yyyy")} - {format(to!, "dd MMMM yyyy")}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">মোট আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatPrice(analytics.totalRevenue)}</div>
            <div className="flex items-center mt-2">
              {analytics.revenueGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-xs font-medium ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-600 ml-2">পূর্ববর্তী সময় থেকে</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">সাধারণ অর্ডার:</span>
                <span className="font-medium">{formatPrice(analytics.regularOrderRevenue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">কাস্টম অর্ডার:</span>
                <span className="font-medium">{formatPrice(analytics.customOrderRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analytics.totalOrders}</div>
            <div className="flex items-center mt-2">
              {analytics.orderGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-xs font-medium ${analytics.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.orderGrowth >= 0 ? '+' : ''}{analytics.orderGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">সাধারণ অর্ডার:</span>
                <span className="font-medium">{analytics.regularOrders}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">কাস্টম অর্ডার:</span>
                <span className="font-medium">{analytics.customOrders}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">পেন্ডিং:</span>
                <span className="font-medium text-orange-600">{analytics.pendingOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">পণ্য স্ট্যাটাস</CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics.totalProducts}</div>
            <p className="text-xs text-purple-600 mt-1">মোট পণ্য</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">কম স্টক:</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {analytics.lowStockProducts}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">স্টক আউট:</span>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  {analytics.outOfStockProducts}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">পারফরমেন্স</CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {formatPrice(analytics.averageOrderValue)}
            </div>
            <p className="text-xs text-orange-600 mt-1">গড় অর্ডার মূল্য</p>
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">কনভার্সন রেট:</span>
                <span className="font-medium">{analytics.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(analytics.conversionRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              দ্রুত দর্শন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">আজকের অর্ডার:</span>
                <Badge variant="secondary">
                  {orders.filter((o: any) => {
                    const orderDate = new Date(o.created_at || o.createdAt);
                    const today = new Date();
                    return orderDate.toDateString() === today.toDateString();
                  }).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">আজকের আয়:</span>
                <Badge variant="secondary">
                  {formatPrice(orders.filter((o: any) => {
                    const orderDate = new Date(o.created_at || o.createdAt);
                    const today = new Date();
                    return orderDate.toDateString() === today.toDateString();
                  }).reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0))}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              জনপ্রিয় পণ্য
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.slice(0, 3).map((product: any, index: number) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-sm truncate">{product.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">স্টক: {product.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              দ্রুত অ্যাকশন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                নতুন পণ্য যোগ করুন
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                অর্ডার দেখুন
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                রিপোর্ট তৈরি করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>ডেটা লোড হচ্ছে...</span>
          </div>
        </div>
      )}
    </div>
  );
}
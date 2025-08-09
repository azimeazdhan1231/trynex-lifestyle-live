import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import { 
  ShoppingCart, DollarSign, Clock, AlertTriangle, Package, 
  TrendingUp, Users, Eye, CheckCircle, XCircle 
} from "lucide-react";

export default function AdminDashboardStats() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });
  
  const { data: products = [], isLoading: productsLoading } = useQuery({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000,
  });

  const stats = useMemo(() => {
    const orderArray = Array.isArray(orders) ? orders : [];
    const productArray = Array.isArray(products) ? products : [];

    const totalOrders = orderArray.length;
    const totalRevenue = orderArray.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.total as string) || 0);
    }, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayOrders = orderArray.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart;
    }).length;

    const todayRevenue = orderArray
      .filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= todayStart;
      })
      .reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.total as string) || 0);
      }, 0);

    const pendingOrders = orderArray.filter((order: any) => order.status === 'pending').length;
    const processingOrders = orderArray.filter((order: any) => order.status === 'processing').length;
    const deliveredOrders = orderArray.filter((order: any) => order.status === 'delivered').length;
    const lowStockProducts = productArray.filter((product: any) => product.stock < 10).length;
    const outOfStockProducts = productArray.filter((product: any) => product.stock === 0).length;

    return {
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: productArray.length
    };
  }, [orders, products]);

  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.totalOrders
              )}
            </div>
            <p className="text-xs text-muted-foreground">সর্বমোট অর্ডার সংখ্যা</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                formatPrice(stats.totalRevenue)
              )}
            </div>
            <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের অর্ডার</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.todayOrders
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              আয়: {formatPrice(stats.todayRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.totalProducts
              )}
            </div>
            <p className="text-xs text-muted-foreground">মোট পণ্য সংখ্যা</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              অর্ডার স্ট্যাটাস
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">অপেক্ষমান</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {isLoading ? "..." : stats.pendingOrders}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">প্রক্রিয়াধীন</span>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {isLoading ? "..." : stats.processingOrders}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">ডেলিভার সম্পন্ন</span>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  {isLoading ? "..." : stats.deliveredOrders}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              স্টক সতর্কতা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">কম স্টক (১০ এর কম)</span>
                </div>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                  {isLoading ? "..." : stats.lowStockProducts}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">স্টক নেই</span>
                </div>
                <Badge variant="destructive">
                  {isLoading ? "..." : stats.outOfStockProducts}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>আজকের সারসংক্ষেপ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? "..." : stats.todayOrders}
              </div>
              <div className="text-sm text-blue-600">নতুন অর্ডার</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {isLoading ? "..." : formatPrice(stats.todayRevenue)}
              </div>
              <div className="text-sm text-green-600">আজকের আয়</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {isLoading ? "..." : stats.pendingOrders}
              </div>
              <div className="text-sm text-yellow-600">অপেক্ষমান</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {isLoading ? "..." : stats.processingOrders}
              </div>
              <div className="text-sm text-purple-600">প্রক্রিয়াধীন</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
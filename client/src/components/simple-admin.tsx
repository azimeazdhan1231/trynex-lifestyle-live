import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/constants";
import { Package, Users, TrendingUp, ShoppingCart, Star, DollarSign } from "lucide-react";
import type { Product, Order } from "@shared/schema";

const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

export default function SimpleAdmin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Controlled queries with minimal refetching
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1
  });

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => (product.stock || 0) < 5).length;

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">এডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-600">Trynex Lifestyle স্টোর ম্যানেজমেন্ট</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="products">পণ্য</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">সর্বমোট আয়</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground">অপেক্ষমান: {pendingOrders}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">কম স্টক: {lowStockProducts}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>অর্ডার ID</TableHead>
                      <TableHead>ফোন</TableHead>
                      <TableHead>মোট</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>তারিখ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell>{formatPrice(Number(order.total))}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সমস্ত অর্ডার</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>অর্ডার ID</TableHead>
                      <TableHead>গ্রাহক</TableHead>
                      <TableHead>ফোন</TableHead>
                      <TableHead>ঠিকানা</TableHead>
                      <TableHead>মোট</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>তারিখ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{order.address}</TableCell>
                        <TableCell>{formatPrice(Number(order.total))}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সমস্ত পণ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead>ক্যাটেগরি</TableHead>
                      <TableHead>দাম</TableHead>
                      <TableHead>স্টক</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatPrice(Number(product.price))}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock < 5 ? "destructive" : "outline"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {product.is_featured && <Badge variant="secondary">ফিচার্ড</Badge>}
                            {product.is_latest && <Badge variant="secondary">নতুন</Badge>}
                            {product.is_best_selling && <Badge variant="secondary">জনপ্রিয়</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
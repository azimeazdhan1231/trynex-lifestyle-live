import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Eye, Package, Users, TrendingUp, Settings, Gift, Tag, BarChart3, DollarSign, ShoppingCart, Star } from "lucide-react";
import { ORDER_STATUSES, formatPrice, PRODUCT_CATEGORIES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Order, Offer, Category, PromoCode } from "@shared/schema";

export default function AdminPanelNew() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [productForm, setProductForm] = useState({
    name: "", 
    price: "", 
    image_url: "", 
    category: "", 
    stock: 0, 
    description: "",
    is_featured: false, 
    is_latest: false, 
    is_best_selling: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "", 
    name_bengali: "", 
    description: "", 
    image_url: "", 
    is_active: true, 
    sort_order: 0
  });

  // Dialog states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Fetch data with error handling
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"]
  });
  
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({ 
    queryKey: ["/api/products"]
  });
  
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"]
  });

  // Handle errors silently
  if (ordersError) console.log("Orders loading failed");
  if (productsError) console.log("Products loading failed");
  if (categoriesError) console.log("Categories loading failed");

  // Dashboard statistics with safe calculations
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: Order) => {
    const orderTotal = Number(order.total) || 0;
    return sum + orderTotal;
  }, 0) : 0;
  
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const pendingOrders = Array.isArray(orders) ? orders.filter((order: Order) => order.status === "pending").length : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const lowStockProducts = Array.isArray(products) ? products.filter((product: Product) => (product.stock || 0) < 5).length : 0;

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({ title: "পণ্য যোগ করা হয়েছে", description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "পণ্য যোগ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/products/${editingProduct?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      resetProductForm();
      toast({ title: "পণ্য আপডেট হয়েছে", description: "পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "পণ্য আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "পণ্য মুছে ফেলা হয়েছে", description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "পণ্য মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Order status update mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "অর্ডার আপডেট হয়েছে", description: "অর্ডারের স্ট্যাটাস আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "অর্ডার আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Helper functions
  const resetProductForm = () => {
    setProductForm({
      name: "", price: "", image_url: "", category: "", stock: 0, description: "",
      is_featured: false, is_latest: false, is_best_selling: false
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      stock: product.stock,
      description: product.description || "",
      is_featured: product.is_featured || false,
      is_latest: product.is_latest || false,
      is_best_selling: product.is_best_selling || false
    });
    setIsProductDialogOpen(true);
  };

  const handleSubmitProduct = () => {
    const data = {
      ...productForm,
      price: parseFloat(productForm.price) || 0,
      stock: Number(productForm.stock) || 0
    };

    if (editingProduct) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">অ্যাডমিন প্যানেল</h1>
        <p className="text-gray-600 text-sm">সিস্টেম ম্যানেজমেন্ট ড্যাশবোর্ড</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Mobile-responsive tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-6 h-auto p-1 bg-gray-100 rounded-md">
              <TabsTrigger value="dashboard" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                ড্যাশবোর্ড
              </TabsTrigger>
              <TabsTrigger value="orders" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <ShoppingCart className="w-4 h-4 mr-1" />
                অর্ডার
              </TabsTrigger>
              <TabsTrigger value="products" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Package className="w-4 h-4 mr-1" />
                পণ্য
              </TabsTrigger>
              <TabsTrigger value="categories" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Tag className="w-4 h-4 mr-1" />
                ক্যাটাগরি
              </TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Users className="w-4 h-4 mr-1" />
                ব্যবহারকারী
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Settings className="w-4 h-4 mr-1" />
                সেটিংস
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-gray-600">সর্বমোট রেভিনিউ</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{totalOrders}</div>
                <p className="text-xs text-gray-600">{pendingOrders} টি পেন্ডিং</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">পণ্য</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{totalProducts}</div>
                <p className="text-xs text-gray-600">{lowStockProducts} টি কম স্টক</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">গ্রাহক</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">০</div>
                <p className="text-xs text-gray-600">নিবন্ধিত গ্রাহক</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">সাম্প্রতিক অর্ডার</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-4">লোড হচ্ছে...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4 text-gray-500">কোনো অর্ডার নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>অর্ডার ID</TableHead>
                        <TableHead>গ্রাহক</TableHead>
                        <TableHead>মোট</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id?.slice(0, 8)}...</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{formatPrice(Number(order.total))}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                              {String(ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                সকল অর্ডার
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">কোনো অর্ডার নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>অর্ডার ID</TableHead>
                        <TableHead>গ্রাহক</TableHead>
                        <TableHead>ফোন</TableHead>
                        <TableHead>মোট</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id?.slice(0, 8)}...</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.phone}</TableCell>
                          <TableCell>{formatPrice(Number(order.total))}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status || "pending"}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id!, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{String(value)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  পণ্য ম্যানেজমেন্ট
                </CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingProduct(null); resetProductForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      নতুন পণ্য
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div>
                        <Label htmlFor="name">পণ্যের নাম</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="পণ্যের নাম লিখুন"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">দাম</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="দাম লিখুন"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">স্টক</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                          placeholder="স্টক সংখ্যা"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">ক্যাটাগরি</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((cat: any) => (
                              <SelectItem key={cat.id || cat.value} value={cat.id || cat.value}>{cat.name || cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="image_url">ছবির লিংক</Label>
                        <Input
                          id="image_url"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="ছবির URL"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">বিবরণ</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="পণ্যের বিবরণ"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_featured"
                            checked={productForm.is_featured}
                            onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_featured: checked }))}
                          />
                          <Label htmlFor="is_featured">ফিচার্ড</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_latest"
                            checked={productForm.is_latest}
                            onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_latest: checked }))}
                          />
                          <Label htmlFor="is_latest">নতুন</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_best_selling"
                            checked={productForm.is_best_selling}
                            onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_best_selling: checked }))}
                          />
                          <Label htmlFor="is_best_selling">বেস্ট সেলিং</Label>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSubmitProduct}
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          className="flex-1"
                        >
                          {(createProductMutation.isPending || updateProductMutation.isPending) ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsProductDialogOpen(false)}
                          className="flex-1"
                        >
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">কোনো পণ্য নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>নাম</TableHead>
                        <TableHead>দাম</TableHead>
                        <TableHead>স্টক</TableHead>
                        <TableHead>ক্যাটাগরি</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock < 5 ? 'destructive' : 'secondary'}>
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {product.is_featured && <Badge variant="default" className="text-xs">ফিচার্ড</Badge>}
                              {product.is_latest && <Badge variant="secondary" className="text-xs">নতুন</Badge>}
                              {product.is_best_selling && <Badge variant="outline" className="text-xs">বেস্ট</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id!)}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-5 h-5" />
                ক্যাটাগরি ম্যানেজমেন্ট
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : (
                <div className="text-center py-8 text-gray-500">শীঘ্রই আসছে...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                ব্যবহারকারী ম্যানেজমেন্ট
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">শীঘ্রই আসছে...</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">শীঘ্রই আসছে...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
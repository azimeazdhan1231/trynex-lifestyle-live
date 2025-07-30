import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Edit, Trash2, Package, Gift, TrendingUp, Users, Clock, 
  Settings, Tag, BarChart3, Eye, Copy, Globe, Facebook, 
  Instagram, MessageCircle, Search, Filter, Download,
  DollarSign, ShoppingCart, Star, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, ORDER_STATUSES, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product, Order, Offer, Category, PromoCode, Analytics, SiteSettings } from "@shared/schema";

export default function EnhancedAdminTabs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Form states
  const [productForm, setProductForm] = useState({
    name: "", price: "", image_url: "", category: "", stock: 0, description: ""
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0
  });
  const [promoForm, setPromoForm] = useState({
    code: "", discount_type: "percentage", discount_value: 0, min_order_amount: 0,
    max_discount: 0, usage_limit: 100, expires_at: "", is_active: true
  });
  const [settingsForm, setSettingsForm] = useState({
    fb_pixel_id: "", ga_measurement_id: "", whatsapp_number: "", 
    delivery_fee_dhaka: "80", delivery_fee_outside: "120"
  });

  // Dialog states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);

  // Fetch data
  const { data: orders = [] } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: offers = [] } = useQuery<Offer[]>({ queryKey: ["/api/offers"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: promoCodes = [] } = useQuery<PromoCode[]>({ queryKey: ["/api/promo-codes"] });
  const { data: analytics = [] } = useQuery<Analytics[]>({ queryKey: ["/api/analytics"] });
  const { data: settings = [] } = useQuery<SiteSettings[]>({ queryKey: ["/api/settings"] });

  // Dashboard statistics
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock < 5).length;
  const activePromoCodes = promoCodes.filter(promo => promo.is_active).length;

  // Recent orders (last 7 days)
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "পণ্য যোগ করা হয়েছে", description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      resetProductForm();
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "পণ্য আপডেট হয়েছে", description: "পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      resetProductForm();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({ title: "পণ্য ডিলিট হয়েছে", description: "পণ্য সফলভাবে ডিলিট করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    }
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "ক্যাটাগরি যোগ করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    }
  });

  // Promo code mutations
  const createPromoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/promo-codes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "প্রমো কোড যোগ করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsPromoDialogOpen(false);
      resetPromoForm();
    }
  });

  // Order status update
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "অর্ডার স্ট্যাটাস আপডেট হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }
  });

  // Helper functions
  const resetProductForm = () => {
    setProductForm({ name: "", price: "", image_url: "", category: "", stock: 0, description: "" });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0 });
  };

  const resetPromoForm = () => {
    setPromoForm({
      code: "", discount_type: "percentage", discount_value: 0, min_order_amount: 0,
      max_discount: 0, usage_limit: 100, expires_at: "", is_active: true
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productForm });
    } else {
      createProductMutation.mutate(productForm);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(categoryForm);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPromoMutation.mutate(promoForm);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      stock: product.stock,
      description: ""
    });
    setIsProductDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            ড্যাশবোর্ড
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="w-4 h-4 mr-2" />
            অর্ডার
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            পণ্য
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="w-4 h-4 mr-2" />
            ক্যাটাগরি
          </TabsTrigger>
          <TabsTrigger value="offers">
            <Gift className="w-4 h-4 mr-2" />
            অফার
          </TabsTrigger>
          <TabsTrigger value="promos">
            <Star className="w-4 h-4 mr-2" />
            প্রমো কোড
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            সেটিংস
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingOrders} টি অপেক্ষমান
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {lowStockProducts} টি কম স্টক
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">প্রমো কোড</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePromoCodes}</div>
                <p className="text-xs text-muted-foreground">সক্রিয় প্রমো কোড</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.tracking_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <Badge variant={order.status === "pending" ? "destructive" : "secondary"}>
                        {ORDER_STATUSES.find(s => s.id === order.status)?.name || order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার ম্যানেজমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ট্র্যাকিং আইডি</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>ঠিকানা</TableHead>
                    <TableHead>পরিমাণ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.tracking_id}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.district}, {order.thana}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status || "pending"}
                          onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at || Date.now()).toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">পণ্য ম্যানেজমেন্ট</h3>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingProduct(null); resetProductForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন পণ্য যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">পণ্যের নাম</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">দাম</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">ক্যাটাগরি</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) => setProductForm({...productForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.filter(cat => cat.id !== "all").map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stock">স্টক</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">ইমেজ URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {editingProduct ? "আপডেট করুন" : "পণ্য যোগ করুন"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ছবি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>দাম</TableHead>
                    <TableHead>ক্যাটাগরি</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at || Date.now()).toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">ক্যাটাগরি ম্যানেজমেন্ট</h3>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCategoryForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন ক্যাটাগরি যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cat_name">ইংরেজি নাম</Label>
                    <Input
                      id="cat_name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat_name_bengali">বাংলা নাম</Label>
                    <Input
                      id="cat_name_bengali"
                      value={categoryForm.name_bengali}
                      onChange={(e) => setCategoryForm({...categoryForm, name_bengali: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat_description">বিবরণ</Label>
                    <Textarea
                      id="cat_description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat_image">ইমেজ URL</Label>
                    <Input
                      id="cat_image"
                      type="url"
                      value={categoryForm.image_url}
                      onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryForm.is_active}
                      onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                    />
                    <Label>সক্রিয় রাখুন</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending}>
                    ক্যাটাগরি যোগ করুন
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{category.name_bengali}</CardTitle>
                      <p className="text-sm text-gray-500">{category.name}</p>
                    </div>
                    <Badge variant={category.is_active ? "secondary" : "destructive"}>
                      {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">প্রমো কোড ম্যানেজমেন্ট</h3>
            <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPromoForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন প্রমো কোড যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন প্রমো কোড তৈরি করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePromoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="promo_code">প্রমো কোড</Label>
                    <Input
                      id="promo_code"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_type">ছাড়ের ধরন</Label>
                    <Select
                      value={promoForm.discount_type}
                      onValueChange={(value) => setPromoForm({...promoForm, discount_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                        <SelectItem value="fixed">নির্দিষ্ট পরিমাণ (৳)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount_value">
                      ছাড়ের পরিমাণ {promoForm.discount_type === "percentage" ? "(%)" : "(৳)"}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={promoForm.discount_value}
                      onChange={(e) => setPromoForm({...promoForm, discount_value: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_order">সর্বনিম্ন অর্ডার পরিমাণ (৳)</Label>
                    <Input
                      id="min_order"
                      type="number"
                      value={promoForm.min_order_amount}
                      onChange={(e) => setPromoForm({...promoForm, min_order_amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage_limit">ব্যবহারের সীমা</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={promoForm.usage_limit}
                      onChange={(e) => setPromoForm({...promoForm, usage_limit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_at">মেয়াদ উত্তীর্ণের তারিখ</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={promoForm.expires_at}
                      onChange={(e) => setPromoForm({...promoForm, expires_at: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={promoForm.is_active}
                      onCheckedChange={(checked) => setPromoForm({...promoForm, is_active: checked})}
                    />
                    <Label>সক্রিয় রাখুন</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={createPromoMutation.isPending}>
                    প্রমো কোড তৈরি করুন
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কোড</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead>ছাড়</TableHead>
                    <TableHead>সর্বনিম্ন অর্ডার</TableHead>
                    <TableHead>ব্যবহৃত/সীমা</TableHead>
                    <TableHead>মেয়াদ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {promo.discount_type === "percentage" ? "শতাংশ" : "টাকা"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {promo.discount_type === "percentage" 
                          ? `${promo.discount_value}%` 
                          : formatPrice(promo.discount_value)
                        }
                      </TableCell>
                      <TableCell>{formatPrice(promo.min_order_amount)}</TableCell>
                      <TableCell>
                        {promo.used_count}/{promo.usage_limit || "∞"}
                      </TableCell>
                      <TableCell>
                        {promo.expires_at 
                          ? new Date(promo.expires_at).toLocaleDateString('bn-BD')
                          : "কোন মেয়াদ নেই"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={promo.is_active ? "secondary" : "destructive"}>
                          {promo.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analytics & Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>অ্যানালিটিক্স ও ট্র্যাকিং</CardTitle>
                <p className="text-sm text-gray-600">গুগল অ্যানালিটিক্স ও ফেসবুক পিক্সেল সেটআপ</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fb_pixel">Facebook Pixel ID</Label>
                  <Input
                    id="fb_pixel"
                    value={settingsForm.fb_pixel_id}
                    onChange={(e) => setSettingsForm({...settingsForm, fb_pixel_id: e.target.value})}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-gray-500 mt-1">Facebook Ads Manager থেকে Pixel ID নিন</p>
                </div>
                <div>
                  <Label htmlFor="ga_id">Google Analytics Measurement ID</Label>
                  <Input
                    id="ga_id"
                    value={settingsForm.ga_measurement_id}
                    onChange={(e) => setSettingsForm({...settingsForm, ga_measurement_id: e.target.value})}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Google Analytics 4 থেকে Measurement ID নিন</p>
                </div>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  অ্যানালিটিক্স সেভ করুন
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Settings */}
            <Card>
              <CardHeader>
                <CardTitle>ডেলিভারি সেটিংস</CardTitle>
                <p className="text-sm text-gray-600">ডেলিভারি চার্জ ও যোগাযোগ তথ্য</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp নম্বর</Label>
                  <Input
                    id="whatsapp"
                    value={settingsForm.whatsapp_number}
                    onChange={(e) => setSettingsForm({...settingsForm, whatsapp_number: e.target.value})}
                    placeholder="8801xxxxxxxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="dhaka_fee">ঢাকায় ডেলিভারি চার্জ (৳)</Label>
                  <Input
                    id="dhaka_fee"
                    type="number"
                    value={settingsForm.delivery_fee_dhaka}
                    onChange={(e) => setSettingsForm({...settingsForm, delivery_fee_dhaka: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="outside_fee">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</Label>
                  <Input
                    id="outside_fee"
                    type="number"
                    value={settingsForm.delivery_fee_outside}
                    onChange={(e) => setSettingsForm({...settingsForm, delivery_fee_outside: e.target.value})}
                  />
                </div>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  ডেলিভারি সেটিংস সেভ করুন
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>সিস্টেম তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>মোট ডাটাবেস সাইজ:</span>
                  <Badge variant="secondary">~2.5 MB</Badge>
                </div>
                <div className="flex justify-between">
                  <span>সর্বশেষ ব্যাকআপ:</span>
                  <Badge variant="secondary">আজ 2:30 PM</Badge>
                </div>
                <div className="flex justify-between">
                  <span>API স্ট্যাটাস:</span>
                  <Badge variant="secondary">✅ সক্রিয়</Badge>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  ডাটা এক্সপোর্ট করুন
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>দ্রুত অ্যাকশন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  ওয়েবসাইট দেখুন
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook Page
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Business
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
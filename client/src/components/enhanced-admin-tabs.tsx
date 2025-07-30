import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Package, Users, BarChart3, Settings, Eye, EyeOff, Edit, DollarSign, ShoppingCart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ORDER_STATUSES, PRODUCT_CATEGORIES, formatPrice } from "@/lib/constants";
import type { Product, Order, Category, PromoCode, Offer, PopupOffer } from "@shared/schema";

export default function EnhancedAdminTabs() {
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
    name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0
  });

  // Dialog states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Fetch data
  const { data: orders = [] } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: promoCodes = [] } = useQuery<PromoCode[]>({ queryKey: ["/api/promo-codes"] });

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

  // Image upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProductForm({...productForm, image_url: result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCategoryForm({...categoryForm, image_url: result});
      };
      reader.readAsDataURL(file);
    }
  };

  // API request helper
  const apiRequest = async (url: string, method: string, data?: any) => {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`${method} ${url} failed`);
    return response.json();
  };

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiRequest("/api/products", "POST", productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({ title: "পণ্য সফলভাবে যোগ করা হয়েছে!" });
    },
    onError: () => toast({ title: "পণ্য যোগ করতে সমস্যা হয়েছে", variant: "destructive" })
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/products/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({ title: "পণ্য সফলভাবে আপডেট করা হয়েছে!" });
    },
    onError: () => toast({ title: "পণ্য আপডেট করতে সমস্যা হয়েছে", variant: "destructive" })
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/products/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "পণ্য সফলভাবে মুছে ফেলা হয়েছে!" });
    },
    onError: () => toast({ title: "পণ্য মুছতে সমস্যা হয়েছে", variant: "destructive" })
  });

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: any) => apiRequest("/api/categories", "POST", categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      toast({ title: "ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!" });
    },
    onError: () => toast({ title: "ক্যাটাগরি যোগ করতে সমস্যা হয়েছে", variant: "destructive" })
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/categories/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      toast({ title: "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!" });
    },
    onError: () => toast({ title: "ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে", variant: "destructive" })
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/categories/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!" });
    },
    onError: () => toast({ title: "ক্যাটাগরি মুছতে সমস্যা হয়েছে", variant: "destructive" })
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update order status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "অর্ডার স্ট্যাটাস আপডেট হয়েছে" });
    },
  });

  // Form reset functions
  const resetProductForm = () => {
    setProductForm({
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
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0 });
    setEditingCategory(null);
  };

  // Form submit handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productForm });
    } else {
      createProductMutation.mutate(productForm);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, ...categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      stock: product.stock,
      description: "",
      is_featured: product.is_featured || false,
      is_latest: product.is_latest || false,
      is_best_selling: product.is_best_selling || false
    });
    setIsProductDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      name_bengali: category.name_bengali || "",
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active ?? true,
      sort_order: category.sort_order || 0
    });
    setIsCategoryDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="products">পণ্য</TabsTrigger>
            <TabsTrigger value="categories">ক্যাটাগরি</TabsTrigger>
            <TabsTrigger value="offers">অফার</TabsTrigger>
            <TabsTrigger value="popup-offers">পপআপ অফার</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
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
                <p className="text-xs text-muted-foreground">সর্বমোট রেভিনিউ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingOrders} টি পেন্ডিং
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">পণ্য</CardTitle>
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
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">দাম (৳)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">স্টক</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>হোমপেজ প্রদর্শন অপশন</Label>
                      <div className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="is_featured"
                            checked={productForm.is_featured}
                            onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="is_featured" className="text-sm font-medium">
                            🌟 বিশেষ পণ্য (হোমপেজের Featured Products সেকশনে দেখাবে)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="is_latest"
                            checked={productForm.is_latest}
                            onChange={(e) => setProductForm({ ...productForm, is_latest: e.target.checked })}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="is_latest" className="text-sm font-medium">
                            🆕 সর্বশেষ পণ্য (হোমপেজের Latest Products সেকশনে দেখাবে)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="is_best_selling"
                            checked={productForm.is_best_selling}
                            onChange={(e) => setProductForm({ ...productForm, is_best_selling: e.target.checked })}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="is_best_selling" className="text-sm font-medium">
                            🔥 সর্বাধিক বিক্রিত (হোমপেজের Best Selling Products সেকশনে দেখাবে)
                          </Label>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        💡 একটি পণ্য একাধিক সেকশনে দেখানো যাবে
                      </p>
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
                        {categories.length > 0 ? categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name_bengali || category.name}
                          </SelectItem>
                        )) : PRODUCT_CATEGORIES.filter(cat => cat.id !== "all").map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">বিবরণ</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      placeholder="পণ্যের বিবরণ লিখুন"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">পণ্যের ছবি</Label>
                    <div className="space-y-2">
                      <Input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                      <div className="text-xs text-gray-500 text-center">অথবা</div>
                      <Input
                        id="image-url"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                        placeholder="ছবির URL দিন"
                      />
                      {productForm.image_url && (
                        <div className="mt-2">
                          <img 
                            src={productForm.image_url} 
                            alt="পূর্বরূপ" 
                            className="w-20 h-20 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iMiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJtMjEgMTUtMy01TDUgMjEiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';
                            }}
                          />
                        </div>
                      )}
                    </div>
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
                    <TableHead>ক্যাটেগরি</TableHead>
                  <TableHead>স্টক</TableHead>
                  <TableHead>ফ্ল্যাগ</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
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
                      <TableCell>{product.category || "অন্যান্য"}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.is_featured && <Badge variant="default" className="text-xs">বিশেষ</Badge>}
                          {product.is_latest && <Badge variant="secondary" className="text-xs">নতুন</Badge>}
                          {product.is_best_selling && <Badge variant="outline" className="text-xs">বেস্ট</Badge>}
                        </div>
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
                <Button onClick={() => { setEditingCategory(null); resetCategoryForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন ক্যাটাগরি যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি যোগ করুন"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">ক্যাটাগরির নাম (ইংরেজি)</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-name-bengali">ক্যাটাগরির নাম (বাংলা)</Label>
                    <Input
                      id="category-name-bengali"
                      value={categoryForm.name_bengali}
                      onChange={(e) => setCategoryForm({...categoryForm, name_bengali: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">বিবরণ</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-image">ক্যাটাগরির ছবি</Label>
                    <div className="space-y-2">
                      <Input
                        id="category-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageUpload}
                        className="cursor-pointer"
                      />
                      <div className="text-xs text-gray-500 text-center">অথবা</div>
                      <Input
                        id="category-image-url"
                        value={categoryForm.image_url}
                        onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                        placeholder="ছবির URL দিন"
                      />
                      {categoryForm.image_url && (
                        <div className="mt-2">
                          <img 
                            src={categoryForm.image_url} 
                            alt="পূর্বরূপ" 
                            className="w-20 h-20 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iMiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJtMjEgMTUtMy01TDUgMjEiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sort-order">সর্ট অর্ডার</Label>
                    <Input
                      id="sort-order"
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={categoryForm.is_active}
                      onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                    />
                    <Label htmlFor="is-active">সক্রিয়</Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  >
                    {editingCategory ? "আপডেট করুন" : "ক্যাটাগরি যোগ করুন"}
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
                    <TableHead>নাম (বাংলা)</TableHead>
                    <TableHead>নাম (ইংরেজি)</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>সর্ট অর্ডার</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <img
                          src={category.image_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name_bengali}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "secondary" : "destructive"}>
                          {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
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

         {/* Offers Tab */}
         <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>অফার ম্যানেজমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">অফার ফিচার শীঘ্রই আসছে...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popup Offers Tab */}
        <TabsContent value="popup-offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>পপআপ অফার ম্যানেজমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">পপআপ অফার ফিচার শীঘ্রই আসছে...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promo-codes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>প্রমো কোড ম্যানেজমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">প্রমো কোড ফিচার শীঘ্রই আসছে...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>সাইট সেটিংস</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">সেটিংস ফিচার শীঘ্রই আসছে...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
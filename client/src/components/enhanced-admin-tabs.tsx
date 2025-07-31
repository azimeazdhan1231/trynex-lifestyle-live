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
import { useOrderNotifications } from "@/hooks/use-order-notifications";
import { Plus, Edit2, Trash2, Eye, Package, Users, TrendingUp, Settings, Gift, Tag, Code, BarChart3, Archive, Calendar, Phone, MapPin, Banknote, User, Hash, CheckCircle, Clock, Bell, BellRing, DollarSign, ShoppingCart, Star, Edit } from "lucide-react";
import { ORDER_STATUSES, formatPrice, PRODUCT_CATEGORIES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import OrderDetailsModal from "@/components/order-details-modal";
import AnalyticsAdmin from "@/components/analytics-admin";
import type { Product, Order, Offer, Category, PromoCode, Analytics, SiteSettings } from "@shared/schema";
import UsersManagement from "@/components/users-management";

export default function EnhancedAdminTabs() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Order notifications
  const { 
    orders: notificationOrders, 
    newOrdersCount, 
    requestNotificationPermission, 
    hasNotificationPermission 
  } = useOrderNotifications();

  // Initialize notifications on mount - with mobile safety checks
  useEffect(() => {
    if (!isInitialized) {
      // Only request notification permission if not on mobile or if explicitly supported
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (!isMobile || ('Notification' in window && typeof Notification.requestPermission === 'function')) {
        try {
          requestNotificationPermission();
        } catch (error) {
          console.warn('Notification permission request failed:', error);
        }
      }
      
      // Show welcome message only once - shorter for mobile
      toast({
        title: "অ্যাডমিন প্যানেল সক্রিয়",
        description: isMobile ? "মোবাইল ড্যাশবোর্ড লোড হয়েছে" : "রিয়েল-টাইম নোটিফিকেশন চালু আছে",
        duration: 3000,
      });
      
      setIsInitialized(true);
    }
  }, [isInitialized, requestNotificationPermission, toast]);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "", price: "", image_url: "", category: "", stock: 0, description: "",
    is_featured: false, is_latest: false, is_best_selling: false
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0
  });

  const [offerForm, setOfferForm] = useState({
    title: "", description: "", image_url: "", discount_percentage: 0, 
    min_order_amount: "", button_text: "অর্ডার করুন", button_link: "/products",
    is_popup: false, popup_delay: 3000, active: true, expiry: ""
  });

  // Dialog states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  // Fetch data
  const { data: orders = [] } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: promoCodes = [] } = useQuery<PromoCode[]>({ queryKey: ["/api/promo-codes"] });
  const { data: offers = [] } = useQuery<any[]>({ queryKey: ["/api/offers"] });

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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "সফল",
        description: "অর্ডার স্ট্যাটাস আপডেট হয়েছে",
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Offer mutations
  const createOfferMutation = useMutation({
    mutationFn: (offerData: any) => apiRequest("/api/offers", "POST", offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsOfferDialogOpen(false);
      resetOfferForm();
      toast({ title: "অফার সফলভাবে যোগ করা হয়েছে!" });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, ...offerData }: any) => apiRequest(`/api/offers/${id}`, "PATCH", offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsOfferDialogOpen(false);
      resetOfferForm();
      toast({ title: "অফার সফলভাবে আপডেট হয়েছে!" });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/offers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({ title: "অফার সফলভাবে ডিলিট হয়েছে!" });
    },
  });

  // Form reset functions
  const resetProductForm = () => {
    setProductForm({ 
      name: "", price: "", image_url: "", category: "", stock: 0, description: "",
      is_featured: false, is_latest: false, is_best_selling: false
    });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0 });
    setEditingCategory(null);
  };

  const resetOfferForm = () => {
    setOfferForm({
      title: "", description: "", image_url: "", discount_percentage: 0, 
      min_order_amount: "", button_text: "অর্ডার করুন", button_link: "/products",
      is_popup: false, popup_delay: 3000, active: true, expiry: ""
    });
    setEditingOffer(null);
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

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateOfferMutation.mutate({ id: editingOffer.id, ...offerForm });
    } else {
      createOfferMutation.mutate(offerForm);
    }
  };

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || "",
      description: offer.description || "",
      image_url: offer.image_url || "",
      discount_percentage: offer.discount_percentage || 0,
      min_order_amount: offer.min_order_amount || "",
      button_text: offer.button_text || "অর্ডার করুন",
      button_link: offer.button_link || "/products",
      is_popup: offer.is_popup || false,
      popup_delay: offer.popup_delay || 3000,
      active: offer.active !== false,
      expiry: offer.expiry ? new Date(offer.expiry).toISOString().slice(0, 16) : ""
    });
    setIsOfferDialogOpen(true);
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

  // Additional order states
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);


  return (
    <div className="container mx-auto p-6">
      {/* Notification Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">অ্যাডমিন প্যানেল</h1>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant={newOrdersCount > 0 ? "default" : "outline"}
              size="sm"
              className={`${newOrdersCount > 0 ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
              onClick={() => {
                if (!hasNotificationPermission) {
                  requestNotificationPermission();
                }
              }}
            >
              {newOrdersCount > 0 ? (
                <BellRing className="w-4 h-4 mr-2" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              নোটিফিকেশন
              {newOrdersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white text-red-500">
                  {newOrdersCount}
                </Badge>
              )}
            </Button>
            {newOrdersCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {newOrdersCount}
              </div>
            )}
          </div>
          
          {/* Notification Status */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${hasNotificationPermission ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-gray-600">
              {hasNotificationPermission ? 'নোটিফিকেশন সক্রিয়' : 'নোটিফিকেশন অনুমতি দিন'}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="relative">
            ড্যাশবোর্ড
            {activeTab === "dashboard" && newOrdersCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                {newOrdersCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="relative">
            অর্ডার
            {newOrdersCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                {newOrdersCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products">পণ্য</TabsTrigger>
          <TabsTrigger value="categories">ক্যাটাগরি</TabsTrigger>
          <TabsTrigger value="offers">অফার</TabsTrigger>
          <TabsTrigger value="promo-codes">প্রমো কোড</TabsTrigger>
          <TabsTrigger value="users">ব্যবহারকারী</TabsTrigger>
          <TabsTrigger value="analytics">অ্যানালিটিক্স</TabsTrigger>
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
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
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
                    <Label htmlFor="description">পণ্যের বিবরণ</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      placeholder="পণ্যের বিস্তারিত বিবরণ লিখুন"
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

                  {/* Feature Toggles */}
                  <div className="space-y-4 border-t pt-4">
                    <Label className="text-base font-semibold">হোমপেজে প্রদর্শন সেটিংস</Label>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_featured" className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>ফিচার্ড পণ্য</span>
                      </Label>
                      <Switch
                        id="is_featured"
                        checked={productForm.is_featured}
                        onCheckedChange={(checked) => setProductForm({...productForm, is_featured: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_latest" className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span>নতুন পণ্য</span>
                      </Label>
                      <Switch
                        id="is_latest"
                        checked={productForm.is_latest}
                        onCheckedChange={(checked) => setProductForm({...productForm, is_latest: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_best_selling" className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>বেস্ট সেলিং</span>
                      </Label>
                      <Switch
                        id="is_best_selling"
                        checked={productForm.is_best_selling}
                        onCheckedChange={(checked) => setProductForm({...productForm, is_best_selling: checked})}
                      />
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
                    <TableHead>ক্যাটাগরি</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead>ফিচার</TableHead>
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
                        <div className="flex flex-wrap gap-1">
                          {product.is_featured && <Badge className="bg-yellow-500 text-black text-xs">ফিচার্ড</Badge>}
                          {product.is_latest && <Badge className="bg-blue-500 text-xs">নতুন</Badge>}
                          {product.is_best_selling && <Badge className="bg-green-500 text-xs">বেস্ট</Badge>}
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
                        onChange={handleCategoryImageUpload}className="cursor-pointer"
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
                          src={category.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">অফার ম্যানেজমেন্ট</h3>
            <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingOffer(null); resetOfferForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন অফার যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingOffer ? "অফার সম্পাদনা" : "নতুন অফার যোগ করুন"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOfferSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="offer-title">অফারের শিরোনাম</Label>
                    <Input
                      id="offer-title"
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="offer-description">বিবরণ</Label>
                    <Textarea
                      id="offer-description"
                      value={offerForm.description}
                      onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">ছাড়ের পরিমাণ (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={offerForm.discount_percentage}
                      onChange={(e) => setOfferForm({...offerForm, discount_percentage: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-amount">সর্বনিম্ন অর্ডার পরিমাণ</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      value={offerForm.min_order_amount}
                      onChange={(e) => setOfferForm({...offerForm, min_order_amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="button-text">বাটনের টেক্সট</Label>
                    <Input
                      id="button-text"
                      value={offerForm.button_text}
                      onChange={(e) => setOfferForm({...offerForm, button_text: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="button-link">বাটনের লিংক</Label>
                    <Input
                      id="button-link"
                      value={offerForm.button_link}
                      onChange={(e) => setOfferForm({...offerForm, button_link: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry">মেয়াদ শেষ</Label>
                    <Input
                      id="expiry"
                      type="datetime-local"
                      value={offerForm.expiry}
                      onChange={(e) => setOfferForm({...offerForm, expiry: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-popup"
                      checked={offerForm.is_popup}
                      onCheckedChange={(checked) => setOfferForm({...offerForm, is_popup: checked})}
                    />
                    <Label htmlFor="is-popup">পপআপ অফার</Label>
                  </div>
                  {offerForm.is_popup && (
                    <div>
                      <Label htmlFor="popup-delay">পপআপ দেরি (মিলিসেকেন্ড)</Label>
                      <Input
                        id="popup-delay"
                        type="number"
                        min="1000"
                        value={offerForm.popup_delay}
                        onChange={(e) => setOfferForm({...offerForm, popup_delay: parseInt(e.target.value) || 3000})}
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="offer-active"
                      checked={offerForm.active}
                      onCheckedChange={(checked) => setOfferForm({...offerForm, active: checked})}
                    />
                    <Label htmlFor="offer-active">সক্রিয়</Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
                  >
                    {editingOffer ? "আপডেট করুন" : "অফার যোগ করুন"}
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
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>ছাড়</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>মেয়াদ</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.discount_percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={offer.is_popup ? "default" : "secondary"}>
                          {offer.is_popup ? "পপআপ" : "সাধারণ"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offer.active ? "secondary" : "destructive"}>
                          {offer.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {offer.expiry ? new Date(offer.expiry).toLocaleDateString('bn-BD') : "অসীম"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOffer(offer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteOfferMutation.mutate(offer.id)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analytics Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>অ্যানালিটিক্স সেটিংস</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ga-id">Google Analytics Measurement ID</Label>
                  <Input
                    id="ga-id"
                    placeholder="G-XXXXXXXXXX"
                    defaultValue={import.meta.env.VITE_GA_MEASUREMENT_ID || ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Google Analytics GA4 Measurement ID (উদাহরণ: G-XXXXXXXXXX)
                  </p>
                </div>
                <div>
                  <Label htmlFor="fb-pixel-id">Facebook Pixel ID</Label>
                  <Input
                    id="fb-pixel-id"
                    placeholder="123456789012345"
                    defaultValue={import.meta.env.VITE_FB_PIXEL_ID || ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Facebook Pixel ID (১৫ ডিজিটের সংখ্যা)
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">বর্তমান স্ট্যাটাস</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Google Analytics</span>
                      <Badge variant={import.meta.env.VITE_GA_MEASUREMENT_ID ? "secondary" : "destructive"}>
                        {import.meta.env.VITE_GA_MEASUREMENT_ID ? "সংযুক্ত" : "সংযুক্ত নয়"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Facebook Pixel</span>
                      <Badge variant={import.meta.env.VITE_FB_PIXEL_ID ? "secondary" : "destructive"}>
                        {import.meta.env.VITE_FB_PIXEL_ID ? "সংযুক্ত" : "সংযুক্ত নয়"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>নোট:</strong> Analytics IDs পরিবর্তনের জন্য Secrets tab ব্যবহার করুন।
                    VITE_GA_MEASUREMENT_ID এবং VITE_FB_PIXEL_ID যোগ করুন।
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Site Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>সাইট সেটিংস</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-name">সাইটের নাম</Label>
                  <Input
                    id="site-name"
                    defaultValue="Trynex Lifestyle"
                  />
                </div>
                <div>
                  <Label htmlFor="site-tagline">ট্যাগলাইন</Label>
                  <Input
                    id="site-tagline"
                    defaultValue="আপনার প্রিয় লাইফস্টাইল পার্টনার"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-number">হোয়াটসঅ্যাপ নম্বর</Label>
                  <Input
                    id="whatsapp-number"
                    defaultValue="+8801XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-charge">ডেলিভারি চার্জ (ঢাকার ভিতরে)</Label>
                  <Input
                    id="delivery-charge"
                    type="number"
                    defaultValue="60"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-charge-outside">ডেলিভারি চার্জ (ঢাকার বাইরে)</Label>
                  <Input
                    id="delivery-charge-outside"
                    type="number"
                    defaultValue="120"
                  />
                </div>
                <Button className="w-full">
                  সেটিংস সেভ করুন
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsAdmin />
        </TabsContent>
      </Tabs>
      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder} 
        isOpen={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)} 
      />
    </div>
  );
}
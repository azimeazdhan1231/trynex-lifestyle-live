import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { formatPrice, PRODUCT_CATEGORIES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, PlusCircle, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, RefreshCw, Search, Filter, Phone, MapPin, Clock,
  CheckCircle, XCircle, X, LogOut, Home, Package2, ShoppingBag, PieChart, UserCheck, 
  Smartphone, Mail, Shield, Save, Upload, Download, Database, Activity, AlertCircle
} from "lucide-react";

// Order status mapping
const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

// Enhanced Product Form Modal with Perfect Data Handling
function ProductFormModal({ 
  isOpen, 
  onClose, 
  product, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  product?: any; 
  onSave: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: 0,
      category: "",
      image_url: "",
      is_featured: false,
      is_latest: false,
      is_best_selling: false
    }
  });

  // Reset form when product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        console.log("Loading product for edit:", product);
        form.reset({
          name: product.name || "",
          description: product.description || "",
          price: String(product.price || ""),
          stock: Number(product.stock || 0),
          category: product.category || "",
          image_url: product.image_url || "",
          is_featured: Boolean(product.is_featured),
          is_latest: Boolean(product.is_latest),
          is_best_selling: Boolean(product.is_best_selling)
        });
      } else {
        // Default template for new products
        const defaultDescription = `পণ্যের বিবরণ:
এই পণ্যটি একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে।

ডেলিভারি তথ্য:
• ঢাকায় ডেলিভারি চার্জ: ৮০ টাকা
• ঢাকার বাইরে: ১২০ টাকা
• ডেলিভারি সময়: ২-৩ কার্যদিবস`;

        form.reset({
          name: "",
          description: defaultDescription,
          price: "",
          stock: 0,
          category: "",
          image_url: "",
          is_featured: false,
          is_latest: false,
          is_best_selling: false
        });
      }
    }
  }, [isOpen, product, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!data.name?.trim()) {
        toast({ title: "ত্রুটি", description: "পণ্যের নাম প্রয়োজন", variant: "destructive" });
        return;
      }
      if (!data.category?.trim()) {
        toast({ title: "ত্রুটি", description: "ক্যাটেগরি নির্বাচন করুন", variant: "destructive" });
        return;
      }
      if (!data.price || parseFloat(data.price) < 0) {
        toast({ title: "ত্রুটি", description: "সঠিক দাম দিন", variant: "destructive" });
        return;
      }

      // Prepare product data with proper type conversion
      const productData = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        price: String(data.price), // Keep price as string for database
        stock: parseInt(String(data.stock)) || 0, // Ensure stock is number
        category: data.category.trim(),
        image_url: data.image_url?.trim() || "",
        is_featured: Boolean(data.is_featured),
        is_latest: Boolean(data.is_latest),
        is_best_selling: Boolean(data.is_best_selling)
      };

      console.log("Submitting product data:", productData);

      if (product?.id) {
        await apiRequest("PUT", `/api/products/${product.id}`, productData);
        toast({ title: "পণ্য আপডেট সফল", description: "পণ্যের তথ্য সফলভাবে আপডেট হয়েছে।" });
      } else {
        await apiRequest("POST", "/api/products", productData);
        toast({ title: "পণ্য যোগ সফল", description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে।" });
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      onSave();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({ 
        title: "ত্রুটি", 
        description: `পণ্য সেভ করতে সমস্যা হয়েছে: ${error.message || 'অজানা ত্রুটি'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            পণ্যের বিস্তারিত তথ্য দিন। সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">পণ্যের নাম *</Label>
              <Input
                id="name"
                {...form.register("name", { required: "পণ্যের নাম প্রয়োজন" })}
                placeholder="পণ্যের নাম লিখুন"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">ক্যাটেগরি *</Label>
              <Select 
                value={form.watch("category")} 
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">পণ্যের বিবরণ</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={6}
              placeholder="পণ্যের বিস্তারিত বিবরণ ও ডেলিভারি তথ্য লিখুন..."
              className="min-h-[150px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">দাম (টাকা) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("price", { 
                  required: "দাম প্রয়োজন",
                  min: { value: 0, message: "দাম ০ বা তার বেশি হতে হবে" }
                })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">স্টক *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...form.register("stock", { 
                  required: "স্টক সংখ্যা প্রয়োজন",
                  min: { value: 0, message: "স্টক ০ বা তার বেশি হতে হবে" }
                })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">ইমেজ URL</Label>
            <Input
              id="image_url"
              {...form.register("image_url")}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={form.watch("is_featured")}
                onCheckedChange={(checked) => form.setValue("is_featured", checked)}
              />
              <Label htmlFor="is_featured">ফিচার্ড পণ্য</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_latest"
                checked={form.watch("is_latest")}
                onCheckedChange={(checked) => form.setValue("is_latest", checked)}
              />
              <Label htmlFor="is_latest">নতুন পণ্য</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_best_selling"
                checked={form.watch("is_best_selling")}
                onCheckedChange={(checked) => form.setValue("is_best_selling", checked)}
              />
              <Label htmlFor="is_best_selling">বেস্ট সেলার</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              বাতিল
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "সেভ হচ্ছে..." : product ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Order Details Modal with Enhanced Features
function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order, 
  onStatusUpdate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  order: any; 
  onStatusUpdate: () => void; 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: string) => {
    if (!order?.id) return;

    try {
      setIsUpdating(true);
      await apiRequest("PATCH", `/api/orders/${order.id}/status`, { status: newStatus });
      toast({ title: "স্ট্যাটাস আপডেট সফল", description: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে।" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onStatusUpdate();
    } catch (error: any) {
      toast({ 
        title: "ত্রুটি", 
        description: `স্ট্যাটাস আপডেট করতে সমস্যা: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  // Parse order items safely
  const orderItems = (() => {
    try {
      if (Array.isArray(order.items)) return order.items;
      if (typeof order.items === 'string') return JSON.parse(order.items);
      return [];
    } catch {
      return [];
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>অর্ডার বিস্তারিত - #{order.id?.slice(0, 8)}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার স্ট্যাটাস আপডেট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ORDER_STATUSES).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={order.status === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOrderStatus(key)}
                    disabled={isUpdating}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>গ্রাহক তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>নাম</Label>
                  <p className="font-medium">{order.customer_name || "N/A"}</p>
                </div>
                <div>
                  <Label>ফোন</Label>
                  <p className="font-medium">{order.phone || "N/A"}</p>
                </div>
                <div>
                  <Label>জেলা</Label>
                  <p className="font-medium">{order.district || "N/A"}</p>
                </div>
                <div>
                  <Label>থানা</Label>
                  <p className="font-medium">{order.thana || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>ঠিকানা</Label>
                  <p className="font-medium">{order.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার আইটেম</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderItems.length > 0 ? orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">পরিমাণ: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-500">কোন আইটেম পাওয়া যায়নি</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>পেমেন্ট তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>{formatPrice((parseFloat(order.total) || 0) - 60)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>{formatPrice(60)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>মোট:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            বন্ধ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Panel Component
export default function AdminPanelBulletproof() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data with optimized queries
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({ 
    queryKey: ["/api/orders"],
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({ 
    queryKey: ["/api/products"],
    staleTime: 60000,
    refetchInterval: 300000,
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({ title: "পণ্য মুছে ফেলা হয়েছে", description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে।" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteProductId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "ত্রুটি", 
        description: `পণ্য মুছতে সমস্যা হয়েছে: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Calculate dashboard stats
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

    const pendingOrders = orderArray.filter((order: any) => order.status === 'pending').length;
    const lowStockProducts = productArray.filter((product: any) => (product.stock || 0) < 10).length;
    const outOfStockProducts = productArray.filter((product: any) => (product.stock || 0) === 0).length;

    return {
      totalOrders,
      totalRevenue,
      todayOrders,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: productArray.length
    };
  }, [orders, products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product: any) => {
      const matchesSearch = !searchQuery || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Event handlers
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteProductId(productId);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    window.location.reload();
  };

  if (ordersLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Trynex Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Live Database Connected
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                লগআউট
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              পণ্য
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              অর্ডার
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              বিশ্লেষণ
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">সর্বমোট অর্ডার</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">আজকের অর্ডার</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayOrders}</div>
                  <p className="text-xs text-muted-foreground">আজকের নতুন অর্ডার</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">স্টকে রয়েছে</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>দ্রুত অ্যাকশন</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleAddProduct} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      নতুন পণ্য
                    </Button>
                    <Button variant="outline" onClick={() => refetchOrders()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      রিফ্রেশ
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => refetchProducts()}>
                      <Package className="h-4 w-4 mr-2" />
                      পণ্য রিফ্রেশ
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("orders")}>
                      <Eye className="h-4 w-4 mr-2" />
                      অর্ডার দেখুন
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>স্টক সতর্কতা</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">কম স্টক (১০ এর কম)</span>
                      </div>
                      <Badge variant="secondary">{stats.lowStockProducts}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">স্টক নেই</span>
                      </div>
                      <Badge variant="destructive">{stats.outOfStockProducts}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">পণ্য ব্যবস্থাপনা</h2>
                <p className="text-muted-foreground">সব পণ্য দেখুন ও পরিচালনা করুন</p>
              </div>
              <Button onClick={handleAddProduct} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                নতুন পণ্য যোগ করুন
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="ক্যাটেগরি ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  {PRODUCT_CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>পণ্য</TableHead>
                        <TableHead>ক্যাটেগরি</TableHead>
                        <TableHead>দাম</TableHead>
                        <TableHead>স্টক</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            কোন পণ্য খুঁজে পাওয়া যায়নি
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {product.image_url && (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {product.id?.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{product.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(product.price)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                              >
                                {product.stock} পিস
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {product.is_featured && <Badge variant="outline">ফিচার্ড</Badge>}
                                {product.is_latest && <Badge variant="outline">নতুন</Badge>}
                                {product.is_best_selling && <Badge variant="outline">বেস্ট সেলার</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">অর্ডার ব্যবস্থাপনা</h2>
                <p className="text-muted-foreground">সব অর্ডার দেখুন ও পরিচালনা করুন</p>
              </div>
              <Button onClick={() => refetchOrders()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                রিফ্রেশ
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>অর্ডার ID</TableHead>
                        <TableHead>গ্রাহক</TableHead>
                        <TableHead>মোট</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>তারিখ</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(orders) && orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">
                            #{order.id?.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{order.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                order.status === 'delivered' ? 'default' :
                                order.status === 'processing' ? 'secondary' :
                                order.status === 'shipped' ? 'outline' :
                                'destructive'
                              }
                            >
                              {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>বিশ্লেষণ ও রিপোর্ট</CardTitle>
                <CardDescription>শীঘ্রই আসছে</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">বিস্তারিত বিশ্লেষণ ও রিপোর্ট শীঘ্রই উপলব্ধ হবে</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={() => {
          setSelectedProduct(null);
        }}
      />

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onStatusUpdate={() => {
          refetchOrders();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>পণ্য মুছে ফেলুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
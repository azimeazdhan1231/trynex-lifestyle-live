import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  BarChart3, ShoppingCart, Package, Users, TrendingUp, Plus, Edit2, Trash2, 
  Eye, CheckCircle, Clock, AlertCircle, DollarSign, Star, Settings, Search, 
  Filter, Download, Upload, RefreshCw, Bell, Mail, Phone, MapPin, Calendar,
  Target, Zap, Award, Activity, PieChart, LineChart, FileText, Image,
  Shield, Globe, CreditCard, Truck, Gift, Tag, Percent, Megaphone,
  Database, RotateCcw, Save, X, Check, Home, LogOut, Menu, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Form validation schemas
const productSchema = z.object({
  name: z.string().min(1, 'পণ্যের নাম প্রয়োজন'),
  price: z.string().min(1, 'দাম প্রয়োজন'),
  category: z.string().min(1, 'ক্যাটেগরি প্রয়োজন'),
  stock: z.number().min(0, 'স্টক ০ বা তার বেশি হতে হবে'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_latest: z.boolean().default(false),
  is_best_selling: z.boolean().default(false),
});

const categorySchema = z.object({
  name: z.string().min(1, 'ইংরেজি নাম প্রয়োজন'),
  name_bengali: z.string().min(1, 'বাংলা নাম প্রয়োজন'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

const offerSchema = z.object({
  title: z.string().min(1, 'অফারের শিরোনাম প্রয়োজন'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  discount_amount: z.string().optional(),
  min_purchase_amount: z.string().optional(),
  max_discount_amount: z.string().optional(),
  button_text: z.string().default('অর্ডার করুন'),
  button_link: z.string().default('/products'),
  is_popup: z.boolean().default(false),
  popup_delay: z.number().default(3000),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  terms_conditions: z.string().optional(),
  active: z.boolean().default(true),
});

const promoCodeSchema = z.object({
  code: z.string().min(1, 'প্রোমো কোড প্রয়োজন'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.string().min(1, 'ছাড়ের পরিমাণ প্রয়োজন'),
  min_purchase_amount: z.string().optional(),
  max_discount_amount: z.string().optional(),
  usage_limit: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type OfferFormData = z.infer<typeof offerSchema>;
type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

export default function FullyFunctionalAdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [editingPromoCode, setEditingPromoCode] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication check
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/admin';
    return null;
  }

  const authHeaders = { 
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Data fetching queries
  const { data: stats = {}, isLoading: statsLoading, refetch: refetchStats } = useQuery<any>({
    queryKey: ['/api/admin/stats'],
    meta: authHeaders,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<any[]>({
    queryKey: ['/api/admin/products'],
    meta: authHeaders,
  });

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery<any[]>({
    queryKey: ['/api/admin/orders'],
    meta: authHeaders,
    refetchInterval: 30000,
  });

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useQuery<any[]>({
    queryKey: ['/api/admin/categories'],
    meta: authHeaders,
  });

  const { data: offers = [], isLoading: offersLoading, refetch: refetchOffers } = useQuery<any[]>({
    queryKey: ['/api/admin/offers'],
    meta: authHeaders,
  });

  const { data: promoCodes = [], isLoading: promoCodesLoading, refetch: refetchPromoCodes } = useQuery<any[]>({
    queryKey: ['/api/admin/promo-codes'],
    meta: authHeaders,
  });

  const { data: customers = [], isLoading: customersLoading, refetch: refetchCustomers } = useQuery<any[]>({
    queryKey: ['/api/admin/customers'],
    meta: authHeaders,
  });

  // Mutation hooks for CRUD operations
  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => apiRequest('/api/admin/products', {
      method: 'POST',
      headers: authHeaders.headers,
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: 'সফল', description: 'পণ্য সফলভাবে তৈরি হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsProductModalOpen(false);
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'পণ্য তৈরি করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => 
      apiRequest(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: authHeaders.headers,
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: 'সফল', description: 'পণ্য সফলভাবে আপডেট হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'পণ্য আপডেট করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders.headers,
      }),
    onSuccess: () => {
      toast({ title: 'সফল', description: 'পণ্য সফলভাবে ডিলিট হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'পণ্য ডিলিট করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: authHeaders.headers,
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast({ title: 'সফল', description: 'অর্ডার স্ট্যাটাস আপডেট হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  // Utility functions
  const formatCurrency = (amount: string | number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Activity;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  // Filter functions
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter((order: any) =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm) ||
    order.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.thana?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Product form
  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      category: '',
      stock: 0,
      description: '',
      image_url: '',
      is_featured: false,
      is_latest: false,
      is_best_selling: false,
    },
  });

  const onProductSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      productForm.reset({
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        description: product.description || '',
        image_url: product.image_url || '',
        is_featured: product.is_featured,
        is_latest: product.is_latest,
        is_best_selling: product.is_best_selling,
      });
    } else {
      setEditingProduct(null);
      productForm.reset();
    }
    setIsProductModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
  };

  const refreshAllData = () => {
    refetchStats();
    refetchProducts();
    refetchOrders();
    refetchCategories();
    refetchOffers();
    refetchPromoCodes();
    refetchCustomers();
    toast({ title: 'তথ্য রিফ্রেশ', description: 'সমস্ত তথ্য আপডেট করা হয়েছে' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">অ্যাডমিন প্যানেল</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAllData}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">TryneX অ্যাডমিন প্যানেল</h1>
              <p className="text-blue-200">সম্পূর্ণ ই-কমার্স ব্যবস্থাপনা</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={refreshAllData}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              রিফ্রেশ
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-400/20 text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-xs mb-1">মোট রেভিনিউ</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue || 0)}</p>
                    <p className="text-green-300 text-xs">+{stats.revenueGrowth || '0'}%</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-xs mb-1">মোট অর্ডার</p>
                    <p className="text-xl font-bold text-white">{stats.totalOrders || 0}</p>
                    <p className="text-blue-300 text-xs">{stats.newOrdersThisWeek || 0} নতুন</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-xs mb-1">মোট পণ্য</p>
                    <p className="text-xl font-bold text-white">{stats.totalProducts || 0}</p>
                    <p className="text-red-300 text-xs">{stats.lowStockProducts || 0} কম স্টক</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-xs mb-1">কাস্টমার</p>
                    <p className="text-xl font-bold text-white">{stats.totalCustomers || 0}</p>
                    <p className="text-orange-300 text-xs">রেজিস্টার্ড</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-xs mb-1">পেন্ডিং</p>
                    <p className="text-xl font-bold text-white">{stats.pendingOrders || 0}</p>
                    <p className="text-yellow-300 text-xs">অর্ডার</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-200 text-xs mb-1">সক্রিয় অফার</p>
                    <p className="text-xl font-bold text-white">{stats.activeOffers || 0}</p>
                    <p className="text-pink-300 text-xs">{stats.activePromoCodes || 0} প্রোমো</p>
                  </div>
                  <Gift className="h-8 w-8 text-pink-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20">
              <BarChart3 className="h-4 w-4 mr-1" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="products" className="text-white data-[state=active]:bg-white/20">
              <Package className="h-4 w-4 mr-1" />
              পণ্য
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-white/20">
              <ShoppingCart className="h-4 w-4 mr-1" />
              অর্ডার
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-white data-[state=active]:bg-white/20">
              <Tag className="h-4 w-4 mr-1" />
              ক্যাটেগরি
            </TabsTrigger>
            <TabsTrigger value="offers" className="text-white data-[state=active]:bg-white/20">
              <Megaphone className="h-4 w-4 mr-1" />
              অফার
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="text-white data-[state=active]:bg-white/20">
              <Percent className="h-4 w-4 mr-1" />
              প্রোমো
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-white data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-1" />
              কাস্টমার
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-1" />
              সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Analytics Chart */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    রেভিনিউ বিশ্লেষণ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">সাপ্তাহিক রেভিনিউ</span>
                      <span className="text-green-300 font-bold">{stats && formatCurrency(stats.weeklyRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">গড় অর্ডার মূল্য</span>
                      <span className="text-blue-300 font-bold">{stats && formatCurrency(stats.averageOrderValue || 0)}</span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="text-sm text-gray-300">
                      রেভিনিউ বৃদ্ধি: <span className="text-green-300">+{stats?.revenueGrowth || '0'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Breakdown */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    অর্ডার স্ট্যাটাস ভাঙ্গন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellow-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-300">{stats?.pendingOrders || 0}</p>
                      <p className="text-yellow-200 text-sm">পেন্ডিং</p>
                    </div>
                    <div className="text-center p-3 bg-blue-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-300">{stats?.processingOrders || 0}</p>
                      <p className="text-blue-200 text-sm">প্রসেসিং</p>
                    </div>
                    <div className="text-center p-3 bg-purple-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-purple-300">{stats?.shippedOrders || 0}</p>
                      <p className="text-purple-200 text-sm">শিপড</p>
                    </div>
                    <div className="text-center p-3 bg-green-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-300">{stats?.completedOrders || 0}</p>
                      <p className="text-green-200 text-sm">সম্পন্ন</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    সাম্প্রতিক অর্ডার
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {stats?.recentOrders?.slice(0, 8).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{order.customer_name}</p>
                            <p className="text-blue-200 text-sm">{order.tracking_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-300 font-bold">{formatCurrency(order.total)}</p>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      )) || <p className="text-gray-400 text-center py-4">কোনো সাম্প্রতিক অর্ডার নেই</p>}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    জনপ্রিয় ক্যাটেগরি
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.topCategories?.map((category: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600/20 text-blue-300">#{index + 1}</Badge>
                          <span className="text-white">{category.name}</span>
                        </div>
                        <span className="text-green-300 font-bold">{category.count} অর্ডার</span>
                      </div>
                    )) || <p className="text-gray-400 text-center py-4">কোনো তথ্য পাওয়া যায়নি</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  পণ্য ব্যবস্থাপনা ({filteredProducts.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => openProductModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন পণ্য
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Controls */}
                <div className="mb-6 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="পণ্যের নাম, ক্যাটেগরি অথবা ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => refetchProducts()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    রিফ্রেশ
                  </Button>
                </div>
                
                {/* Products Grid */}
                {productsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-48"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product: any) => (
                      <Card key={product.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Product Image */}
                            {product.image_url && (
                              <div className="aspect-video rounded-lg bg-gray-800 overflow-hidden">
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Product Info */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-medium truncate">{product.name}</h3>
                                <p className="text-blue-200 text-sm">{product.category}</p>
                                <p className="text-green-300 font-bold mt-1">{formatCurrency(product.price)}</p>
                              </div>
                            </div>
                            
                            {/* Product Badges */}
                            <div className="flex flex-wrap gap-1">
                              {product.is_featured && (
                                <Badge className="bg-yellow-600/20 text-yellow-300 text-xs">ফিচার্ড</Badge>
                              )}
                              {product.is_latest && (
                                <Badge className="bg-green-600/20 text-green-300 text-xs">নতুন</Badge>
                              )}
                              {product.is_best_selling && (
                                <Badge className="bg-blue-600/20 text-blue-300 text-xs">বেস্ট সেলিং</Badge>
                              )}
                              <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'} className="text-xs">
                                স্টক: {product.stock}
                              </Badge>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProductModal(product)}
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                এডিট
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                className="border-red-400/20 text-red-300 hover:bg-red-500/10"
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredProducts.length === 0 && !productsLoading && (
                      <div className="col-span-full text-center py-8">
                        <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">কোনো পণ্য পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  অর্ডার ব্যবস্থাপনা ({filteredOrders.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => refetchOrders()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    রিফ্রেশ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Controls */}
                <div className="mb-6 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="কাস্টমার নাম, ট্র্যাকিং ID, ফোন নম্বর..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Orders Table/Cards */}
                <div className="space-y-4">
                  {ordersLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-20"></div>
                    ))
                  ) : (
                    filteredOrders.map((order: any) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <Card key={order.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <StatusIcon className="h-5 w-5 text-blue-300" />
                                  <h3 className="text-white font-medium">{order.customer_name}</h3>
                                  <Badge variant={getStatusBadgeVariant(order.status)}>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">ট্র্যাকিং: </span>
                                    <span className="text-blue-300">{order.tracking_id}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">ফোন: </span>
                                    <span className="text-white">{order.phone}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">ঠিকানা: </span>
                                    <span className="text-white">{order.district}, {order.thana}</span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-gray-400">মোট: </span>
                                  <span className="text-green-300 font-bold">{formatCurrency(order.total)}</span>
                                  <span className="text-gray-400 ml-4">তারিখ: </span>
                                  <span className="text-gray-300">{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Select 
                                  value={order.status} 
                                  onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                                >
                                  <SelectTrigger className="w-full sm:w-[140px] bg-white/10 border-white/20 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">পেন্ডিং</SelectItem>
                                    <SelectItem value="processing">প্রসেসিং</SelectItem>
                                    <SelectItem value="shipped">শিপড</SelectItem>
                                    <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
                                    <SelectItem value="completed">সম্পন্ন</SelectItem>
                                    <SelectItem value="cancelled">ক্যান্সেল</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  বিস্তারিত
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                  {filteredOrders.length === 0 && !ordersLoading && (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">কোনো অর্ডার পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  ক্যাটেগরি ব্যবস্থাপনা ({categories.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন ক্যাটেগরি
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesLoading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-32"></div>
                    ))
                  ) : (
                    categories.map((category: any) => (
                      <Card key={category.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-medium">{category.name}</h3>
                                <p className="text-blue-200 text-sm">{category.name_bengali}</p>
                                {category.description && (
                                  <p className="text-gray-400 text-xs mt-1">{category.description}</p>
                                )}
                              </div>
                              <Badge variant={category.is_active ? 'default' : 'secondary'} className="text-xs">
                                {category.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                এডিট
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-400/20 text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  {categories.length === 0 && !categoriesLoading && (
                    <div className="col-span-full text-center py-8">
                      <Tag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">কোনো ক্যাটেগরি পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">অফার ব্যবস্থাপনা</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">অফার ব্যবস্থাপনা ফিচার শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promo-codes" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">প্রোমো কোড ব্যবস্থাপনা</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">প্রোমো কোড ব্যবস্থাপনা ফিচার শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">কাস্টমার ব্যবস্থাপনা</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">কাস্টমার ব্যবস্থাপনা ফিচার শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">সাইট সেটিংস</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">সাইট সেটিংস ফিচার শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'পণ্য আপডেট করুন' : 'নতুন পণ্য যোগ করুন'}
            </DialogTitle>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পণ্যের নাম</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>দাম (৳)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="bg-slate-700 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্যাটেগরি</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>স্টক</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          className="bg-slate-700 border-slate-600"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={productForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ছবির URL</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-slate-700 border-slate-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিবরণ</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-slate-700 border-slate-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={productForm.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>ফিচার্ড</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="is_latest"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>নতুন</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="is_best_selling"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>বেস্ট সেলিং</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsProductModalOpen(false)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingProduct ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
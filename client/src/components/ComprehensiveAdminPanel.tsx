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
import { 
  BarChart3, ShoppingCart, Package, Users, TrendingUp, Plus, Edit2, Trash2, 
  Eye, CheckCircle, Clock, AlertCircle, DollarSign, Star, Settings, Search, 
  Filter, Download, Upload, RefreshCw, Bell, Mail, Phone, MapPin, Calendar,
  Target, Zap, Award, Activity, PieChart, LineChart, FileText, Image,
  Shield, Globe, CreditCard, Truck, Gift, Tag, Percent, Megaphone,
  Database, RotateCcw, Save, X, Check, Home, LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Enhanced interfaces for comprehensive data management
interface ComprehensiveAdminStats {
  // Basic counts
  totalProducts: number;
  totalOrders: number;
  totalCustomOrders: number;
  totalCategories: number;
  totalPromoCodes: number;
  totalCustomers: number;
  
  // Order status breakdown
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  // Revenue analytics
  totalRevenue: number;
  weeklyRevenue: number;
  averageOrderValue: number;
  
  // Growth metrics
  newOrdersThisWeek: number;
  revenueGrowth: string;
  
  // Product insights
  featuredProducts: number;
  latestProducts: number;
  bestSellingProducts: number;
  lowStockProducts: number;
  
  // Active promotions
  activeOffers: number;
  activePromoCodes: number;
  
  // Category popularity
  topCategories: Array<{ name: string; count: number }>;
  
  // Recent activity
  recentOrders: Array<any>;
  recentCustomOrders: Array<any>;
}

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  is_featured: boolean;
  is_latest: boolean;
  is_best_selling: boolean;
  image_url?: string;
  description?: string;
  created_at: string;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  district: string;
  thana: string;
  address?: string;
  phone: string;
  total: string;
  status: string;
  created_at: string;
  items: any;
  custom_instructions?: string;
}

interface Category {
  id: string;
  name: string;
  name_bengali: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Offer {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  discount_percentage?: number;
  discount_amount?: string;
  min_purchase_amount?: string;
  max_discount_amount?: string;
  button_text?: string;
  button_link?: string;
  is_popup: boolean;
  popup_delay?: number;
  start_date?: string;
  end_date?: string;
  terms_conditions?: string;
  active: boolean;
  created_at: string;
}

interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discount_type: string; // 'percentage' or 'fixed'
  discount_value: string;
  min_purchase_amount?: string;
  max_discount_amount?: string;
  usage_limit?: number;
  usage_count: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

interface Customer {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  address: string;
  email?: string;
  createdAt: string;
}

interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  updated_at: string;
}

export default function ComprehensiveAdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Modal states for different entities
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Current editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication check
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/admin';
    return null;
  }

  // Headers for authenticated requests
  const authHeaders = { 
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Data fetching queries
  const { data: stats, isLoading: statsLoading } = useQuery<ComprehensiveAdminStats>({
    queryKey: ['/api/admin/stats'],
    meta: authHeaders
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
    meta: authHeaders
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    meta: authHeaders
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    meta: authHeaders
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ['/api/admin/offers'],
    meta: authHeaders
  });

  const { data: promoCodes = [], isLoading: promoCodesLoading } = useQuery<PromoCode[]>({
    queryKey: ['/api/admin/promo-codes'],
    meta: authHeaders
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
    meta: authHeaders
  });

  const { data: settings = [], isLoading: settingsLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/admin/site-settings'],
    meta: authHeaders
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
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm)
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_bengali.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPromoCodes = promoCodes.filter(promo =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" data-testid="admin-panel">
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2" data-testid="admin-title">
              🏆 প্রিমিয়াম অ্যাডমিন প্যানেল
            </h1>
            <p className="text-blue-200 text-lg">সর্বাধুনিক ব্যবসা পরিচালনা সিস্টেম</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-home"
            >
              <Home className="h-4 w-4 mr-2" />
              ওয়েবসাইট দেখুন
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards with Real-time Data */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20" data-testid="stats-revenue">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-xs mb-1">মোট রেভিনিউ</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-green-300 text-xs">+{stats.revenueGrowth}% এই সপ্তাহে</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20" data-testid="stats-orders">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-xs mb-1">মোট অর্ডার</p>
                    <p className="text-xl font-bold text-white">{stats.totalOrders}</p>
                    <p className="text-blue-300 text-xs">{stats.newOrdersThisWeek} নতুন</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20" data-testid="stats-products">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-xs mb-1">মোট পণ্য</p>
                    <p className="text-xl font-bold text-white">{stats.totalProducts}</p>
                    <p className="text-red-300 text-xs">{stats.lowStockProducts} কম স্টক</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20" data-testid="stats-customers">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-xs mb-1">কাস্টমার</p>
                    <p className="text-xl font-bold text-white">{stats.totalCustomers}</p>
                    <p className="text-orange-300 text-xs">রেজিস্টার্ড</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20" data-testid="stats-pending">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-xs mb-1">পেন্ডিং</p>
                    <p className="text-xl font-bold text-white">{stats.pendingOrders}</p>
                    <p className="text-yellow-300 text-xs">অর্ডার</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20" data-testid="stats-promo">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-200 text-xs mb-1">সক্রিয় অফার</p>
                    <p className="text-xl font-bold text-white">{stats.activeOffers}</p>
                    <p className="text-pink-300 text-xs">{stats.activePromoCodes} প্রোমো</p>
                  </div>
                  <Gift className="h-8 w-8 text-pink-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/10 backdrop-blur-sm" data-testid="admin-tabs">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 mr-1" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="products" className="text-white data-[state=active]:bg-white/20" data-testid="tab-products">
              <Package className="h-4 w-4 mr-1" />
              পণ্য
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-white/20" data-testid="tab-orders">
              <ShoppingCart className="h-4 w-4 mr-1" />
              অর্ডার
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-white data-[state=active]:bg-white/20" data-testid="tab-categories">
              <Tag className="h-4 w-4 mr-1" />
              ক্যাটেগরি
            </TabsTrigger>
            <TabsTrigger value="offers" className="text-white data-[state=active]:bg-white/20" data-testid="tab-offers">
              <Megaphone className="h-4 w-4 mr-1" />
              অফার
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="text-white data-[state=active]:bg-white/20" data-testid="tab-promo-codes">
              <Percent className="h-4 w-4 mr-1" />
              প্রোমো
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-white data-[state=active]:bg-white/20" data-testid="tab-customers">
              <Users className="h-4 w-4 mr-1" />
              কাস্টমার
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-white/20" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-1" />
              সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Enhanced Analytics */}
          <TabsContent value="dashboard" className="space-y-6" data-testid="dashboard-content">
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
                      <span className="text-green-300 font-bold">{stats && formatCurrency(stats.weeklyRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">গড় অর্ডার মূল্য</span>
                      <span className="text-blue-300 font-bold">{stats && formatCurrency(stats.averageOrderValue)}</span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="text-sm text-gray-300">
                      রেভিনিউ বৃদ্ধি: <span className="text-green-300">+{stats?.revenueGrowth}%</span>
                    </div>
                  </div>
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
                    {stats?.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600/20 text-blue-300">#{index + 1}</Badge>
                          <span className="text-white">{category.name}</span>
                        </div>
                        <span className="text-green-300 font-bold">{category.count} অর্ডার</span>
                      </div>
                    ))}
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
                      {stats?.recentOrders.slice(0, 8).map((order) => (
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
                      ))}
                    </div>
                  </ScrollArea>
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
                      <p className="text-2xl font-bold text-yellow-300">{stats?.pendingOrders}</p>
                      <p className="text-yellow-200 text-sm">পেন্ডিং</p>
                    </div>
                    <div className="text-center p-3 bg-blue-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-300">{stats?.processingOrders}</p>
                      <p className="text-blue-200 text-sm">প্রসেসিং</p>
                    </div>
                    <div className="text-center p-3 bg-purple-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-purple-300">{stats?.shippedOrders}</p>
                      <p className="text-purple-200 text-sm">শিপড</p>
                    </div>
                    <div className="text-center p-3 bg-green-600/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-300">{stats?.completedOrders}</p>
                      <p className="text-green-200 text-sm">সম্পন্ন</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab - Enhanced Product Management */}
          <TabsContent value="products" className="space-y-6" data-testid="products-content">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  পণ্য ব্যবস্থাপনা ({filteredProducts.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-add-product"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন পণ্য
                  </Button>
                  {selectedItems.length > 0 && (
                    <Button 
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      data-testid="button-bulk-update"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      বাল্ক আপডেট ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="mb-6 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="পণ্যের নাম, ক্যাটেগরি অথবা ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      data-testid="input-search-products"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    data-testid="button-filter"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    ফিল্টার
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    data-testid="button-export"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    এক্সপোর্ট
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
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all" data-testid={`product-card-${product.id}`}>
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
                              {product.stock < 10 && (
                                <Badge className="bg-red-600/20 text-red-300 text-xs">কম স্টক</Badge>
                              )}
                            </div>
                            
                            {/* Product Stats */}
                            <div className="flex justify-between text-sm text-gray-300">
                              <span>স্টক: {product.stock}</span>
                              <span>{formatDate(product.created_at)}</span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsProductModalOpen(true);
                                }}
                                className="flex-1 text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                                data-testid={`button-edit-product-${product.id}`}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                এডিট
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 text-green-300 hover:text-green-100 hover:bg-green-900/20"
                                data-testid={`button-view-product-${product.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                দেখুন
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-300 hover:text-red-100 hover:bg-red-900/20"
                                data-testid={`button-delete-product-${product.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab - Comprehensive Order Management */}
          <TabsContent value="orders" className="space-y-6" data-testid="orders-content">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  অর্ডার ম্যানেজমেন্ট ({filteredOrders.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব অর্ডার</SelectItem>
                      <SelectItem value="pending">পেন্ডিং</SelectItem>
                      <SelectItem value="processing">প্রসেসিং</SelectItem>
                      <SelectItem value="shipped">শিপড</SelectItem>
                      <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
                      <SelectItem value="completed">সম্পন্ন</SelectItem>
                      <SelectItem value="cancelled">বাতিল</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedItems.length > 0 && (
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Edit2 className="h-4 w-4 mr-2" />
                      বাল্ক স্ট্যাটাস আপডেট ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="কাস্টমার নাম, ট্র্যাকিং ID, ফোন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    এক্সপোর্ট
                  </Button>
                </div>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredOrders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        return (
                          <Card key={order.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                {/* Order Info */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1">
                                      <StatusIcon className="h-3 w-3" />
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <p className="text-white font-medium">{order.customer_name}</p>
                                  <p className="text-blue-200 text-sm font-mono">{order.tracking_id}</p>
                                  <p className="text-gray-300 text-sm">{order.phone}</p>
                                </div>

                                {/* Address Info */}
                                <div className="space-y-1">
                                  <p className="text-blue-200 text-sm font-medium">ঠিকানা</p>
                                  <p className="text-white text-sm">{order.district}, {order.thana}</p>
                                  {order.address && (
                                    <p className="text-gray-300 text-xs">{order.address}</p>
                                  )}
                                </div>

                                {/* Order Details */}
                                <div className="space-y-1">
                                  <p className="text-green-300 text-lg font-bold">{formatCurrency(order.total)}</p>
                                  <p className="text-gray-300 text-sm">{formatDate(order.created_at)}</p>
                                  {order.custom_instructions && (
                                    <Badge className="bg-purple-600/20 text-purple-300 text-xs">কাস্টম নির্দেশনা</Badge>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingOrder(order);
                                      setIsOrderModalOpen(true);
                                    }}
                                    className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    বিস্তারিত
                                  </Button>
                                  <Select>
                                    <SelectTrigger className="w-32 h-8 bg-white/10 border-white/20 text-white text-xs">
                                      <SelectValue placeholder="স্ট্যাটাস" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">পেন্ডিং</SelectItem>
                                      <SelectItem value="processing">প্রসেসিং</SelectItem>
                                      <SelectItem value="shipped">শিপড</SelectItem>
                                      <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
                                      <SelectItem value="completed">সম্পন্ন</SelectItem>
                                      <SelectItem value="cancelled">বাতিল</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6" data-testid="categories-content">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  ক্যাটেগরি ম্যানেজমেন্ট ({filteredCategories.length})
                </CardTitle>
                <Button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ক্যাটেগরি
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Input
                    placeholder="ক্যাটেগরি খোঁজ করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                {categoriesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-32"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => (
                      <Card key={category.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {category.image_url && (
                              <div className="aspect-video rounded-lg bg-gray-800 overflow-hidden">
                                <img 
                                  src={category.image_url} 
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div>
                              <h3 className="text-white font-medium">{category.name}</h3>
                              <p className="text-blue-200 text-sm">{category.name_bengali}</p>
                              {category.description && (
                                <p className="text-gray-300 text-xs mt-1">{category.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={category.is_active ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
                                  {category.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </Badge>
                                <span className="text-xs text-gray-400">#{category.sort_order}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="flex-1 text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                এডিট
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-300 hover:text-red-100 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab - Promotional Management */}
          <TabsContent value="offers" className="space-y-6" data-testid="offers-content">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  অফার ও প্রমোশন ম্যানেজমেন্ট ({filteredOffers.length})
                </CardTitle>
                <Button 
                  onClick={() => setIsOfferModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন অফার
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-4">
                  <Input
                    placeholder="অফার টাইটেল, বিবরণ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <Select>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="অফার টাইপ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব অফার</SelectItem>
                      <SelectItem value="popup">পপআপ অফার</SelectItem>
                      <SelectItem value="banner">ব্যানার অফার</SelectItem>
                      <SelectItem value="active">সক্রিয় অফার</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {offersLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-48"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredOffers.map((offer) => (
                      <Card key={offer.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {offer.image_url && (
                              <div className="aspect-video rounded-lg bg-gray-800 overflow-hidden">
                                <img 
                                  src={offer.image_url} 
                                  alt={offer.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div>
                              <h3 className="text-white font-medium text-lg">{offer.title}</h3>
                              {offer.description && (
                                <p className="text-gray-300 text-sm mt-1">{offer.description}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {offer.discount_percentage && (
                                <div className="text-center p-2 bg-green-600/20 rounded">
                                  <p className="text-green-300 font-bold text-lg">{offer.discount_percentage}%</p>
                                  <p className="text-green-200 text-xs">ছাড়</p>
                                </div>
                              )}
                              {offer.discount_amount && (
                                <div className="text-center p-2 bg-blue-600/20 rounded">
                                  <p className="text-blue-300 font-bold text-lg">{formatCurrency(offer.discount_amount)}</p>
                                  <p className="text-blue-200 text-xs">টাকা ছাড়</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge className={offer.active ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
                                {offer.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                              </Badge>
                              {offer.is_popup && (
                                <Badge className="bg-purple-600/20 text-purple-300">
                                  পপআপ ({offer.popup_delay}ms)
                                </Badge>
                              )}
                              {offer.start_date && offer.end_date && (
                                <Badge className="bg-orange-600/20 text-orange-300">
                                  সময়সীমা: {formatDate(offer.start_date)} - {formatDate(offer.end_date)}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setIsOfferModalOpen(true);
                                }}
                                className="flex-1 text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                এডিট
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-300 hover:text-green-100 hover:bg-green-900/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                প্রিভিউ
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-300 hover:text-red-100 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes" className="space-y-6" data-testid="promo-codes-content">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  প্রোমো কোড ম্যানেজমেন্ট ({filteredPromoCodes.length})
                </CardTitle>
                <Button 
                  onClick={() => setIsPromoCodeModalOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন প্রোমো কোড
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Input
                    placeholder="প্রোমো কোড, বিবরণ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {promoCodesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-24"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPromoCodes.map((promo) => (
                      <Card key={promo.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-white font-bold text-lg font-mono">{promo.code}</p>
                              {promo.description && (
                                <p className="text-gray-300 text-sm">{promo.description}</p>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-blue-200 text-sm">ছাড়ের পরিমাণ</p>
                              <p className="text-green-300 font-bold">
                                {promo.discount_type === 'percentage' 
                                  ? `${promo.discount_value}%` 
                                  : formatCurrency(promo.discount_value)
                                }
                              </p>
                              {promo.min_purchase_amount && (
                                <p className="text-gray-400 text-xs">
                                  নূন্যতম: {formatCurrency(promo.min_purchase_amount)}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-blue-200 text-sm">ব্যবহার</p>
                              <p className="text-white">
                                {promo.usage_count}
                                {promo.usage_limit && ` / ${promo.usage_limit}`}
                              </p>
                              {promo.start_date && promo.end_date && (
                                <p className="text-gray-400 text-xs">
                                  {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge className={promo.is_active ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
                                {promo.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingPromoCode(promo);
                                  setIsPromoCodeModalOpen(true);
                                }}
                                className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                এডিট
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6" data-testid="customers-content">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  কাস্টমার ম্যানেজমেন্ট ({filteredCustomers.length})
                </CardTitle>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-2" />
                  এক্সপোর্ট কাস্টমার লিস্ট
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Input
                    placeholder="কাস্টমার নাম, ফোন, ইমেইল..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {customersLoading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredCustomers.map((customer) => (
                        <Card key={customer.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                              <div>
                                <p className="text-white font-medium">
                                  {customer.firstName} {customer.lastName}
                                </p>
                                <p className="text-blue-200 text-sm">{customer.phone}</p>
                                {customer.email && (
                                  <p className="text-gray-300 text-sm">{customer.email}</p>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-blue-200 text-sm">ঠিকানা</p>
                                <p className="text-white text-sm">{customer.address}</p>
                              </div>
                              
                              <div>
                                <p className="text-blue-200 text-sm">যোগদানের তারিখ</p>
                                <p className="text-white text-sm">{formatDate(customer.createdAt)}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setIsCustomerModalOpen(true);
                                  }}
                                  className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  বিস্তারিত
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-300 hover:text-green-100 hover:bg-green-900/20"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  অর্ডার
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Website Configuration */}
          <TabsContent value="settings" className="space-y-6" data-testid="settings-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    সাধারণ সেটিংস
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-blue-200">ওয়েবসাইট নাম</Label>
                    <Input 
                      placeholder="Trynex Lifestyle"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">হেডার ঘোষণা</Label>
                    <Textarea 
                      placeholder="বিশেষ অফার বা ঘোষণা..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">যোগাযোগের ফোন</Label>
                    <Input 
                      placeholder="+8801XXXXXXXXX"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">যোগাযোগের ইমেইল</Label>
                    <Input 
                      placeholder="info@trynexlifestyle.com"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Settings */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    ডেলিভারি সেটিংস
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-blue-200">ঢাকার ভিতরে ডেলিভারি চার্জ</Label>
                    <Input 
                      type="number"
                      placeholder="60"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">ঢাকার বাইরে ডেলিভারি চার্জ</Label>
                    <Input 
                      type="number"
                      placeholder="120"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">ন্যূনতম অর্ডার পরিমাণ</Label>
                    <Input 
                      type="number"
                      placeholder="500"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">ব্যবসার সময়</Label>
                    <Input 
                      placeholder="সকাল ৯টা - রাত ১০টা"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Settings */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    সোশ্যাল মিডিয়া
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-blue-200">Facebook পেজ</Label>
                    <Input 
                      placeholder="https://facebook.com/trynexlifestyle"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">Instagram</Label>
                    <Input 
                      placeholder="https://instagram.com/trynexlifestyle"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">WhatsApp নম্বর</Label>
                    <Input 
                      placeholder="+8801XXXXXXXXX"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Settings */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    অ্যানালিটিক্স সেটিংস
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-blue-200">Google Analytics ID</Label>
                    <Input 
                      placeholder="GA-XXXXXXXXX"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200">Facebook Pixel ID</Label>
                    <Input 
                      placeholder="XXXXXXXXXXXXXXX"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="analytics-enabled" />
                    <Label htmlFor="analytics-enabled" className="text-blue-200">অ্যানালিটিক্স সক্রিয় করুন</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                সব সেটিংস সেভ করুন
              </Button>
            </div>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  );
}
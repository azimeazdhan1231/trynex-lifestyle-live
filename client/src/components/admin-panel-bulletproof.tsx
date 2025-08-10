import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, Calendar, AlertTriangle, FileText, Settings, Award, Loader2
} from "lucide-react";
// Using generic types since imports may not be available
type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  is_featured?: boolean;
  is_latest?: boolean;
  is_best_selling?: boolean;
};

type Category = {
  id: string;
  name: string;
  name_bengali: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
};

type Order = {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  address?: string;
  total: string | number;
  status: string;
  created_at: string | Date;
  items?: any[];
  custom_instructions?: string;
  custom_images?: string[];
};

type PromoCode = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  usage_limit?: number;
  used_count?: number;
  is_active: boolean;
};

const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

const PRODUCT_CATEGORIES = [
  "ইলেকট্রনিক্স", "ফ্যাশন", "বই", "খেলাধুলা", "সৌন্দর্য", "ঘর ও বাগান", 
  "খাবার ও পানীয়", "পোশাক", "জুতা", "ব্যাগ", "ঘড়ি", "গয়না", "মোবাইল ও ট্যাবলেট"
];

// BD timezone formatter
const formatBDTime = (dateString: string | Date | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('bn-BD', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminPanelBulletproof() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", stock: "", category: "", 
    image_url: "", is_featured: false, is_latest: false, is_best_selling: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "", name_bengali: "", description: "", image_url: "", is_active: true
  });

  const [offerForm, setOfferForm] = useState({
    title: "", description: "", discount_percentage: "", image_url: "", 
    min_order_amount: "", button_text: "অর্ডার করুন", active: true
  });

  const [promoForm, setPromoForm] = useState({
    code: "", discount_type: "percentage", discount_value: "", 
    min_order_amount: "", usage_limit: "", is_active: true
  });

  const [siteSettings, setSiteSettings] = useState({
    site_name: "Trynex Lifestyle",
    site_description: "Bangladesh এর সেরা গিফট এবং লাইফস্টাইল পণ্যের দোকান",
    contact_email: "support@trynex.com",
    contact_phone: "+8801XXXXXXXXX",
    whatsapp_number: "+8801XXXXXXXXX",
    business_address: "ঢাকা, বাংলাদেশ",
    delivery_fee_dhaka: "60",
    delivery_fee_outside: "120",
    min_order_amount: "200"
  });

  // Data fetching with proper error handling
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    retry: 3,
    staleTime: 1000 * 30 // 30 seconds
  });

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    retry: 3,
    staleTime: 1000 * 60 // 1 minute
  });

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"],
    retry: 3,
    staleTime: 1000 * 60 // 1 minute
  });

  const { data: offers = [], isLoading: offersLoading, refetch: refetchOffers } = useQuery<any[]>({ 
    queryKey: ["/api/offers"],
    retry: 3,
    staleTime: 1000 * 60 // 1 minute
  });

  const { data: promoCodes = [], isLoading: promoLoading, refetch: refetchPromo } = useQuery<PromoCode[]>({ 
    queryKey: ["/api/promo-codes"],
    retry: 3,
    staleTime: 1000 * 60 // 1 minute
  });

  const { data: currentSettings } = useQuery({
    queryKey: ["/api/settings"],
    retry: 3,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Update settings when data is fetched
  useEffect(() => {
    if (currentSettings) {
      setSiteSettings(prev => ({ ...prev, ...currentSettings }));
    }
  }, [currentSettings]);

  // Dashboard stats calculation
  const stats = useMemo(() => {
    const orderArray = Array.isArray(orders) ? orders : [];
    const productArray = Array.isArray(products) ? products : [];

    const totalOrders = orderArray.length;
    const totalRevenue = orderArray
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (parseFloat(order.total as string) || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayOrders = orderArray.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart;
    }).length;

    const pendingOrders = orderArray.filter((order) => order.status === 'pending').length;
    const processingOrders = orderArray.filter((order) => order.status === 'processing').length;
    const deliveredOrders = orderArray.filter((order) => order.status === 'delivered').length;
    const lowStockProducts = productArray.filter((product) => product.stock < 10).length;
    const outOfStockProducts = productArray.filter((product) => product.stock === 0).length;

    return {
      totalOrders,
      totalRevenue,
      todayOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: productArray.length,
      totalCategories: categories.length,
      totalOffers: offers.length,
      totalPromoCodes: promoCodes.length
    };
  }, [orders, products, categories, offers, promoCodes]);

  // Mutations with proper error handling
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      try {
        console.log(`Order status update: ${id} -> ${status}`);
        
        const response = await apiRequest("PATCH", `/api/orders/${id}`, { status });
        
        console.log('Order update response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Order update failed:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Order update success:', result);
        return result;
      } catch (error) {
        console.error('Order update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "সফল", description: "অর্ডার স্ট্যাটাস আপডেট হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Order update error:', error);
      toast({ title: "ত্রুটি", description: "অর্ডার আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const endpoint = editingItem ? `/api/products/${editingItem.id}` : '/api/products';
        const method = editingItem ? 'PATCH' : 'POST';
        
        console.log(`Product mutation: ${method} ${endpoint}`, data);
        
        const response = await apiRequest(method as any, endpoint, {
          ...data,
          price: data.price.toString(),
          stock: data.stock.toString()
        });

        console.log('Product mutation response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Product mutation failed:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Product mutation success:', result);
        return result;
      } catch (error) {
        console.error('Product mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductModalOpen(false);
      resetProductForm();
      toast({ title: "সফল", description: editingItem ? "পণ্য আপডেট হয়েছে" : "নতুন পণ্য যোগ হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Product mutation error:', error);
      toast({ title: "ত্রুটি", description: "পণ্য সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingItem ? `/api/categories/${editingItem.id}` : '/api/categories';
      const method = editingItem ? 'PATCH' : 'POST';
      const response = await apiRequest(method as any, endpoint, data);
      if (!response.ok) throw new Error('Failed to save category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryModalOpen(false);
      resetCategoryForm();
      toast({ title: "সফল", description: editingItem ? "ক্যাটেগরি আপডেট হয়েছে" : "নতুন ক্যাটেগরি যোগ হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Category mutation error:', error);
      toast({ title: "ত্রুটি", description: "ক্যাটেগরি সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const offerMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingItem ? `/api/offers/${editingItem.id}` : '/api/offers';
      const method = editingItem ? 'PATCH' : 'POST';
      const response = await apiRequest(method as any, endpoint, {
        ...data,
        discount_percentage: parseInt(data.discount_percentage) || 0,
        min_order_amount: parseFloat(data.min_order_amount) || 0
      });
      if (!response.ok) throw new Error('Failed to save offer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setOfferModalOpen(false);
      resetOfferForm();
      toast({ title: "সফল", description: editingItem ? "অফার আপডেট হয়েছে" : "নতুন অফার যোগ হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Offer mutation error:', error);
      toast({ title: "ত্রুটি", description: "অফার সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const promoMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingItem ? `/api/promo-codes/${editingItem.id}` : '/api/promo-codes';
      const method = editingItem ? 'PATCH' : 'POST';
      const response = await apiRequest(method as any, endpoint, {
        ...data,
        discount_value: parseFloat(data.discount_value) || 0,
        min_order_amount: parseFloat(data.min_order_amount) || 0,
        usage_limit: parseInt(data.usage_limit) || null
      });
      if (!response.ok) throw new Error('Failed to save promo code');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setPromoModalOpen(false);
      resetPromoForm();
      toast({ title: "সফল", description: editingItem ? "প্রোমো কোড আপডেট হয়েছে" : "নতুন প্রোমো কোড যোগ হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Promo mutation error:', error);
      toast({ title: "ত্রুটি", description: "প্রোমো কোড সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const response = await apiRequest("DELETE", `/api/${type}/${id}`);
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${variables.type}`] });
      toast({ title: "সফল", description: "সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({ title: "ত্রুটি", description: "মুছতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const settingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("POST", "/api/settings", settings);
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setSettingsModalOpen(false);
      toast({ title: "সফল", description: "সেটিংস আপডেট হয়েছে" });
    },
    onError: (error: any) => {
      console.error('Settings mutation error:', error);
      toast({ title: "ত্রুটি", description: "সেটিংস সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Form reset functions
  const resetProductForm = () => {
    setProductForm({
      name: "", description: "", price: "", stock: "", category: "", 
      image_url: "", is_featured: false, is_latest: false, is_best_selling: false
    });
    setEditingItem(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "", name_bengali: "", description: "", image_url: "", is_active: true
    });
    setEditingItem(null);
  };

  const resetOfferForm = () => {
    setOfferForm({
      title: "", description: "", discount_percentage: "", image_url: "", 
      min_order_amount: "", button_text: "অর্ডার করুন", active: true
    });
    setEditingItem(null);
  };

  const resetPromoForm = () => {
    setPromoForm({
      code: "", discount_type: "percentage", discount_value: "", 
      min_order_amount: "", usage_limit: "", is_active: true
    });
    setEditingItem(null);
  };

  // Edit handlers
  const handleEditProduct = (product: Product) => {
    setEditingItem(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured || false,
      is_latest: product.is_latest || false,
      is_best_selling: product.is_best_selling || false
    });
    setProductModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingItem(category);
    setCategoryForm({
      name: category.name,
      name_bengali: category.name_bengali,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active !== false
    });
    setCategoryModalOpen(true);
  };

  const handleEditOffer = (offer: any) => {
    setEditingItem(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description || "",
      discount_percentage: offer.discount_percentage?.toString() || "",
      image_url: offer.image_url || "",
      min_order_amount: offer.min_order_amount?.toString() || "",
      button_text: offer.button_text || "অর্ডার করুন",
      active: offer.active !== false
    });
    setOfferModalOpen(true);
  };

  const handleEditPromo = (promo: PromoCode) => {
    setEditingItem(promo);
    setPromoForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      min_order_amount: promo.min_order_amount?.toString() || "",
      usage_limit: promo.usage_limit?.toString() || "",
      is_active: promo.is_active !== false
    });
    setPromoModalOpen(true);
  };

  const handleOrderView = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleOrderStatusUpdate = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status });
  };

  return (
    <div className="w-full max-w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">অ্যাডমিন প্যানেল</h1>
        <Badge variant="outline" className="text-sm">
          সর্বশেষ আপডেট: {new Date().toLocaleTimeString('bn-BD')}
        </Badge>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ড্যাশবোর্ড
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            অর্ডার
            {stats.pendingOrders > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {stats.pendingOrders}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            পণ্য ({stats.totalProducts})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            ক্যাটেগরি ({stats.totalCategories})
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            অফার ({stats.totalOffers})
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            প্রোমো ({stats.totalPromoCodes})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            বিশ্লেষণ
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            সেটিংস
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">আজ: {stats.todayOrders}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">ডেলিভার হওয়া অর্ডার</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  স্টক কম: {stats.lowStockProducts} | স্টকআউট: {stats.outOfStockProducts}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">অপেক্ষমান অর্ডার</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  প্রক্রিয়াধীন: {stats.processingOrders}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">#{order.tracking_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(Number(order.total))}</p>
                        <Badge variant={order.status === 'pending' ? 'destructive' : 'secondary'}>
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>দ্রুত কার্যক্রম</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => {
                    resetProductForm();
                    setProductModalOpen(true);
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন পণ্য যোগ করুন
                </Button>
                <Button 
                  onClick={() => {
                    resetCategoryForm();
                    setCategoryModalOpen(true);
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  নতুন ক্যাটেগরি যোগ করুন
                </Button>
                <Button 
                  onClick={() => {
                    resetOfferForm();
                    setOfferModalOpen(true);
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  নতুন অফার যোগ করুন
                </Button>
                <Button 
                  onClick={() => setSettingsModalOpen(true)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  সাইট সেটিংস
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">সমস্ত অর্ডার ({orders.length})</h2>
            <Button onClick={() => refetchOrders()} variant="outline" size="sm">
              <Loader2 className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ট্র্যাকিং ID</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>মোট</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">অর্ডার লোড হচ্ছে...</p>
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        কোনো অর্ডার পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.tracking_id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell>{formatPrice(Number(order.total))}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(status) => handleOrderStatusUpdate(order.id, status)}
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ORDER_STATUSES).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatBDTime(order.created_at)}</TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => handleOrderView(order)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">সমস্ত পণ্য ({products.length})</h2>
            <div className="flex gap-2">
              <Button onClick={() => refetchProducts()} variant="outline" size="sm">
                <Loader2 className={`h-4 w-4 mr-2 ${productsLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
              <Button 
                onClick={() => {
                  resetProductForm();
                  setProductModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                নতুন পণ্য
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ছবি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>ক্যাটেগরি</TableHead>
                    <TableHead>দাম</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">পণ্য লোড হচ্ছে...</p>
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        কোনো পণ্য পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatPrice(Number(product.price))}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.is_featured && <Badge variant="default" className="text-xs">ফিচার্ড</Badge>}
                            {product.is_latest && <Badge variant="secondary" className="text-xs">নতুন</Badge>}
                            {product.is_best_selling && <Badge variant="outline" className="text-xs">জনপ্রিয়</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleEditProduct(product)}
                              size="sm"
                              variant="outline"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>পণ্য মুছে ফেলুন</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান? এই কার্যক্রম পূর্বাবস্থায় ফেরানো যাবে না।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate({ type: 'products', id: product.id })}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    মুছে ফেলুন
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">সমস্ত ক্যাটেগরি ({categories.length})</h2>
            <div className="flex gap-2">
              <Button onClick={() => refetchCategories()} variant="outline" size="sm">
                <Loader2 className={`h-4 w-4 mr-2 ${categoriesLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
              <Button 
                onClick={() => {
                  resetCategoryForm();
                  setCategoryModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                নতুন ক্যাটেগরি
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesLoading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2">ক্যাটেগরি লোড হচ্ছে...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full text-center py-8">
                কোনো ক্যাটেগরি পাওয়া যায়নি
              </div>
            ) : (
              categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name_bengali}</CardTitle>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.name}</p>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm mb-4">{category.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEditCategory(category)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        সম্পাদনা
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ক্যাটেগরি মুছে ফেলুন</AlertDialogTitle>
                            <AlertDialogDescription>
                              আপনি কি নিশ্চিত যে এই ক্যাটেগরিটি মুছে ফেলতে চান?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate({ type: 'categories', id: category.id })}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              মুছে ফেলুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">সমস্ত অফার ({offers.length})</h2>
            <div className="flex gap-2">
              <Button onClick={() => refetchOffers()} variant="outline" size="sm">
                <Loader2 className={`h-4 w-4 mr-2 ${offersLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
              <Button 
                onClick={() => {
                  resetOfferForm();
                  setOfferModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                নতুন অফার
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offersLoading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2">অফার লোড হচ্ছে...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="col-span-full text-center py-8">
                কোনো অফার পাওয়া যায়নি
              </div>
            ) : (
              offers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <Badge variant={offer.active ? 'default' : 'secondary'}>
                        {offer.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {offer.description && (
                      <p className="text-sm mb-4">{offer.description}</p>
                    )}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>ছাড়:</span>
                        <span className="font-medium">{offer.discount_percentage}%</span>
                      </div>
                      {offer.min_order_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>সর্বনিম্ন অর্ডার:</span>
                          <span className="font-medium">{formatPrice(Number(offer.min_order_amount))}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEditOffer(offer)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        সম্পাদনা
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>অফার মুছে ফেলুন</AlertDialogTitle>
                            <AlertDialogDescription>
                              আপনি কি নিশ্চিত যে এই অফারটি মুছে ফেলতে চান?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate({ type: 'offers', id: offer.id })}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              মুছে ফেলুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promo" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">সমস্ত প্রোমো কোড ({promoCodes.length})</h2>
            <div className="flex gap-2">
              <Button onClick={() => refetchPromo()} variant="outline" size="sm">
                <Loader2 className={`h-4 w-4 mr-2 ${promoLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
              <Button 
                onClick={() => {
                  resetPromoForm();
                  setPromoModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                নতুন প্রোমো কোড
              </Button>
            </div>
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
                    <TableHead>ব্যবহার সীমা</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">প্রোমো কোড লোড হচ্ছে...</p>
                      </TableCell>
                    </TableRow>
                  ) : promoCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        কোনো প্রোমো কোড পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    promoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {promo.discount_type === 'percentage' ? 'শতাংশ' : 'নির্দিষ্ট'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {promo.discount_type === 'percentage' 
                            ? `${promo.discount_value}%` 
                            : formatPrice(Number(promo.discount_value))
                          }
                        </TableCell>
                        <TableCell>
                          {promo.min_order_amount ? formatPrice(Number(promo.min_order_amount)) : 'নেই'}
                        </TableCell>
                        <TableCell>
                          {promo.usage_limit || 'সীমাহীন'}
                          {promo.used_count ? ` (${promo.used_count} ব্যবহৃত)` : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                            {promo.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleEditPromo(promo)}
                              size="sm"
                              variant="outline"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>প্রোমো কোড মুছে ফেলুন</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    আপনি কি নিশ্চিত যে এই প্রোমো কোডটি মুছে ফেলতে চান?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate({ type: 'promo-codes', id: promo.id })}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    মুছে ফেলুন
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">বিশ্লেষণ ও রিপোর্ট</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">অর্ডার স্ট্যাটিস্টিক</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>অপেক্ষমান:</span>
                    <Badge variant="destructive">{stats.pendingOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>প্রক্রিয়াধীন:</span>
                    <Badge variant="secondary">{stats.processingOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভার হয়েছে:</span>
                    <Badge variant="default">{stats.deliveredOrders}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">পণ্য স্ট্যাটিস্টিক</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>মোট পণ্য:</span>
                    <Badge variant="default">{stats.totalProducts}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>স্টক কম:</span>
                    <Badge variant="secondary">{stats.lowStockProducts}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>স্টকআউট:</span>
                    <Badge variant="destructive">{stats.outOfStockProducts}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">সিস্টেম তথ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>ক্যাটেগরি:</span>
                    <Badge variant="default">{stats.totalCategories}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>অফার:</span>
                    <Badge variant="default">{stats.totalOffers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>প্রোমো কোড:</span>
                    <Badge variant="default">{stats.totalPromoCodes}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>বিক্রয় সারাংশ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</div>
                  <p className="text-sm text-muted-foreground">মোট বিক্রয় (ডেলিভার হয়েছে)</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalOrders}</div>
                  <p className="text-sm text-muted-foreground">মোট অর্ডার</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.totalOrders > 0 ? formatPrice(stats.totalRevenue / stats.totalOrders) : '০'}
                  </div>
                  <p className="text-sm text-muted-foreground">গড় অর্ডার মূল্য</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">সাইট সেটিংস</h2>
            <Button onClick={() => setSettingsModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              সেটিংস আপডেট করুন
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>সাইট তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>সাইটের নাম</Label>
                  <p className="mt-1 font-medium">{siteSettings.site_name}</p>
                </div>
                <div>
                  <Label>সাইটের বিবরণ</Label>
                  <p className="mt-1 text-sm">{siteSettings.site_description}</p>
                </div>
                <div>
                  <Label>যোগাযোগ ইমেইল</Label>
                  <p className="mt-1 font-medium">{siteSettings.contact_email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>যোগাযোগ তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ফোন নম্বর</Label>
                  <p className="mt-1 font-medium">{siteSettings.contact_phone}</p>
                </div>
                <div>
                  <Label>হোয়াটসঅ্যাপ নম্বর</Label>
                  <p className="mt-1 font-medium">{siteSettings.whatsapp_number}</p>
                </div>
                <div>
                  <Label>ব্যবসার ঠিকানা</Label>
                  <p className="mt-1 text-sm">{siteSettings.business_address}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ডেলিভারি সেটিংস</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>ঢাকায় ডেলিভারি ফি:</span>
                  <span className="font-medium">{formatPrice(Number(siteSettings.delivery_fee_dhaka))}</span>
                </div>
                <div className="flex justify-between">
                  <span>ঢাকার বাইরে ডেলিভারি ফি:</span>
                  <span className="font-medium">{formatPrice(Number(siteSettings.delivery_fee_outside))}</span>
                </div>
                <div className="flex justify-between">
                  <span>সর্বনিম্ন অর্ডার পরিমাণ:</span>
                  <span className="font-medium">{formatPrice(Number(siteSettings.min_order_amount))}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              পণ্যের বিস্তারিত তথ্য দিন
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              productMutation.mutate(productForm);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">পণ্যের নাম *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">ক্যাটেগরি</Label>
                <Select 
                  value={productForm.category} 
                  onValueChange={(value) => setProductForm({...productForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">দাম *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">স্টক *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="image_url">ছবির URL</Label>
              <Input
                id="image_url"
                value={productForm.image_url}
                onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={productForm.is_featured}
                  onCheckedChange={(checked) => setProductForm({...productForm, is_featured: checked})}
                />
                <Label htmlFor="is_featured">ফিচার্ড</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_latest"
                  checked={productForm.is_latest}
                  onCheckedChange={(checked) => setProductForm({...productForm, is_latest: checked})}
                />
                <Label htmlFor="is_latest">নতুন</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_best_selling"
                  checked={productForm.is_best_selling}
                  onCheckedChange={(checked) => setProductForm({...productForm, is_best_selling: checked})}
                />
                <Label htmlFor="is_best_selling">জনপ্রিয়</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setProductModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={productMutation.isPending}>
                {productMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "ক্যাটেগরি সম্পাদনা" : "নতুন ক্যাটেগরি যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              ক্যাটেগরির তথ্য দিন
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              categoryMutation.mutate(categoryForm);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">ইংরেজি নাম *</Label>
              <Input
                id="name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="name_bengali">বাংলা নাম *</Label>
              <Input
                id="name_bengali"
                value={categoryForm.name_bengali}
                onChange={(e) => setCategoryForm({...categoryForm, name_bengali: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="image_url">ছবির URL</Label>
              <Input
                id="image_url"
                value={categoryForm.image_url}
                onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={categoryForm.is_active}
                onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
              />
              <Label htmlFor="is_active">সক্রিয়</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={categoryMutation.isPending}>
                {categoryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Offer Modal */}
      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "অফার সম্পাদনা" : "নতুন অফার যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              অফারের তথ্য দিন
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              offerMutation.mutate(offerForm);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">অফারের শিরোনাম *</Label>
              <Input
                id="title"
                value={offerForm.title}
                onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={offerForm.description}
                onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_percentage">ছাড় (%) *</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  value={offerForm.discount_percentage}
                  onChange={(e) => setOfferForm({...offerForm, discount_percentage: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="min_order_amount">সর্বনিম্ন অর্ডার</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={offerForm.min_order_amount}
                  onChange={(e) => setOfferForm({...offerForm, min_order_amount: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="image_url">ছবির URL</Label>
              <Input
                id="image_url"
                value={offerForm.image_url}
                onChange={(e) => setOfferForm({...offerForm, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="button_text">বাটনের টেক্সট</Label>
              <Input
                id="button_text"
                value={offerForm.button_text}
                onChange={(e) => setOfferForm({...offerForm, button_text: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={offerForm.active}
                onCheckedChange={(checked) => setOfferForm({...offerForm, active: checked})}
              />
              <Label htmlFor="active">সক্রিয়</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOfferModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={offerMutation.isPending}>
                {offerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Promo Code Modal */}
      <Dialog open={promoModalOpen} onOpenChange={setPromoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "প্রোমো কোড সম্পাদনা" : "নতুন প্রোমো কোড যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              প্রোমো কোডের তথ্য দিন
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              promoMutation.mutate(promoForm);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="code">প্রোমো কোড *</Label>
              <Input
                id="code"
                value={promoForm.code}
                onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                placeholder="SAVE20"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="discount_type">ছাড়ের ধরন *</Label>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_value">ছাড়ের পরিমাণ *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={promoForm.discount_value}
                  onChange={(e) => setPromoForm({...promoForm, discount_value: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="min_order_amount">সর্বনিম্ন অর্ডার</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={promoForm.min_order_amount}
                  onChange={(e) => setPromoForm({...promoForm, min_order_amount: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="usage_limit">ব্যবহার সীমা</Label>
              <Input
                id="usage_limit"
                type="number"
                value={promoForm.usage_limit}
                onChange={(e) => setPromoForm({...promoForm, usage_limit: e.target.value})}
                placeholder="সীমাহীনের জন্য খালি রাখুন"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={promoForm.is_active}
                onCheckedChange={(checked) => setPromoForm({...promoForm, is_active: checked})}
              />
              <Label htmlFor="is_active">সক্রিয়</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setPromoModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={promoMutation.isPending}>
                {promoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>সাইট সেটিংস</DialogTitle>
            <DialogDescription>
              সাইটের প্রয়োজনীয় সেটিংস আপডেট করুন
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              settingsMutation.mutate(siteSettings);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_name">সাইটের নাম *</Label>
                <Input
                  id="site_name"
                  value={siteSettings.site_name}
                  onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_email">যোগাযোগ ইমেইল *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={siteSettings.contact_email}
                  onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="site_description">সাইটের বিবরণ</Label>
              <Textarea
                id="site_description"
                value={siteSettings.site_description}
                onChange={(e) => setSiteSettings({...siteSettings, site_description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">ফোন নম্বর</Label>
                <Input
                  id="contact_phone"
                  value={siteSettings.contact_phone}
                  onChange={(e) => setSiteSettings({...siteSettings, contact_phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_number">হোয়াটসঅ্যাপ নম্বর</Label>
                <Input
                  id="whatsapp_number"
                  value={siteSettings.whatsapp_number}
                  onChange={(e) => setSiteSettings({...siteSettings, whatsapp_number: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="business_address">ব্যবসার ঠিকানা</Label>
              <Textarea
                id="business_address"
                value={siteSettings.business_address}
                onChange={(e) => setSiteSettings({...siteSettings, business_address: e.target.value})}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="delivery_fee_dhaka">ঢাকায় ডেলিভারি ফি</Label>
                <Input
                  id="delivery_fee_dhaka"
                  type="number"
                  value={siteSettings.delivery_fee_dhaka}
                  onChange={(e) => setSiteSettings({...siteSettings, delivery_fee_dhaka: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="delivery_fee_outside">ঢাকার বাইরে ডেলিভারি ফি</Label>
                <Input
                  id="delivery_fee_outside"
                  type="number"
                  value={siteSettings.delivery_fee_outside}
                  onChange={(e) => setSiteSettings({...siteSettings, delivery_fee_outside: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="min_order_amount">সর্বনিম্ন অর্ডার পরিমাণ</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={siteSettings.min_order_amount}
                  onChange={(e) => setSiteSettings({...siteSettings, min_order_amount: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setSettingsModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={settingsMutation.isPending}>
                {settingsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                সেটিংস সেভ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার বিস্তারিত - #{selectedOrder?.tracking_id}</DialogTitle>
            <DialogDescription>
              অর্ডারের সম্পূর্ণ তথ্য এবং কাস্টমাইজেশন
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>গ্রাহকের নাম</Label>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <Label>ফোন নম্বর</Label>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label>জেলা</Label>
                  <p className="font-medium">{selectedOrder.district}</p>
                </div>
                <div>
                  <Label>থানা</Label>
                  <p className="font-medium">{selectedOrder.thana}</p>
                </div>
                <div>
                  <Label>মোট পরিমাণ</Label>
                  <p className="font-medium">{formatPrice(Number(selectedOrder.total))}</p>
                </div>
                <div>
                  <Label>অর্ডারের তারিখ</Label>
                  <p className="font-medium">{formatBDTime(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div>
                  <Label>সম্পূর্ণ ঠিকানা</Label>
                  <p className="mt-1 bg-gray-50 p-3 rounded">{selectedOrder.address}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <Label>অর্ডার করা পণ্যসমূহ</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>পণ্যের নাম</TableHead>
                        <TableHead>পরিমাণ</TableHead>
                        <TableHead>দাম</TableHead>
                        <TableHead>মোট</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(selectedOrder.items) ? (
                        selectedOrder.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.name || 'N/A'}</TableCell>
                            <TableCell>{item.quantity || 1}</TableCell>
                            <TableCell>{formatPrice(Number(item.price || 0))}</TableCell>
                            <TableCell>{formatPrice(Number(item.price || 0) * (item.quantity || 1))}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            অর্ডার আইটেম তথ্য পাওয়া যায়নি
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Custom Instructions */}
              {selectedOrder.custom_instructions && (
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    কাস্টম নির্দেশনা
                  </Label>
                  <div className="mt-2 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm">{selectedOrder.custom_instructions}</p>
                  </div>
                </div>
              )}

              {/* Custom Images */}
              {selectedOrder.custom_images && Array.isArray(selectedOrder.custom_images) && selectedOrder.custom_images.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    আপলোড করা ছবি ({selectedOrder.custom_images.length}টি)
                  </Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedOrder.custom_images.map((imageUrl: string, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Custom upload ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Status Update */}
              <div>
                <Label>অর্ডার স্ট্যাটাস আপডেট করুন</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(status) => {
                      handleOrderStatusUpdate(selectedOrder.id, status);
                      setSelectedOrder({...selectedOrder, status});
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUSES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant={selectedOrder.status === 'pending' ? 'destructive' : 'default'}>
                    {ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES] || selectedOrder.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
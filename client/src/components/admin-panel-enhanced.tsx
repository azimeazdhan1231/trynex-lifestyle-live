import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { formatPrice } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, PlusCircle, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, Upload, Image, FileImage
} from "lucide-react";
import type { Product, Category, Order, PromoCode } from "@shared/schema";

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
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function AdminPanelEnhanced() {
  const { toast } = useToast();

  // Form states
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: 0, stock: 0, category: "", 
    image_url: "", additional_images: "",
    is_featured: false, is_latest: false, is_best_selling: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "", name_bengali: "", description: "", image_url: "", is_active: true
  });

  const [offerForm, setOfferForm] = useState({
    title: "", description: "", discount_percentage: 0, image_url: "", 
    is_popup: false, popup_delay: 3000, active: true, expiry: ""
  });

  const [promoForm, setPromoForm] = useState({
    code: "", discount_type: "percentage", discount_value: 0, 
    min_order_amount: 0, usage_limit: 0, expires_at: "", is_active: true
  });

  // Dialog states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  // Controlled data fetching with NO automatic refetching
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    staleTime: 0, // Always consider stale for admin panel
    refetchInterval: false,
    refetchOnWindowFocus: true, // Refetch when focusing window
    refetchOnReconnect: true, // Refetch when reconnecting
    retry: 1
  });

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"],
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  });

  const { data: offers = [], isLoading: offersLoading, error: offersError } = useQuery<any[]>({ 
    queryKey: ["/api/offers"],
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  });

  const { data: promoCodes = [], isLoading: promoLoading, error: promoError } = useQuery<PromoCode[]>({ 
    queryKey: ["/api/promo-codes"],
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  });

  // Dashboard statistics
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: Order) => {
    const orderTotal = Number(order.total) || 0;
    return sum + orderTotal;
  }, 0) : 0;

  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const pendingOrders = Array.isArray(orders) ? orders.filter((order: Order) => order.status === "pending").length : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const lowStockProducts = Array.isArray(products) ? products.filter((product: Product) => (product.stock || 0) < 5).length : 0;
  const activePromoCodes = Array.isArray(promoCodes) ? promoCodes.filter((promo: PromoCode) => promo.is_active).length : 0;

  // Form reset functions
  const resetProductForm = () => {
    setProductForm({
      name: "", description: "", price: 0, stock: 0, category: "", 
      image_url: "", additional_images: "",
      is_featured: false, is_latest: false, is_best_selling: false
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", name_bengali: "", description: "", image_url: "", is_active: true });
  };

  const resetOfferForm = () => {
    setOfferForm({
      title: "", description: "", discount_percentage: 0, image_url: "", 
      is_popup: false, popup_delay: 3000, active: true, expiry: ""
    });
  };

  const resetPromoForm = () => {
    setPromoForm({
      code: "", discount_type: "percentage", discount_value: 0, 
      min_order_amount: 0, usage_limit: 0, expires_at: "", is_active: true
    });
  };

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["products-ultra-fast"] });
      
      // Clear localStorage cache
      try {
        const cacheKeys = Object.keys(localStorage).filter(key => 
          key.includes('products-cache') || key.includes('products-ultra-fast')
        );
        cacheKeys.forEach(key => localStorage.removeItem(key));
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cleared product cache after create');
        }
      } catch (e) {
        console.warn('Failed to clear localStorage cache:', e);
      }
      
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
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["products-ultra-fast"] });
      
      // Clear localStorage cache
      try {
        const cacheKeys = Object.keys(localStorage).filter(key => 
          key.includes('products-cache') || key.includes('products-ultra-fast')
        );
        cacheKeys.forEach(key => localStorage.removeItem(key));
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cleared product cache after update');
        }
      } catch (e) {
        console.warn('Failed to clear localStorage cache:', e);
      }
      
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
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["products-ultra-fast"] });
      
      // Clear localStorage cache
      try {
        const cacheKeys = Object.keys(localStorage).filter(key => 
          key.includes('products-cache') || key.includes('products-ultra-fast')
        );
        cacheKeys.forEach(key => localStorage.removeItem(key));
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cleared product cache after delete');
        }
      } catch (e) {
        console.warn('Failed to clear localStorage cache:', e);
      }
      
      toast({ title: "পণ্য মুছে ফেলা হয়েছে", description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "পণ্য মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      toast({ title: "ক্যাটেগরি যোগ করা হয়েছে", description: "নতুন ক্যাটেগরি সফলভাবে যোগ করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "ক্যাটেগরি যোগ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/categories/${editingCategory?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      resetCategoryForm();
      toast({ title: "ক্যাটেগরি আপডেট হয়েছে", description: "ক্যাটেগরির তথ্য সফলভাবে আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "ক্যাটেগরি আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "ক্যাটেগরি মুছে ফেলা হয়েছে", description: "ক্যাটেগরি সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "ক্যাটেগরি মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Offer mutations
  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/offers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsOfferDialogOpen(false);
      resetOfferForm();
      toast({ title: "অফার যোগ করা হয়েছে", description: "নতুন অফার সফলভাবে যোগ করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "অফার যোগ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/offers/${editingOffer?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsOfferDialogOpen(false);
      setEditingOffer(null);
      resetOfferForm();
      toast({ title: "অফার আপডেট হয়েছে", description: "অফারের তথ্য সফলভাবে আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "অফার আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/offers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({ title: "অফার মুছে ফেলা হয়েছে", description: "অফার সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "অফার মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Promo code mutations
  const createPromoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/promo-codes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsPromoDialogOpen(false);
      resetPromoForm();
      toast({ title: "প্রোমো কোড যোগ করা হয়েছে", description: "নতুন প্রোমো কোড সফলভাবে যোগ করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "প্রোমো কোড যোগ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const updatePromoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/promo-codes/${editingPromo?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsPromoDialogOpen(false);
      setEditingPromo(null);
      resetPromoForm();
      toast({ title: "প্রোমো কোড আপডেট হয়েছে", description: "প্রোমো কোডের তথ্য সফলভাবে আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "প্রোমো কোড আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  const deletePromoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/promo-codes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "প্রোমো কোড মুছে ফেলা হয়েছে", description: "প্রোমো কোড সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "প্রোমো কোড মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Order status update mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSelectedOrder(prev => prev ? { ...prev, status: prev.status } : null);
      toast({ title: "অর্ডার আপডেট হয়েছে", description: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "অর্ডার আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  });

  // Handle form submissions
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate(productForm);
    } else {
      createProductMutation.mutate(productForm);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate(categoryForm);
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateOfferMutation.mutate(offerForm);
    } else {
      createOfferMutation.mutate(offerForm);
    }
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromo) {
      updatePromoMutation.mutate(promoForm);
    } else {
      createPromoMutation.mutate(promoForm);
    }
  };

  // Edit handlers
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: Number(product.price) || 0,
      stock: product.stock || 0,
      category: product.category || "",
      image_url: product.image_url || "",
      additional_images: "",
      is_featured: product.is_featured || false,
      is_latest: product.is_latest || false,
      is_best_selling: product.is_best_selling || false
    });
    setIsProductDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      name_bengali: category.name_bengali || "",
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active ?? true
    });
    setIsCategoryDialogOpen(true);
  };

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || "",
      description: offer.description || "",
      discount_percentage: offer.discount_percentage || 0,
      image_url: offer.image_url || "",
      is_popup: offer.is_popup || false,
      popup_delay: offer.popup_delay || 3000,
      active: offer.active ?? true,
      expiry: offer.expiry || ""
    });
    setIsOfferDialogOpen(true);
  };

  const handleEditPromo = (promo: any) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code || "",
      discount_type: promo.discount_type || "percentage",
      discount_value: Number(promo.discount_value) || 0,
      min_order_amount: Number(promo.min_order_amount) || 0,
      usage_limit: promo.usage_limit || 0,
      expires_at: promo.expires_at || "",
      is_active: promo.is_active ?? true
    });
    setIsPromoDialogOpen(true);
  };

  if (ordersLoading || productsLoading || categoriesLoading || offersLoading || promoLoading) {
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
    <div className="w-full max-w-full overflow-x-hidden">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm rounded-lg p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">ড্যাশবোর্ড</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 text-xs sm:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">অর্ডার</span>
            {pendingOrders > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {pendingOrders}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2 text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">পণ্য</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2 text-xs sm:text-sm">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">ক্যাটেগরি</span>
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2 text-xs sm:text-sm">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">অফার</span>
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2 text-xs sm:text-sm">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">প্রোমো</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">বিশ্লেষণ</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-blue-100">সর্বমোট আয়</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-green-100">অপেক্ষমান: {pendingOrders}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                <Package className="h-4 w-4 text-purple-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-purple-100">কম স্টক: {lowStockProducts}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">সক্রিয় প্রোমো</CardTitle>
                <Award className="h-4 w-4 text-orange-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePromoCodes}</div>
                <p className="text-xs text-orange-100">চালু অফার</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                সাম্প্রতিক অর্ডার
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>অর্ডার ID</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>মোট</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ (BD টাইম)</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{formatPrice(Number(order.total))}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatBDTime(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                সমস্ত অর্ডার ({totalOrders})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>অর্ডার ID</TableHead>
                      <TableHead>গ্রাহক</TableHead>
                      <TableHead>ফোন</TableHead>
                      <TableHead>ঠিকানা</TableHead>
                      <TableHead>মোট</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>তারিখ (BD টাইম)</TableHead>
                      <TableHead>অ্যাকশন</TableHead>
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
                        <TableCell className="max-w-xs truncate">{order.address || 'N/A'}</TableCell>
                        <TableCell>{formatPrice(Number(order.total))}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status || "pending"}
                            onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">অপেক্ষমান</SelectItem>
                              <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                              <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                              <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                              <SelectItem value="cancelled">বাতিল</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {formatBDTime(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderDetailsOpen(true);
                            }}
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

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  সমস্ত পণ্য ({totalProducts})
                </CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingProduct(null);
                      resetProductForm();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      নতুন পণ্য
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
                      </DialogTitle>
                      <DialogDescription>
                        পণ্যের বিস্তারিত তথ্য দিন। দুটি ছবি আপলোড সিস্টেম আছে।
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
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
                          <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
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
                          <Label htmlFor="price">দাম (টাকা) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock">স্টক *</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="main_image" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            প্রধান ছবির লিংক
                          </Label>
                          <Input
                            id="main_image"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                            placeholder="https://example.com/main-image.jpg"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="additional_images" className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            অতিরিক্ত ছবির লিংক (কমা দিয়ে আলাদা করুন)
                          </Label>
                          <Textarea
                            id="additional_images"
                            value={productForm.additional_images}
                            onChange={(e) => setProductForm({...productForm, additional_images: e.target.value})}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={productForm.is_featured}
                            onCheckedChange={(checked) => setProductForm({...productForm, is_featured: checked})}
                          />
                          <Label htmlFor="featured">ফিচার্ড</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="latest"
                            checked={productForm.is_latest}
                            onCheckedChange={(checked) => setProductForm({...productForm, is_latest: checked})}
                          />
                          <Label htmlFor="latest">নতুন</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="bestselling"
                            checked={productForm.is_best_selling}
                            onCheckedChange={(checked) => setProductForm({...productForm, is_best_selling: checked})}
                          />
                          <Label htmlFor="bestselling">জনপ্রিয়</Label>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                          {editingProduct ? "আপডেট করুন" : "যোগ করুন"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead>ক্যাটেগরি</TableHead>
                      <TableHead>দাম</TableHead>
                      <TableHead>স্টক</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>অ্যাকশন</TableHead>
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
                          <div className="flex flex-wrap gap-1">
                            {product.is_featured && <Badge variant="secondary">ফিচার্ড</Badge>}
                            {product.is_latest && <Badge variant="secondary">নতুন</Badge>}
                            {product.is_best_selling && <Badge variant="secondary">জনপ্রিয়</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
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
                                    onClick={() => deleteProductMutation.mutate(product.id)}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  ক্যাটেগরি ম্যানেজমেন্ট
                </CardTitle>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingCategory(null);
                      resetCategoryForm();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      নতুন ক্যাটেগরি
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "ক্যাটেগরি সম্পাদনা" : "নতুন ক্যাটেগরি যোগ করুন"}
                      </DialogTitle>
                      <DialogDescription>
                        ক্যাটেগরির বিস্তারিত তথ্য দিন।
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="catName">ক্যাটেগরির নাম (ইংরেজি)</Label>
                        <Input
                          id="catName"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="catNameBengali">ক্যাটেগরির নাম (বাংলা)</Label>
                        <Input
                          id="catNameBengali"
                          value={categoryForm.name_bengali}
                          onChange={(e) => setCategoryForm({...categoryForm, name_bengali: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="catDesc">বিবরণ</Label>
                        <Textarea
                          id="catDesc"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="catImage">ছবির লিংক</Label>
                        <Input
                          id="catImage"
                          value={categoryForm.image_url}
                          onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="catActive"
                          checked={categoryForm.is_active}
                          onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                        />
                        <Label htmlFor="catActive">সক্রিয়</Label>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                          {editingCategory ? "আপডেট করুন" : "যোগ করুন"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <div className="h-32 bg-gray-200 flex items-center justify-center">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{category.name_bengali}</h3>
                      <p className="text-sm text-gray-500 mb-1">({category.name})</p>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
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
                                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  মুছে ফেলুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  অফার ম্যানেজমেন্ট
                </CardTitle>
                <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingOffer(null);
                      resetOfferForm();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      নতুন অফার
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOffer ? "অফার সম্পাদনা" : "নতুন অফার যোগ করুন"}
                      </DialogTitle>
                      <DialogDescription>
                        অফারের বিস্তারিত তথ্য দিন।
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleOfferSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="offerTitle">অফারের শিরোনাম</Label>
                        <Input
                          id="offerTitle"
                          value={offerForm.title}
                          onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="offerDesc">বিবরণ</Label>
                        <Textarea
                          id="offerDesc"
                          value={offerForm.description}
                          onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discount">ছাড় (%)</Label>
                          <Input
                            id="discount"
                            type="number"
                            value={offerForm.discount_percentage}
                            onChange={(e) => setOfferForm({...offerForm, discount_percentage: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="popupDelay">পপআপ বিলম্ব (মিলি সেকেন্ড)</Label>
                          <Input
                            id="popupDelay"
                            type="number"
                            value={offerForm.popup_delay}
                            onChange={(e) => setOfferForm({...offerForm, popup_delay: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="offerImage">ছবির লিংক</Label>
                        <Input
                          id="offerImage"
                          value={offerForm.image_url}
                          onChange={(e) => setOfferForm({...offerForm, image_url: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isPopup"
                            checked={offerForm.is_popup}
                            onCheckedChange={(checked) => setOfferForm({...offerForm, is_popup: checked})}
                          />
                          <Label htmlFor="isPopup">পপআপ অফার</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="offerActive"
                            checked={offerForm.active}
                            onCheckedChange={(checked) => setOfferForm({...offerForm, active: checked})}
                          />
                          <Label htmlFor="offerActive">সক্রিয়</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createOfferMutation.isPending || updateOfferMutation.isPending}>
                          {editingOffer ? "আপডেট করুন" : "যোগ করুন"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <Card key={offer.id} className="overflow-hidden">
                    <div className="h-32 bg-gray-200 flex items-center justify-center">
                      {offer.image_url ? (
                        <img 
                          src={offer.image_url} 
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Gift className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{offer.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant="secondary">{offer.discount_percentage}% ছাড়</Badge>
                        <Badge variant={offer.active ? "default" : "secondary"}>
                          {offer.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditOffer(offer)}
                          className="flex-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
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
                                onClick={() => deleteOfferMutation.mutate(offer.id)}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  প্রোমো কোড ম্যানেজমেন্ট
                </CardTitle>
                <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingPromo(null);
                      resetPromoForm();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      নতুন প্রোমো কোড
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingPromo ? "প্রোমো কোড সম্পাদনা" : "নতুন প্রোমো কোড যোগ করুন"}
                      </DialogTitle>
                      <DialogDescription>
                        প্রোমো কোডের বিস্তারিত তথ্য দিন।
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePromoSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="promoCode">প্রোমো কোড</Label>
                        <Input
                          id="promoCode"
                          value={promoForm.code}
                          onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                          placeholder="SAVE20"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discountType">ছাড়ের ধরন</Label>
                          <Select value={promoForm.discount_type} onValueChange={(value) => setPromoForm({...promoForm, discount_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">শতাংশ</SelectItem>
                              <SelectItem value="fixed">নির্দিষ্ট পরিমাণ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="discountValue">
                            ছাড়ের পরিমাণ {promoForm.discount_type === "percentage" ? "(%)" : "(টাকা)"}
                          </Label>
                          <Input
                            id="discountValue"
                            type="number"
                            value={promoForm.discount_value}
                            onChange={(e) => setPromoForm({...promoForm, discount_value: Number(e.target.value)})}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minAmount">সর্বনিম্ন অর্ডার (টাকা)</Label>
                          <Input
                            id="minAmount"
                            type="number"
                            value={promoForm.min_order_amount}
                            onChange={(e) => setPromoForm({...promoForm, min_order_amount: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="usageLimit">ব্যবহারের সীমা</Label>
                          <Input
                            id="usageLimit"
                            type="number"
                            value={promoForm.usage_limit}
                            onChange={(e) => setPromoForm({...promoForm, usage_limit: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="expiryDate">মেয়াদ উত্তীর্ণের তারিখ</Label>
                        <Input
                          id="expiryDate"
                          type="datetime-local"
                          value={promoForm.expires_at}
                          onChange={(e) => setPromoForm({...promoForm, expires_at: e.target.value})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="promoActive"
                          checked={promoForm.is_active}
                          onCheckedChange={(checked) => setPromoForm({...promoForm, is_active: checked})}
                        />
                        <Label htmlFor="promoActive">সক্রিয়</Label>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createPromoMutation.isPending || updatePromoMutation.isPending}>
                          {editingPromo ? "আপডেট করুন" : "যোগ করুন"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>কোড</TableHead>
                      <TableHead>ছাড়</TableHead>
                      <TableHead>সর্বনিম্ন অর্ডার</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>মেয়াদ</TableHead>
                      <TableHead>অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.code}</TableCell>
                        <TableCell>
                          {promo.discount_type === "percentage" 
                            ? `${promo.discount_value}%` 
                            : `${formatPrice(Number(promo.discount_value))}`
                          }
                        </TableCell>
                        <TableCell>{formatPrice(Number(promo.min_order_amount || 0))}</TableCell>
                        <TableCell>
                          <Badge variant={promo.is_active ? "default" : "secondary"}>
                            {promo.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {promo.expires_at ? formatBDTime(promo.expires_at) : 'কোন মেয়াদ নেই'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPromo(promo)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
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
                                    onClick={() => deletePromoMutation.mutate(promo.id)}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                বিক্রয় বিশ্লেষণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">দৈনিক পরিসংখ্যান</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>আজকের অর্ডার:</span>
                      <span className="font-semibold">{orders.filter(order => 
                        order.created_at && new Date(order.created_at).toDateString() === new Date().toDateString()
                      ).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>আজকের আয়:</span>
                      <span className="font-semibold">{formatPrice(
                        orders.filter(order => 
                          order.created_at && new Date(order.created_at).toDateString() === new Date().toDateString()
                        ).reduce((sum, order) => sum + Number(order.total), 0)
                      )}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">স্টক সতর্কতা</h3>
                  <div className="space-y-2">
                    {products.filter(product => product.stock < 5).slice(0, 5).map(product => (
                      <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="destructive">{product.stock} বাকি</Badge>
                      </div>
                    ))}
                    {products.filter(product => product.stock < 5).length === 0 && (
                      <p className="text-sm text-gray-600">সব পণ্যের স্টক পর্যাপ্ত আছে</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Order Details Modal */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার বিবরণ</DialogTitle>
            <DialogDescription>
              সম্পূর্ণ অর্ডার তথ্য এবং কাস্টম নির্দেশনা
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Basic Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>অর্ডার ID</Label>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label>ট্র্যাকিং ID</Label>
                  <p className="font-medium">{selectedOrder.tracking_id}</p>
                </div>
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
                  <Label>অর্ডারের তারিখ (BD টাইম)</Label>
                  <p className="font-medium">{formatBDTime(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label>সম্পূর্ণ ঠিকানা</Label>
                <p className="font-medium bg-gray-50 p-3 rounded">{selectedOrder.address || 'N/A'}</p>
              </div>

              {/* Order Items */}
              <div>
                <Label>অর্ডার করা পণ্যসমূহ</Label>
                <div className="mt-2 border rounded-lg">
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
                      {selectedOrder.items && Array.isArray(selectedOrder.items) && (selectedOrder.items as Array<{name?: string, quantity?: number, price?: number}>).map((item, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.name || 'N/A'}</TableCell>
                          <TableCell>{item.quantity || 1}</TableCell>
                          <TableCell>{formatPrice(Number(item.price || 0))}</TableCell>
                          <TableCell>{formatPrice(Number(item.price || 0) * (item.quantity || 1))}</TableCell>
                        </TableRow>
                      ))}
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
              {selectedOrder.custom_images && Array.isArray(selectedOrder.custom_images) && (selectedOrder.custom_images as string[]).length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    আপলোড করা ছবি ({selectedOrder.custom_images.length}টি)
                  </Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(selectedOrder.custom_images as string[]).map((imageUrl: string, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Custom upload ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-gray-50">
                          <p className="text-xs text-gray-600">ছবি {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {selectedOrder.payment_info && (
                <div>
                  <Label>পেমেন্ট তথ্য</Label>
                  <div className="mt-2 bg-green-50 p-4 rounded-lg">
                    <pre className="text-sm">{JSON.stringify(selectedOrder.payment_info, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <Label>স্ট্যাটাস আপডেট করুন</Label>
                <Select
                  value={selectedOrder.status || "pending"}
                  onValueChange={(status) => updateOrderStatusMutation.mutate({ id: selectedOrder.id, status })}
                >
                  <SelectTrigger className="w-64 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">অপেক্ষমান</SelectItem>
                    <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                    <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                    <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                    <SelectItem value="cancelled">বাতিল</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
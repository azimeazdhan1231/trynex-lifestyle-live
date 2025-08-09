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
import { Plus, Edit2, Trash2, Eye, Package, Users, TrendingUp, Settings, Gift, Tag, BarChart3, DollarSign, ShoppingCart, Star, FileText, Globe } from "lucide-react";
import BlogManagement from "@/components/admin/blog-management";
import PagesManagement from "@/components/admin/pages-management";
import EnhancedSettings from "@/components/admin/enhanced-settings";
import UserManagement from "@/components/admin/user-management";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import { formatPrice } from "@/lib/constants";

// Gift-focused categories for the new system
const GIFT_CATEGORIES = [
  { value: 'gift-for-him', label: 'তার জন্য উপহার', englishLabel: 'Gift for Him' },
  { value: 'gift-for-her', label: 'তাঁর জন্য উপহার', englishLabel: 'Gift for Her' },
  { value: 'gift-for-couple', label: 'কাপলদের জন্য উপহার', englishLabel: 'Gift for Couple' },
  { value: 'for-mother', label: 'মায়ের জন্য', englishLabel: 'For Mother' },
  { value: 'for-father', label: 'বাবার জন্য', englishLabel: 'For Father' },
  { value: 'birthday-gifts', label: 'জন্মদিনের উপহার', englishLabel: 'Birthday Gifts' },
  { value: 'anniversary-gifts', label: 'বার্ষিকীর উপহার', englishLabel: 'Anniversary Gifts' },
  { value: 'wedding-gifts', label: 'বিয়ের উপহার', englishLabel: 'Wedding Gifts' },
  { value: 'festival-gifts', label: 'উৎসবের উপহার', englishLabel: 'Festival Gifts' },
  { value: 'kids-gifts', label: 'শিশুদের উপহার', englishLabel: 'Kids Gifts' }
];

// Order status matching tracking page
const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import EnhancedOrderDetailsModal from "@/components/EnhancedOrderDetailsModal";
import CustomOrderDetailsModal from "@/components/CustomOrderDetailsModal";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";
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

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [categoryForm, setCategoryForm] = useState({
    name: "", 
    name_bengali: "", 
    description: "", 
    image_url: "", 
    is_active: true, 
    sort_order: 0
  });

  const [offerForm, setOfferForm] = useState({
    title: "", 
    description: "", 
    image_url: "", 
    discount_percentage: 0, 
    min_order_amount: "", 
    button_text: "অর্ডার করুন", 
    button_link: "/products",
    is_popup: false, 
    popup_delay: 3000, 
    active: true, 
    expiry: ""
  });

  const [promoForm, setPromoForm] = useState({
    code: "", 
    description: "", 
    discount_type: "percentage", 
    discount_value: 0, 
    min_order_amount: 0, 
    usage_limit: 0, 
    expiry_date: "", 
    is_active: true
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
  const [selectedCustomOrder, setSelectedCustomOrder] = useState<any>(null);
  const [customOrderDetailsOpen, setCustomOrderDetailsOpen] = useState(false);

  // Fetch data with controlled polling and proper error handling
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"],
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({ 
    queryKey: ["/api/products"],
    staleTime: 300000, // 5 minutes
    refetchInterval: false, // Don't auto-refetch products
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"],
    staleTime: 600000, // 10 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: offers = [], isLoading: offersLoading, error: offersError } = useQuery<any[]>({ 
    queryKey: ["/api/offers"],
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: promoCodes = [], isLoading: promoLoading, error: promoError } = useQuery<PromoCode[]>({ 
    queryKey: ["/api/promo-codes"],
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: customOrders = [], isLoading: customOrdersLoading, error: customOrdersError } = useQuery<any[]>({ 
    queryKey: ["/api/custom-orders"],
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Handle errors silently
  if (ordersError) console.log("Orders loading failed");
  if (productsError) console.log("Products loading failed");
  if (categoriesError) console.log("Categories loading failed");
  if (offersError) console.log("Offers loading failed");
  if (promoError) console.log("Promo codes loading failed");
  if (customOrdersError) console.log("Custom orders loading failed");

  // Dashboard statistics with safe calculations
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: Order) => {
    const orderTotal = Number(order.total) || 0;
    return sum + orderTotal;
  }, 0) : 0;

  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const pendingOrders = Array.isArray(orders) ? orders.filter((order: Order) => order.status === "pending").length : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const lowStockProducts = Array.isArray(products) ? products.filter((product: Product) => (product.stock || 0) < 5).length : 0;
  const activePromoCodes = Array.isArray(promoCodes) ? promoCodes.filter((promo: PromoCode) => promo.is_active).length : 0;

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
      const response = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
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

  // Custom order status update mutation
  const updateCustomOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/custom-orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-orders"] });
      toast({ title: "কাস্টম অর্ডার আপডেট হয়েছে", description: "কাস্টম অর্ডারের স্ট্যাটাস আপডেট করা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "কাস্টম অর্ডার আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
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
      toast({ title: "ক্যাটাগরি যোগ হয়েছে", description: "নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে" });
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
      toast({ title: "ক্যাটাগরি আপডেট হয়েছে", description: "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "ক্যাটাগরি মুছে ফেলা হয়েছে", description: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে" });
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
      toast({ title: "অফার যোগ হয়েছে", description: "নতুন অফার সফলভাবে যোগ করা হয়েছে" });
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
      toast({ title: "অফার আপডেট হয়েছে", description: "অফার সফলভাবে আপডেট করা হয়েছে" });
    }
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({ title: "অফার মুছে ফেলা হয়েছে", description: "অফার সফলভাবে মুছে ফেলা হয়েছে" });
    }
  });

  // Helper functions
  const resetProductForm = () => {
    setProductForm({
      name: "", price: "", image_url: "", category: "", stock: 0, description: "",
      is_featured: false, is_latest: false, is_best_selling: false
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setProductForm(prev => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert file to base64 for storage
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "", name_bengali: "", description: "", image_url: "", is_active: true, sort_order: 0
    });
  };

  const resetOfferForm = () => {
    setOfferForm({
      title: "", description: "", image_url: "", discount_percentage: 0, 
      min_order_amount: "", button_text: "অর্ডার করুন", button_link: "/products",
      is_popup: false, popup_delay: 3000, active: true, expiry: ""
    });
  };

  const resetPromoForm = () => {
    setPromoForm({
      code: "", description: "", discount_type: "percentage", discount_value: 0, 
      min_order_amount: 0, usage_limit: 0, expiry_date: "", is_active: true
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
    setImagePreview(product.image_url || "");
    setSelectedImage(null);
    setIsProductDialogOpen(true);
  };

  const handleSubmitProduct = async () => {
    try {
      let finalProductForm = { ...productForm };

      // If there's a selected image, it's already converted to base64 in handleImageChange
      if (selectedImage && imagePreview) {
        finalProductForm.image_url = imagePreview;
      }

      const data = {
        ...finalProductForm,
        price: parseFloat(finalProductForm.price) || 0,
        stock: Number(finalProductForm.stock) || 0
      };

      if (editingProduct) {
        updateProductMutation.mutate(data);
      } else {
        createProductMutation.mutate(data);
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "পণ্য সেভ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
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

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
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

  const handleSubmitCategory = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate(categoryForm);
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই ক্যাটাগরিটি মুছে ফেলতে চান?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description || "",
      image_url: offer.image_url || "",
      discount_percentage: offer.discount_percentage || 0,
      min_order_amount: offer.min_order_amount?.toString() || "",
      button_text: offer.button_text || "অর্ডার করুন",
      button_link: offer.button_link || "/products",
      is_popup: offer.is_popup || false,
      popup_delay: offer.popup_delay || 3000,
      active: offer.active ?? true,
      expiry: offer.expiry ? new Date(offer.expiry).toISOString().split('T')[0] : ""
    });
    setIsOfferDialogOpen(true);
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm('এই অফার মুছে ফেলতে চান?')) {
      deleteOfferMutation.mutate(id);
    }
  };

  const handleSubmitOffer = async () => {
    const offerData = {
      ...offerForm,
      discount_percentage: Number(offerForm.discount_percentage),
      min_order_amount: offerForm.min_order_amount ? Number(offerForm.min_order_amount) : 0,
      popup_delay: Number(offerForm.popup_delay),
      expiry: offerForm.expiry ? new Date(offerForm.expiry).toISOString() : null
    };

    if (editingOffer) {
      updateOfferMutation.mutate(offerData);
    } else {
      createOfferMutation.mutate(offerData);
    }
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setProductForm({
        name: product.name,
        price: product.price.toString(),
        image_url: product.image_url || "",
        category: product.category || "",
        stock: product.stock,
        description: product.description || "",
        is_featured: product.is_featured || false,
        is_latest: product.is_latest || false,
        is_best_selling: product.is_best_selling || false,
      });
      setEditingProduct(product);
      // Clear any local file selections when editing
      setSelectedImage(null);
      setImagePreview("");
    } else {
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
      setSelectedImage(null);
      setImagePreview("");
    }
    setIsProductDialogOpen(true);
  };

  

  const handleViewCustomOrderDetails = (customOrder: any) => {
    setSelectedCustomOrder(customOrder);
    setCustomOrderDetailsOpen(true);
  };

  const handleUpdateCustomOrderStatus = (orderId: number, status: string) => {
    updateCustomOrderMutation.mutate({ id: orderId, status });
  };

  // Setup Gift Categories
  const handleSetupGiftCategories = async () => {
    if (confirm('এটি সব পুরনো ক্যাটাগরি মুছে দিয়ে গিফট ক্যাটাগরি সেটআপ করবে। এগিয়ে যেতে চান?')) {
      try {
        const response = await fetch('/api/setup-gift-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "✅ সফল!",
            description: "গিফট ক্যাটাগরি সেটআপ সম্পূর্ণ হয়েছে",
          });
          
          // Refresh categories and products
          queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Setup error:', error);
        toast({
          title: "❌ ত্রুটি",
          description: "গিফট ক্যাটাগরি সেটআপ করতে পারিনি",
          variant: "destructive"
        });
      }
    }
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
            <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-9 h-auto p-1 bg-gray-100 rounded-md">
              <TabsTrigger value="dashboard" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                ড্যাশবোর্ড
              </TabsTrigger>
              <TabsTrigger value="orders" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <ShoppingCart className="w-4 h-4 mr-1" />
                অর্ডার
              </TabsTrigger>
              <TabsTrigger value="custom-orders" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Star className="w-4 h-4 mr-1" />
                কাস্টম অর্ডার
              </TabsTrigger>
              <TabsTrigger value="products" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Package className="w-4 h-4 mr-1" />
                পণ্য
              </TabsTrigger>
              <TabsTrigger value="categories" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Tag className="w-4 h-4 mr-1" />
                ক্যাটাগরি
              </TabsTrigger>
              <TabsTrigger value="offers" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Gift className="w-4 h-4 mr-1" />
                অফার
              </TabsTrigger>
              <TabsTrigger value="promo-codes" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Tag className="w-4 h-4 mr-1" />
                প্রমো কোড
              </TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Users className="w-4 h-4 mr-1" />
                ব্যবহারকারী
              </TabsTrigger>
              <TabsTrigger value="blogs" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <FileText className="w-4 h-4 mr-1" />
                ব্লগ
              </TabsTrigger>
              <TabsTrigger value="pages" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Globe className="w-4 h-4 mr-1" />
                পেজ
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <Settings className="w-4 h-4 mr-1" />
                সেটিংস
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Dashboard Tab - Enhanced Analytics */}
        <TabsContent value="dashboard" className="space-y-4">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        {/* Dashboard Tab - Original Overview */}
        <TabsContent value="overview" className="space-y-4">
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
                <CardTitle className="text-sm font-medium">প্রমো কোড</CardTitle>
                <Tag className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{activePromoCodes}</div>
                <p className="text-xs text-gray-600">সক্রিয় প্রমো কোড</p>
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
                              {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
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
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Orders Tab */}
        <TabsContent value="custom-orders" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5" />
                কাস্টম অর্ডার ({Array.isArray(customOrders) ? customOrders.length : 0} টি)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customOrdersLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : customOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">কোনো কাস্টম অর্ডার নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>অর্ডার ID</TableHead>
                        <TableHead>গ্রাহক</TableHead>
                        <TableHead>পণ্য</TableHead>
                        <TableHead>কাস্টমাইজেশন</TableHead>
                        <TableHead>মোট</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customOrders.map((customOrder: any) => (
                        <TableRow key={customOrder.id}>
                          <TableCell className="font-mono text-xs">#{customOrder.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customOrder.customerName}</div>
                              <div className="text-xs text-gray-500">{customOrder.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customOrder.productName}</div>
                              <div className="text-xs text-gray-500">পরিমাণ: {customOrder.quantity}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {customOrder.selectedSize && (
                                <div className="text-xs bg-blue-100 px-2 py-1 rounded">সাইজ: {customOrder.selectedSize}</div>
                              )}
                              {customOrder.selectedColor && (
                                <div className="text-xs bg-green-100 px-2 py-1 rounded">রঙ: {customOrder.selectedColor}</div>
                              )}
                              {customOrder.hasCustomImages && (
                                <div className="text-xs bg-purple-100 px-2 py-1 rounded">ছবি: {customOrder.imageCount || 1} টি</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice(Number(customOrder.totalPrice))}</TableCell>
                          <TableCell>
                            <Select
                              value={customOrder.status || "pending"}
                              onValueChange={(value) => handleUpdateCustomOrderStatus(customOrder.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCustomOrderDetails(customOrder)}
                            >
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
                  পণ্য ম্যানেজমেন্ট ({totalProducts} টি পণ্য)
                </CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { openProductDialog(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      নতুন পণ্য
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
                      </DialogTitle>
                      {editingProduct && editingProduct.image_url && !editingProduct.image_url.startsWith('http') && (
                        <div className="bg-orange-100 p-3 rounded-lg border border-orange-200 mt-2">
                          <p className="text-sm text-orange-800">
                            ⚠️ এই পণ্যটি ডেটাবেস ইমেজ ব্যবহার করছে। পারফরমেন্সের জন্য ক্লাউড URL-এ পরিবর্তন করুন।
                          </p>
                        </div>
                      )}
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
                            {GIFT_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="product-image">পণ্যের ছবি</Label>
                        <div className="space-y-2">
                          <Input
                            id="product-image-file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                          <Input
                            id="image_url"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                            placeholder="অথবা ছবির URL দিন"
                          />
                          {(imagePreview || productForm.image_url) && (
                            <div className="mt-2">
                              <img
                                src={imagePreview || productForm.image_url}
                                alt="Product preview"
                                className="w-20 h-20 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
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
                                onClick={() => openProductDialog(product)}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  ক্যাটাগরি ম্যানেজমেন্ট ({Array.isArray(categories) ? categories.length : 0} টি)
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleSetupGiftCategories}
                    variant="default" 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    গিফট ক্যাটাগরি সেটআপ
                  </Button>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingCategory(null); resetCategoryForm(); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        নতুন ক্যাটাগরি
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cat-name">ক্যাটাগরি নাম (ইংরেজি)</Label>
                        <Input
                          id="cat-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Category name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-name-bn">ক্যাটাগরি নাম (বাংলা)</Label>
                        <Input
                          id="cat-name-bn"
                          value={categoryForm.name_bengali}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name_bengali: e.target.value }))}
                          placeholder="ক্যাটাগরির নাম"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-desc">বিবরণ</Label>
                        <Textarea
                          id="cat-desc"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="ক্যাটাগরির বিবরণ"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-image">ছবির লিংক</Label>
                        <Input
                          id="cat-image"
                          value={categoryForm.image_url}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="ছবির URL"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-order">সর্ট অর্ডার</Label>
                        <Input
                          id="cat-order"
                          type="number"
                          value={categoryForm.sort_order}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="cat-active"
                          checked={categoryForm.is_active}
                          onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="cat-active">সক্রিয়</Label>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSubmitCategory}
                          disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                          className="flex-1"
                        >
                          {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsCategoryDialogOpen(false)}
                          className="flex-1"
                        >
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : !Array.isArray(categories) || categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">কোনো ক্যাটাগরি নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ছবি</TableHead>
                        <TableHead>বাংলা নাম</TableHead>
                        <TableHead>ইংরেজি নাম</TableHead>
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
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.id!)}
                                disabled={deleteCategoryMutation.isPending}
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

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  অফার ম্যানেজমেন্ট ({Array.isArray(offers) ? offers.length : 0} টি)
                </CardTitle>
                <Button onClick={() => { setEditingOffer(null); resetOfferForm(); setIsOfferDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন অফার
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : !Array.isArray(offers) || offers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">কোনো অফার নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>শিরোনাম</TableHead>
                        <TableHead>ছাড় (%)</TableHead>
                        <TableHead>সর্বনিম্ন অর্ডার</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>পপআপ</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.title}</TableCell>
                          <TableCell>{offer.discount_percentage}%</TableCell>
                          <TableCell>{formatPrice(Number(offer.min_order_amount || 0))}</TableCell>
                          <TableCell>
                            <Badge variant={offer.active ? "secondary" : "destructive"}>
                              {offer.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={offer.is_popup ? "default" : "outline"}>
                              {offer.is_popup ? "পপআপ" : "স্ট্যাটিক"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditOffer(offer)}
                                data-testid={`button-edit-offer-${offer.id}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteOffer(offer.id)}
                                data-testid={`button-delete-offer-${offer.id}`}
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

        {/* Promo Codes Tab */}
        <TabsContent value="promo-codes" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  প্রমো কোড ম্যানেজমেন্ট ({Array.isArray(promoCodes) ? promoCodes.length : 0} টি)
                </CardTitle>
                <Button onClick={() => { setEditingPromo(null); resetPromoForm(); setIsPromoDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন প্রমো কোড
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {promoLoading ? (
                <div className="text-center py-8">লোড হচ্ছে...</div>
              ) : !Array.isArray(promoCodes) || promoCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">কোনো প্রমো কোড নেই</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>কোড</TableHead>
                        <TableHead>ছাড়</TableHead>
                        <TableHead>সর্বনিম্ন অর্ডার</TableHead>
                        <TableHead>ব্যবহার সীমা</TableHead>
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
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatPrice(promo.discount_value)}
                          </TableCell>
                          <TableCell>{formatPrice(promo.min_order_amount || 0)}</TableCell>
                          <TableCell>{promo.usage_limit || "সীমাহীন"}</TableCell>
                          <TableCell>
                            {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('bn-BD') : "সীমাহীন"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={promo.is_active ? "secondary" : "destructive"}>
                              {promo.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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

        {/* Users Tab - Enhanced Management */}
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        {/* Blog Management Tab */}
        <TabsContent value="blogs" className="space-y-4">
          <BlogManagement />
        </TabsContent>

        {/* Pages Management Tab */}
        <TabsContent value="pages" className="space-y-4">
          <PagesManagement />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                সিস্টেম সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">সাইট সেটিংস</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="site-name">সাইটের নাম</Label>
                      <Input id="site-name" defaultValue="Trynex Lifestyle" />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">যোগাযোগ নম্বর</Label>
                      <Input id="contact-phone" defaultValue="+8801XXXXXXXXX" />
                    </div>
                    <div>
                      <Label htmlFor="delivery-fee-dhaka">ঢাকার ডেলিভারি চার্জ</Label>
                      <Input id="delivery-fee-dhaka" type="number" defaultValue="80" />
                    </div>
                    <div>
                      <Label htmlFor="delivery-fee-outside">ঢাকার বাইরে ডেলিভারি চার্জ</Label>
                      <Input id="delivery-fee-outside" type="number" defaultValue="120" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">অ্যানালিটিক্স</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ga-id">Google Analytics ID</Label>
                      <Input id="ga-id" placeholder="G-XXXXXXXXXX" />
                    </div>
                    <div>
                      <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                      <Input id="fb-pixel" placeholder="XXXXXXXXXXXXXXX" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full sm:w-auto">
                    সেটিংস সেভ করুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab - Enhanced Settings */}
        <TabsContent value="settings" className="space-y-4">
          <EnhancedSettings />
        </TabsContent>
      </Tabs>

      {/* Enhanced Order Details Modal */}
      <EnhancedOrderDetailsModal
        isOpen={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        order={selectedOrder}
      />

      {/* Custom Order Details Modal */}
      <CustomOrderDetailsModal
        isOpen={customOrderDetailsOpen}
        onClose={() => setCustomOrderDetailsOpen(false)}
        order={selectedCustomOrder}
      />

      {/* Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? "অফার এডিট করুন" : "নতুন অফার যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer-title">শিরোনাম *</Label>
              <Input
                id="offer-title"
                value={offerForm.title}
                onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                placeholder="অফারের শিরোনাম লিখুন"
                data-testid="input-offer-title"
              />
            </div>
            
            <div>
              <Label htmlFor="offer-description">বিবরণ</Label>
              <Textarea
                id="offer-description"
                value={offerForm.description}
                onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                placeholder="অফারের বিবরণ লিখুন"
                data-testid="input-offer-description"
              />
            </div>
            
            <div>
              <Label htmlFor="offer-discount">ছাড়ের পরিমাণ (%)</Label>
              <Input
                id="offer-discount"
                type="number"
                value={offerForm.discount_percentage}
                onChange={(e) => setOfferForm({...offerForm, discount_percentage: Number(e.target.value)})}
                placeholder="0"
                min="0"
                max="100"
                data-testid="input-offer-discount"
              />
            </div>
            
            <div>
              <Label htmlFor="offer-min-amount">সর্বনিম্ন অর্ডার (৳)</Label>
              <Input
                id="offer-min-amount"
                type="number"
                value={offerForm.min_order_amount}
                onChange={(e) => setOfferForm({...offerForm, min_order_amount: e.target.value})}
                placeholder="0"
                min="0"
                data-testid="input-offer-min-amount"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="offer-popup"
                checked={offerForm.is_popup}
                onCheckedChange={(checked) => setOfferForm({...offerForm, is_popup: checked})}
                data-testid="switch-offer-popup"
              />
              <Label htmlFor="offer-popup">পপআপ হিসেবে দেখান</Label>
            </div>
            
            {offerForm.is_popup && (
              <div>
                <Label htmlFor="popup-delay">পপআপ দেরি (মিলিসেকেন্ড)</Label>
                <Input
                  id="popup-delay"
                  type="number"
                  value={offerForm.popup_delay}
                  onChange={(e) => setOfferForm({...offerForm, popup_delay: Number(e.target.value)})}
                  placeholder="3000"
                  min="1000"
                  data-testid="input-popup-delay"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="offer-active"
                checked={offerForm.active}
                onCheckedChange={(checked) => setOfferForm({...offerForm, active: checked})}
                data-testid="switch-offer-active"
              />
              <Label htmlFor="offer-active">সক্রিয়</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmitOffer}
                disabled={!offerForm.title || createOfferMutation.isPending || updateOfferMutation.isPending}
                className="flex-1"
                data-testid="button-submit-offer"
              >
                {createOfferMutation.isPending || updateOfferMutation.isPending ? "সেভ হচ্ছে..." : 
                 editingOffer ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOfferDialogOpen(false)}
                className="flex-1"
                data-testid="button-cancel-offer"
              >
                বাতিল
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
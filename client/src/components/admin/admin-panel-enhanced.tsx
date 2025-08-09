import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, PlusCircle, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, ImageIcon, Phone, MapPin, Clock, Download,
  RefreshCw, Search, Filter, ChevronLeft, ChevronRight, ExternalLink
} from "lucide-react";
// Types defined locally to avoid import issues
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
  is_active?: boolean;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  address?: string;
  status: string;
  total: string | number;
  items: any[];
  custom_instructions?: string;
  custom_images?: any[];
  created_at: string;
}

const ORDER_STATUSES = {
  pending: "অপেক্ষমান",
  processing: "প্রক্রিয়াধীন", 
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল"
};

// Enhanced Stats Component
function DashboardStats() {
  const { data: orders = [] } = useQuery({ queryKey: ["/api/orders"] });
  const { data: products = [] } = useQuery({ queryKey: ["/api/products"] });

  const stats = React.useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.total) || 0);
    }, 0);
    const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
    const lowStockProducts = products.filter((product: any) => product.stock < 10).length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      totalProducts: products.length
    };
  }, [orders, products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">সর্বমোট অর্ডার সংখ্যা</p>
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
          <CardTitle className="text-sm font-medium">অপেক্ষমান অর্ডার</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">প্রক্রিয়াকরণের জন্য অপেক্ষমান</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">কম স্টক</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">১০টির কম স্টক</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Order Details Modal
function OrderDetailsModal({ isOpen, onClose, order }: any) {
  const [newStatus, setNewStatus] = useState(order?.status || 'pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      console.log(`🔄 Updating order ${orderId} to status: ${status}`);
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data, variables) => {
      console.log('✅ Status update successful:', data);
      toast({
        title: "সফল!",
        description: `অর্ডার স্ট্যাটাস "${ORDER_STATUSES[variables.status as keyof typeof ORDER_STATUSES] || variables.status}" এ আপডেট হয়েছে`,
      });
      
      // Optimistic updates
      queryClient.setQueryData(["/api/orders"], (old: any[]) => {
        if (!old) return old;
        return old.map(item => 
          item.id === variables.orderId 
            ? { ...item, status: variables.status }
            : item
        );
      });
      
      // Refetch after a short delay to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      }, 500);
      
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Status update failed:', error);
      toast({
        title: "ত্রুটি!",
        description: error?.message || "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

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

  // Parse custom images safely
  const customImages = (() => {
    try {
      if (!order.custom_images) return [];
      if (Array.isArray(order.custom_images)) return order.custom_images;
      if (typeof order.custom_images === 'string') return JSON.parse(order.custom_images);
      return [];
    } catch {
      return [];
    }
  })();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka'
      });
    } catch {
      return 'তারিখ পাওয়া যায়নি';
    }
  };

  const handleStatusUpdate = () => {
    if (order.id && newStatus && newStatus !== order.status) {
      updateStatusMutation.mutate({ 
        orderId: order.id, 
        status: newStatus 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            অর্ডার বিস্তারিত - #{order.tracking_id}
          </DialogTitle>
          <DialogDescription>
            অর্ডার তৈরি: {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                কাস্টমার তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{order.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{order.district}, {order.thana}</span>
              </div>
              {order.address && (
                <div className="text-sm text-gray-600">
                  <strong>ঠিকানা:</strong> {order.address}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                অর্ডার স্ট্যাটাস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                  {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status-select">স্ট্যাটাস পরিবর্তন করুন</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={updateStatusMutation.isPending || newStatus === order.status}
                  className="w-full"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      আপডেট হচ্ছে...
                    </>
                  ) : (
                    "স্ট্যাটাস আপডেট করুন"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              অর্ডার আইটেম
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.length > 0 ? (
                orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name || item.product_name}</h4>
                      <p className="text-sm text-gray-600">
                        পরিমাণ: {item.quantity} × {formatPrice(Number(item.price || item.product_price || 0))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(Number(item.quantity || 1) * Number(item.price || item.product_price || 0))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">কোন আইটেম পাওয়া যায়নি</p>
              )}
              
              {/* Total */}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>মোট:</span>
                <span>{formatPrice(Number(order.total || 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        {order.custom_instructions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                কাস্টম নির্দেশনা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                {order.custom_instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Custom Images */}
        {customImages && customImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                আপলোড করা ছবি ({customImages.length}টি)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {customImages.map((image: any, index: number) => {
                  const imageUrl = image?.url || image?.dataUrl || image?.data || image?.src || (typeof image === 'string' ? image : '');
                  
                  if (!imageUrl) {
                    return null;
                  }
                  
                  return (
                    <div key={index} className="relative group">
                      <img 
                        src={imageUrl}
                        alt={`কাস্টম ছবি ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Orders Management
function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order: any) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Dhaka'
      });
    } catch {
      return 'N/A';
    }
  };

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">অর্ডার লোড করতে সমস্যা</h3>
            <p className="text-gray-600 mb-4">অর্ডারের তথ্য লোড করতে সমস্যা হয়েছে</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>অর্ডার ফিল্টার</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">অনুসন্ধান</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="নাম, ফোন বা ট্র্যাকিং ID দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">স্ট্যাটাস ফিল্টার</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব অর্ডার</SelectItem>
                  {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={() => refetch()} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                রিফ্রেশ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>অর্ডার তালিকা ({filteredOrders.length}টি)</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ট্র্যাকিং ID</TableHead>
                  <TableHead>কাস্টমার</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>মোট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      অর্ডার লোড হচ্ছে...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      কোন অর্ডার পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.tracking_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer_name}
                      </TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(Number(order.total || 0))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'shipped' ? 'secondary' :
                          order.status === 'processing' ? 'outline' : 'destructive'
                        }>
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOrderModal(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        order={selectedOrder}
      />
    </div>
  );
}

// Enhanced Products Management
function ProductsManagement() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: products = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const { data: categories = [] } = useQuery({ queryKey: ["/api/categories"] });

  const filteredProducts = React.useMemo(() => {
    return products.filter((product: any) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">পণ্য লোড করতে সমস্যা</h3>
            <p className="text-gray-600 mb-4">পণ্যের তথ্য লোড করতে সমস্যা হয়েছে</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Add Button */}
      <Card>
        <CardHeader>
          <CardTitle>পণ্য ব্যবস্থাপনা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product-search">অনুসন্ধান</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="product-search"
                  placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category-filter">ক্যাটেগরি ফিল্টার</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={() => refetch()} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                রিফ্রেশ
              </Button>
            </div>

            <div className="flex items-end">
              <Button onClick={() => setIsAddModalOpen(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                নতুন পণ্য
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">কোন পণ্য পাওয়া যায়নি</h3>
            <p className="text-gray-600">নতুন পণ্য যোগ করুন বা ফিল্টার পরিবর্তন করুন</p>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className="absolute top-2 right-2"
                  variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                >
                  স্টক: {product.stock}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(Number(product.price))}
                  </span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="outline" className="px-3">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Main Admin Panel Component
export default function EnhancedAdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">অ্যাডমিন প্যানেল</h1>
          <p className="text-gray-600">TryneX Shop ব্যবস্থাপনা</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="products">পণ্য</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrdersManagement />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>দ্রুত অ্যাকশন</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => setActiveTab("orders")}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    অর্ডার ব্যবস্থাপনা
                  </Button>
                  <Button className="w-full justify-start" onClick={() => setActiveTab("products")}>
                    <Package className="w-4 h-4 mr-2" />
                    পণ্য ব্যবস্থাপনা
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    রিপোর্ট দেখুন
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>সাইট সেটিংস</CardTitle>
                <CardDescription>আপনার সাইটের মূল সেটিংস পরিবর্তন করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">সেটিংস প্যানেল শীঘ্রই আসছে...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
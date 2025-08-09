import React, { useState, useMemo } from "react";
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
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, Users, TrendingUp, ShoppingCart, Star, DollarSign, Plus, Pencil, Trash2, Eye,
  BarChart3, Gift, Tag, PlusCircle, Calendar, AlertTriangle, FileText, Settings, 
  MessageSquare, Award, Palette, Megaphone, RefreshCw, Search, Filter, Phone, MapPin, Clock,
  CheckCircle, XCircle
} from "lucide-react";


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

// Product Form Modal
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

  // Create proper default values
  const getDefaultValues = React.useCallback(() => ({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    stock: product?.stock || 0,
    category: product?.category || "",
    image_url: product?.image_url || "",
    is_featured: product?.is_featured || false,
    is_latest: product?.is_latest || false,
    is_best_selling: product?.is_best_selling || false
  }), [product]);

  const form = useForm({
    defaultValues: getDefaultValues()
  });

  // Reset form when product changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, product, form, getDefaultValues]);

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

      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock) || 0,
        name: data.name.trim(),
        description: data.description?.trim() || "",
        category: data.category.trim(),
        image_url: data.image_url?.trim() || ""
      };

      console.log('Submitting product data:', productData);

      if (product?.id) {
        // Update existing product
        await apiRequest("PUT", `/api/products/${product.id}`, productData);
        toast({ title: "পণ্য আপডেট সফল", description: "পণ্যের তথ্য সফলভাবে আপডেট হয়েছে।" });
      } else {
        // Create new product
        await apiRequest("POST", "/api/products", productData);
        toast({ title: "পণ্য যোগ সফল", description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে।" });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onSave();
      onClose();
      form.reset();
    } catch (error) {
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
      <DialogContent 
        className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto"
        data-testid="product-form-modal"
      >
        <DialogHeader>
          <DialogTitle>{product ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}</DialogTitle>
          <DialogDescription>
            পণ্যের বিস্তারিত তথ্য দিন। সকল ক্ষেত্র পূরণ করুন।
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">পণ্যের নাম *</Label>
              <Input
                id="name"
                {...form.register("name", { required: "পণ্যের নাম প্রয়োজন" })}
                placeholder="পণ্যের নাম লিখুন"
                data-testid="input-product-name"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="category">ক্যাটেগরি *</Label>
              <Select 
                value={form.watch("category")} 
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm mt-1">ক্যাটেগরি নির্বাচন করুন</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              {...form.register("description", { required: "পণ্যের বিবরণ প্রয়োজন" })}
              rows={3}
              placeholder="পণ্যের বিস্তারিত বিবরণ"
              data-testid="textarea-description"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">দাম (টাকা) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("price", { 
                  required: "দাম প্রয়োজন",
                  min: { value: 0, message: "দাম ০ বা তার বেশি হতে হবে" },
                  valueAsNumber: true
                })}
                placeholder="0.00"
                data-testid="input-price"
              />
              {form.formState.errors.price && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="stock">স্টক *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...form.register("stock", { 
                  required: "স্টক সংখ্যা প্রয়োজন",
                  min: { value: 0, message: "স্টক ০ বা তার বেশি হতে হবে" },
                  valueAsNumber: true
                })}
                placeholder="0"
                data-testid="input-stock"
              />
              {form.formState.errors.stock && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">ইমেজ URL</Label>
            <Input
              id="image_url"
              {...form.register("image_url")}
              placeholder="https://example.com/image.jpg"
              data-testid="input-image-url"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={form.watch("is_featured")}
                onCheckedChange={(checked) => form.setValue("is_featured", checked)}
                data-testid="switch-featured"
              />
              <Label htmlFor="is_featured">ফিচার্ড পণ্য</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_latest"
                checked={form.watch("is_latest")}
                onCheckedChange={(checked) => form.setValue("is_latest", checked)}
                data-testid="switch-latest"
              />
              <Label htmlFor="is_latest">নতুন পণ্য</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_best_selling"
                checked={form.watch("is_best_selling")}
                onCheckedChange={(checked) => form.setValue("is_best_selling", checked)}
                data-testid="switch-best-selling"
              />
              <Label htmlFor="is_best_selling">বেস্ট সেলার</Label>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              বাতিল
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="button-save-product">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {product ? "আপডেট হচ্ছে..." : "সেভ হচ্ছে..."}
                </>
              ) : (
                <>
                  {product ? "আপডেট করুন" : "সেভ করুন"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Products Management Component
function ProductsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/products"],
    retry: 3,
    staleTime: 30000,
  });

  const { data: categories = [] } = useQuery({ 
    queryKey: ["/api/categories"],
    retry: 3,
    staleTime: 30000,
  });

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return products.filter((product: any) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({ title: "পণ্য মুছে ফেলা হয়েছে", description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে।" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({ 
        title: "ত্রুটি", 
        description: "পণ্য মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = (product: any) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${product.name}" পণ্যটি মুছে ফেলতে চান?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleFormSave = () => {
    refetch();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">পণ্য লোড করতে সমস্যা</h3>
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
          <CardDescription>আপনার সব পণ্য এক জায়গায় দেখুন ও পরিচালনা করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product-search">অনুসন্ধান</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="product-search"
                  placeholder="পণ্যের নাম..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-product-search"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category-filter">ক্যাটেগরি ফিল্টার</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  {PRODUCT_CATEGORIES.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-refresh-products"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAdd} 
                className="w-full"
                data-testid="button-add-product"
              >
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
            <p className="text-gray-600 mb-4">নতুন পণ্য যোগ করুন বা ফিল্টার পরিবর্তন করুন</p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন পণ্য যোগ করুন
            </Button>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden" data-testid={`card-product-${product.id}`}>
              <div className="relative">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
                  }}
                />
                <Badge 
                  className="absolute top-2 right-2"
                  variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                >
                  স্টক: {product.stock || 0}
                </Badge>
                {product.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500">ফিচার্ড</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name || 'নাম নেই'}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || 'বিবরণ নেই'}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(Number(product.price) || 0)}
                  </span>
                  <Badge variant="outline">{product.category || 'ক্যাটেগরি নেই'}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    সম্পাদনা
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(product)}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ProductFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        product={editingProduct}
        onSave={handleFormSave}
      />
    </div>
  );
}

// Orders Management Component  
function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>অর্ডার ব্যবস্থাপনা</CardTitle>
          <CardDescription>সকল অর্ডার দেখুন ও পরিচালনা করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="order-search">অনুসন্ধান</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="order-search"
                  placeholder="নাম, ফোন বা ট্র্যাকিং ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-order-search"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">স্ট্যাটাস ফিল্টার</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
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
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
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
                          data-testid={`button-view-order-${order.id}`}
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
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={closeOrderModal}
          order={selectedOrder}
          onStatusUpdate={refetch}
        />
      )}
    </div>
  );
}

// Order Details Modal with Fixed Image Display
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
  const [newStatus, setNewStatus] = useState(order?.status || 'pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
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
    onSuccess: () => {
      toast({ title: "স্ট্যাটাস আপডেট সফল", description: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে।" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    },
    onError: (error) => {
      console.error("Status update error:", error);
      toast({ 
        title: "ত্রুটি", 
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  });

  // Parse order items safely
  let orderItems = [];
  try {
    orderItems = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
  } catch (error) {
    console.error('Error parsing order items:', error);
    orderItems = [];
  }

  // Parse custom images safely
  let customImages = [];
  try {
    customImages = Array.isArray(order.custom_images) ? order.custom_images : JSON.parse(order.custom_images || '[]');
  } catch (error) {
    console.error('Error parsing custom images:', error);
    customImages = [];
  }

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
      <DialogContent 
        className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto"
        data-testid="order-details-modal"
      >
        <DialogHeader>
          <DialogTitle>অর্ডার বিস্তারিত - #{order.tracking_id}</DialogTitle>
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
              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
              </Badge>
              
              <div className="space-y-2">
                <Label>স্ট্যাটাস পরিবর্তন করুন</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
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

        {/* Fixed Custom Images Display */}
        {customImages && customImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                আপলোড করা ছবি ({customImages.length}টি)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {customImages.map((image: any, index: number) => {
                  // Handle different image formats properly
                  let imageUrl = '';
                  
                  if (typeof image === 'string') {
                    imageUrl = image;
                  } else if (image && typeof image === 'object') {
                    // Check for various possible properties
                    imageUrl = image.url || image.dataUrl || image.data || image.src || '';
                  }
                  
                  // Skip if no valid URL found
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
                          console.error('Image failed to load:', imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  );
                })}
              </div>
              {customImages.every((image: any) => {
                const imageUrl = typeof image === 'string' ? image : (image?.url || image?.dataUrl || image?.data || image?.src || '');
                return !imageUrl;
              }) && (
                <p className="text-gray-500 text-center py-4">কোন বৈধ ছবি পাওয়া যায়নি</p>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Panel Component
export default function AdminPanelFixed() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">ড্যাশবোর্ড</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 text-xs sm:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">অর্ডার</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2 text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">পণ্য</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">বিশ্লেষণ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">সেটিংস</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">37</div>
                <p className="text-xs text-muted-foreground">সর্বমোট অর্ডার সংখ্যা</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{formatPrice(145600)}</div>
                <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">আজকের অর্ডার</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">আয়: {formatPrice(8500)}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32</div>
                <p className="text-xs text-muted-foreground">মোট পণ্য সংখ্যা</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  অর্ডার স্ট্যাটাস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">অপেক্ষমান</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">প্রক্রিয়াধীন</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ডেলিভার সম্পন্ন</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">17</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  স্টক সতর্কতা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">কম স্টক (১০ এর কম)</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">স্টক নেই</span>
                    </div>
                    <Badge variant="destructive">2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductsManagement />
        </TabsContent>

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

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>সাইট সেটিংস</CardTitle>
              <CardDescription>শীঘ্রই আসছে</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">সাইট সেটিংস শীঘ্রই উপলব্ধ হবে</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
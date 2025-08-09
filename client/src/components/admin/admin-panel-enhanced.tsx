import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { formatPrice } from "@/lib/constants";
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
  CheckCircle, XCircle, X
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

// Fix Descriptions Component
function FixDescriptionsButton({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);

  const fixDescriptions = async () => {
    setIsFixing(true);
    try {
      const response = await fetch('/api/admin/fix-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Fix failed');
      }
      
      const result = await response.json();
      toast({ 
        title: "বিবরণ আপডেট সফল", 
        description: `${result.updated} টি পণ্যের বিবরণ আপডেট হয়েছে` 
      });
      
      onComplete();
    } catch (error) {
      toast({ 
        title: "ত্রুটি", 
        description: "বিবরণ আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      onClick={fixDescriptions}
      disabled={isFixing}
      variant="outline"
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      {isFixing ? "আপডেট হচ্ছে..." : "বিবরণ ফিক্স করুন"}
    </Button>
  );
}

// Enhanced Product Form Modal with Perfect Form Handling
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

  // Enhanced form with perfect default value handling
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

  // Reset form when product changes or modal opens with proper values
  React.useEffect(() => {
    if (isOpen) {
      if (product) {
        console.log("🔍 ProductFormModal: Loading product data:", product);
        
        // Handle description properly - it might be null or undefined
        const description = product.description || "";
        console.log("📝 Description being loaded:", description);
        
        form.reset({
          name: product.name || "",
          description: description,
          price: product.price?.toString() || "",
          stock: Number(product.stock) || 0,
          category: product.category || "",
          image_url: product.image_url || "",
          is_featured: Boolean(product.is_featured),
          is_latest: Boolean(product.is_latest),
          is_best_selling: Boolean(product.is_best_selling)
        });
        
        console.log("✅ Form reset with values:", form.getValues());
      } else {
        // Default template for new products with standard delivery info
        const defaultDescription = `পণ্যের বিবরণ:
এই পণ্যটি একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে। আমাদের সকল পণ্য যত্নসহকারে নির্বাচিত এবং মান নিয়ন্ত্রিত।

ডেলিভারি তথ্য:
• ঢাকায় ডেলিভারি চার্জ: ৮০ টাকা
• ঢাকার বাইরে: ৮০-১৩০ টাকা
• ডেলিভারি সময়: ২-৩ কার্যদিবস
• অগ্রিম পেমেন্ট প্রয়োজন`;

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

      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock) || 0,
        name: data.name.trim(),
        description: data.description?.trim() || "",
        category: data.category.trim(),
        image_url: data.image_url?.trim() || ""
      };

      if (product?.id) {
        await apiRequest("PUT", `/api/products/${product.id}`, productData);
        toast({ title: "পণ্য আপডেট সফল", description: "পণ্যের তথ্য সফলভাবে আপডেট হয়েছে।" });
      } else {
        await apiRequest("POST", "/api/products", productData);
        toast({ title: "পণ্য যোগ সফল", description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে।" });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[95vw] max-w-3xl max-h-[95vh] overflow-y-auto"
        data-testid="product-form-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {product ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
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
                data-testid="input-product-name"
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
                <p className="text-red-500 text-sm">ক্যাটেগরি নির্বাচন করুন</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">পণ্যের বিবরণ ও ডেলিভারি তথ্য</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={8}
              placeholder="পণ্যের বিস্তারিত বিবরণ ও ডেলিভারি তথ্য লিখুন..."
              data-testid="textarea-description"
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              বিবরণ, বৈশিষ্ট্য, ডেলিভারি চার্জ ও সময় অন্তর্ভুক্ত করুন
            </p>
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
                data-testid="input-price"
              />
              {form.formState.errors.price && (
                <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
              )}
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
                data-testid="input-stock"
              />
              {form.formState.errors.stock && (
                <p className="text-red-500 text-sm">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">ইমেজ URL</Label>
            <Input
              id="image_url"
              {...form.register("image_url")}
              placeholder="https://example.com/image.jpg"
              data-testid="input-image-url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="button-save-product">
              {isLoading ? "সেভ হচ্ছে..." : product ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Products Management with Fixed Filtering
function ProductsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { data: products = [], isLoading, refetch } = useQuery({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000,
  });

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product: any) => {
      const matchesSearch = !searchQuery || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("DELETE", `/api/products/${productId}`);
      return response;
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

  const confirmDelete = () => {
    if (deleteProductId) {
      deleteMutation.mutate(deleteProductId);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Enhanced Search and Filter */}
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
        
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            ফিল্টার
            {(searchQuery || categoryFilter) && (
              <Badge variant="secondary" className="ml-2">
                {(searchQuery ? 1 : 0) + (categoryFilter ? 1 : 0)}
              </Badge>
            )}
          </Button>
          
          {isFilterOpen && (
            <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">ফিল্টার অপশন</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ক্যাটেগরি</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="সব ক্যাটেগরি" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">সব ক্যাটেগরি</SelectItem>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    ক্লিয়ার করুন
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1"
                  >
                    প্রয়োগ করুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>পণ্য লোড হচ্ছে...</p>
            </div>
          ) : (
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
                        {searchQuery || categoryFilter 
                          ? "কোন পণ্য খুঁজে পাওয়া যায়নি"
                          : "কোন পণ্য নেই"
                        }
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
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-${product.id}`}
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
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSave={() => {
          refetch();
          setSelectedProduct(null);
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
              onClick={confirmDelete}
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

// Enhanced Order Details Modal
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
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
    onError: (error: any) => {
      toast({ 
        title: "ত্রুটি", 
        description: `স্ট্যাটাস আপডেট করতে সমস্যা: ${error.message}`,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  const handleStatusUpdate = (newStatus: string) => {
    if (order?.id) {
      setIsUpdating(true);
      updateStatusMutation.mutate({ orderId: order.id, status: newStatus });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto"
        data-testid="order-details-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            অর্ডার বিস্তারিত - #{order.id?.slice(0, 8)}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            অর্ডারের সম্পূর্ণ তথ্য ও স্ট্যাটাস আপডেট করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">অর্ডার স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ORDER_STATUSES).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={order.status === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(key)}
                    disabled={isUpdating || updateStatusMutation.isPending}
                    data-testid={`button-status-${key}`}
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
              <CardTitle className="text-lg">গ্রাহক তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">নাম</Label>
                  <p className="mt-1">{order.customer_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ফোন</Label>
                  <p className="mt-1">{order.customer_phone || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">ঠিকানা</Label>
                  <p className="mt-1">{order.delivery_address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">অর্ডার আইটেম</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items && JSON.parse(order.items).map((item: any, index: number) => (
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Instructions */}
          {order.custom_instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">কাস্টম নির্দেশনা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{order.custom_instructions}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Images */}
          {order.custom_images && JSON.parse(order.custom_images).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">কাস্টম আপলোডেড ফটো</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {JSON.parse(order.custom_images).map((image: any, index: number) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img 
                        src={image.url || image} 
                        alt={`Custom upload ${index + 1}`}
                        className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // Open image in new tab for full view
                          window.open(image.url || image, '_blank');
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground">
                          আপলোড #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  ছবিতে ক্লিক করে বড় আকারে দেখুন
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">পেমেন্ট তথ্য</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">অর্ডার তথ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">অর্ডার তারিখ</Label>
                    <p>{new Date(order.created_at).toLocaleString('bn-BD', {
                      timeZone: 'Asia/Dhaka',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">পেমেন্ট পদ্ধতি</Label>
                    <p>{order.payment_method || "ক্যাশ অন ডেলিভারি"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">বর্তমান স্ট্যাটাস</Label>
                    <Badge variant="secondary">{ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

// Main Enhanced Admin Panel
export default function AdminPanelEnhanced() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const { data: orders = [], refetch } = useQuery({ 
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const { data: products = [] } = useQuery({ 
    queryKey: ["/api/products"],
    refetchInterval: 60000,
  });

  const handleOrderView = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  };

  // Dashboard Stats
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
    const processingOrders = orderArray.filter((order: any) => order.status === 'processing').length;
    const deliveredOrders = orderArray.filter((order: any) => order.status === 'delivered').length;
    const lowStockProducts = productArray.filter((product: any) => product.stock < 10).length;
    const outOfStockProducts = productArray.filter((product: any) => product.stock === 0).length;

    return {
      totalOrders,
      totalRevenue,
      todayOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: productArray.length
    };
  }, [orders, products]);

  return (
    <div className="w-full space-y-6 admin-panel">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-8">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">সর্বমোট অর্ডার</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg lg:text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">আজকের অর্ডার</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayOrders}</div>
                <p className="text-xs text-muted-foreground">আজকের নতুন অর্ডার</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
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
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {stats.pendingOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">প্রক্রিয়াধীন</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {stats.processingOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ডেলিভার সম্পন্ন</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      {stats.deliveredOrders}
                    </Badge>
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
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                      {stats.lowStockProducts}
                    </Badge>
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

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">অর্ডার ব্যবস্থাপনা</h2>
              <p className="text-muted-foreground">সব অর্ডার দেখুন ও পরিচালনা করুন</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
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
                            <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
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
                            onClick={() => handleOrderView(order)}
                            data-testid={`button-view-order-${order.id}`}
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={closeOrderModal}
        order={selectedOrder}
        onStatusUpdate={refetch}
      />
    </div>
  );
}
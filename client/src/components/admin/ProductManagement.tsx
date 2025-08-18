import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  Star,
  Zap,
  TrendingUp,
  Image as ImageIcon,
  RefreshCw,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "পণ্যের নাম আবশ্যক"),
  price: z.string().min(1, "দাম আবশ্যক"),
  category: z.string().min(1, "ক্যাটাগরি আবশ্যক"),
  stock: z.number().min(0, "স্টক ০ বা তার বেশি হতে হবে"),
  description: z.string().optional(),
  image_url: z.string().url("সঠিক URL দিন").optional().or(z.literal("")),
  is_featured: z.boolean().default(false),
  is_latest: z.boolean().default(false),
  is_best_selling: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  price: string;
  image_url: string;
  category: string;
  stock: number;
  description: string;
  is_featured: boolean;
  is_latest: boolean;
  is_best_selling: boolean;
  created_at: string;
}

export default function ProductManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  const {
    data: categories,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Add Product Form
  const addForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "",
      stock: 0,
      description: "",
      image_url: "",
      is_featured: false,
      is_latest: false,
      is_best_selling: false,
    },
  });

  // Edit Product Form
  const editForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      return apiRequest('/api/products', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "নতুন পণ্য যোগ করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: "পণ্য যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      return apiRequest(`/api/products/${id}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "পণ্য আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: "পণ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/products/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "পণ্য মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: "পণ্য মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProduct = (data: ProductFormData) => {
    addProductMutation.mutate(data);
  };

  const handleUpdateProduct = (data: ProductFormData) => {
    if (selectedProduct) {
      updateProductMutation.mutate({
        id: selectedProduct.id,
        data
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    editForm.reset({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured,
      is_latest: product.is_latest,
      is_best_selling: product.is_best_selling,
    });
    setIsEditDialogOpen(true);
  };

  const uniqueCategories = Array.from(new Set(products?.map(p => p.category) || []));

  if (productsLoading || categoriesLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          পণ্য লোড করতে সমস্যা হয়েছে
          <Button onClick={() => refetchProducts()} className="ml-4">
            পুনরায় চেষ্টা
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">পণ্য ব্যবস্থাপনা</h1>
          <p className="text-gray-600">সকল পণ্য দেখুন এবং পরিচালনা করুন</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => refetchProducts()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            রিফ্রেশ
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                নতুন পণ্য
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={addForm.handleSubmit(handleAddProduct)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">পণ্যের নাম *</label>
                    <Input
                      {...addForm.register("name")}
                      placeholder="পণ্যের নাম লিখুন"
                      className="mt-1"
                    />
                    {addForm.formState.errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {addForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">দাম (টাকা) *</label>
                    <Input
                      {...addForm.register("price")}
                      type="number"
                      step="0.01"
                      placeholder="০"
                      className="mt-1"
                    />
                    {addForm.formState.errors.price && (
                      <p className="text-sm text-red-500 mt-1">
                        {addForm.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">ক্যাটাগরি *</label>
                    <Select onValueChange={(value) => addForm.setValue("category", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mugs">মগ</SelectItem>
                        <SelectItem value="t-shirts">টি-শার্ট</SelectItem>
                        <SelectItem value="frames">ফ্রেম</SelectItem>
                        <SelectItem value="cushions">কুশন</SelectItem>
                        <SelectItem value="keychains">কি-চেইন</SelectItem>
                        <SelectItem value="calendars">ক্যালেন্ডার</SelectItem>
                        <SelectItem value="others">অন্যান্য</SelectItem>
                      </SelectContent>
                    </Select>
                    {addForm.formState.errors.category && (
                      <p className="text-sm text-red-500 mt-1">
                        {addForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">স্টক *</label>
                    <Input
                      {...addForm.register("stock", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="০"
                      className="mt-1"
                    />
                    {addForm.formState.errors.stock && (
                      <p className="text-sm text-red-500 mt-1">
                        {addForm.formState.errors.stock.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">ছবির URL</label>
                  <Input
                    {...addForm.register("image_url")}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                  {addForm.formState.errors.image_url && (
                    <p className="text-sm text-red-500 mt-1">
                      {addForm.formState.errors.image_url.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">বিবরণ</label>
                  <Textarea
                    {...addForm.register("description")}
                    placeholder="পণ্যের বিবরণ লিখুন"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_featured"
                        checked={addForm.watch("is_featured") || false}
                        onCheckedChange={(checked) => {
                          addForm.setValue("is_featured", !!checked);
                        }}
                      />
                      <div>
                        <label htmlFor="is_featured" className="text-sm font-medium text-gray-900">
                          ফিচারড পণ্য
                        </label>
                        <p className="text-xs text-gray-600">হোম পেইজে বিশেষভাবে প্রদর্শিত হবে</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={addForm.watch("is_featured") ? "default" : "outline"}
                      size="sm"
                      className={addForm.watch("is_featured") ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                      onClick={() => {
                        const currentValue = addForm.watch("is_featured");
                        addForm.setValue("is_featured", !currentValue);
                      }}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {addForm.watch("is_featured") ? "চালু" : "বন্ধ"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_latest"
                        checked={addForm.watch("is_latest") || false}
                        onCheckedChange={(checked) => {
                          addForm.setValue("is_latest", !!checked);
                        }}
                      />
                      <div>
                        <label htmlFor="is_latest" className="text-sm font-medium text-gray-900">
                          নতুন পণ্য
                        </label>
                        <p className="text-xs text-gray-600">নতুন পণ্য হিসেবে চিহ্নিত হবে</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={addForm.watch("is_latest") ? "default" : "outline"}
                      size="sm"
                      className={addForm.watch("is_latest") ? "bg-green-500 hover:bg-green-600" : ""}
                      onClick={() => {
                        const currentValue = addForm.watch("is_latest");
                        addForm.setValue("is_latest", !currentValue);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      {addForm.watch("is_latest") ? "চালু" : "বন্ধ"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_best_selling"
                        checked={addForm.watch("is_best_selling") || false}
                        onCheckedChange={(checked) => {
                          addForm.setValue("is_best_selling", !!checked);
                        }}
                      />
                      <div>
                        <label htmlFor="is_best_selling" className="text-sm font-medium text-gray-900">
                          বেস্ট সেলার
                        </label>
                        <p className="text-xs text-gray-600">সর্বাধিক বিক্রীত পণ্য হিসেবে চিহ্নিত</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={addForm.watch("is_best_selling") ? "default" : "outline"}
                      size="sm"
                      className={addForm.watch("is_best_selling") ? "bg-blue-500 hover:bg-blue-600" : ""}
                      onClick={() => {
                        const currentValue = addForm.watch("is_best_selling");
                        addForm.setValue("is_best_selling", !currentValue);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {addForm.watch("is_best_selling") ? "চালু" : "বন্ধ"}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    disabled={addProductMutation.isPending}
                  >
                    {addProductMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="পণ্যের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ক্যাটাগরি ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব পণ্য</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
              <p className="text-sm text-gray-600">মোট পণ্য</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredProducts.filter(p => p.is_featured).length}
              </p>
              <p className="text-sm text-gray-600">ফিচারড</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredProducts.filter(p => p.is_latest).length}
              </p>
              <p className="text-sm text-gray-600">নতুন</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredProducts.filter(p => p.is_best_selling).length}
              </p>
              <p className="text-sm text-gray-600">বেস্ট সেলার</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredProducts.filter(p => p.stock === 0).length}
              </p>
              <p className="text-sm text-gray-600">স্টক শেষ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_featured && (
                  <Badge className="bg-red-500 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    ফিচারড
                  </Badge>
                )}
                {product.is_latest && (
                  <Badge className="bg-green-500 text-white text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    নতুন
                  </Badge>
                )}
                {product.is_best_selling && (
                  <Badge className="bg-blue-500 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    বেস্ট সেলার
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              <div className="absolute top-2 right-2">
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? `স্টক: ${product.stock}` : "স্টক নেই"}
                </Badge>
              </div>

              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(parseFloat(product.price))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('bn-BD')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} টি পণ্যের মধ্যে {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} দেখানো হচ্ছে
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>পণ্য এডিট করুন</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <form onSubmit={editForm.handleSubmit(handleUpdateProduct)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">পণ্যের নাম *</label>
                  <Input
                    {...editForm.register("name")}
                    placeholder="পণ্যের নাম লিখুন"
                    className="mt-1"
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {editForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">দাম (টাকা) *</label>
                  <Input
                    {...editForm.register("price")}
                    type="number"
                    step="0.01"
                    placeholder="০"
                    className="mt-1"
                  />
                  {editForm.formState.errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {editForm.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">ক্যাটাগরি *</label>
                  <Select
                    value={editForm.watch("category")}
                    onValueChange={(value) => editForm.setValue("category", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mugs">মগ</SelectItem>
                      <SelectItem value="t-shirts">টি-শার্ট</SelectItem>
                      <SelectItem value="frames">ফ্রেম</SelectItem>
                      <SelectItem value="cushions">কুশন</SelectItem>
                      <SelectItem value="keychains">কি-চেইন</SelectItem>
                      <SelectItem value="calendars">ক্যালেন্ডার</SelectItem>
                      <SelectItem value="others">অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                  {editForm.formState.errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {editForm.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">স্টক *</label>
                  <Input
                    {...editForm.register("stock", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="০"
                    className="mt-1"
                  />
                  {editForm.formState.errors.stock && (
                    <p className="text-sm text-red-500 mt-1">
                      {editForm.formState.errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">ছবির URL</label>
                <Input
                  {...editForm.register("image_url")}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
                {editForm.formState.errors.image_url && (
                  <p className="text-sm text-red-500 mt-1">
                    {editForm.formState.errors.image_url.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">বিবরণ</label>
                <Textarea
                  {...editForm.register("description")}
                  placeholder="পণ্যের বিবরণ লিখুন"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="edit_is_featured"
                      checked={editForm.watch("is_featured") || false}
                      onCheckedChange={(checked) => {
                        editForm.setValue("is_featured", !!checked);
                      }}
                    />
                    <div>
                      <label htmlFor="edit_is_featured" className="text-sm font-medium text-gray-900">
                        ফিচারড পণ্য
                      </label>
                      <p className="text-xs text-gray-600">হোম পেইজে বিশেষভাবে প্রদর্শিত হবে</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={editForm.watch("is_featured") ? "default" : "outline"}
                    size="sm"
                    className={editForm.watch("is_featured") ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                    onClick={() => {
                      const currentValue = editForm.watch("is_featured");
                      editForm.setValue("is_featured", !currentValue);
                    }}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    {editForm.watch("is_featured") ? "চালু" : "বন্ধ"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="edit_is_latest"
                      checked={editForm.watch("is_latest") || false}
                      onCheckedChange={(checked) => {
                        editForm.setValue("is_latest", !!checked);
                      }}
                    />
                    <div>
                      <label htmlFor="edit_is_latest" className="text-sm font-medium text-gray-900">
                        নতুন পণ্য
                      </label>
                      <p className="text-xs text-gray-600">নতুন পণ্য হিসেবে চিহ্নিত হবে</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={editForm.watch("is_latest") ? "default" : "outline"}
                    size="sm"
                    className={editForm.watch("is_latest") ? "bg-green-500 hover:bg-green-600" : ""}
                    onClick={() => {
                      const currentValue = editForm.watch("is_latest");
                      editForm.setValue("is_latest", !currentValue);
                    }}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {editForm.watch("is_latest") ? "চালু" : "বন্ধ"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="edit_is_best_selling"
                      checked={editForm.watch("is_best_selling") || false}
                      onCheckedChange={(checked) => {
                        editForm.setValue("is_best_selling", !!checked);
                      }}
                    />
                    <div>
                      <label htmlFor="edit_is_best_selling" className="text-sm font-medium text-gray-900">
                        বেস্ট সেলার
                      </label>
                      <p className="text-xs text-gray-600">সর্বাধিক বিক্রীত পণ্য হিসেবে চিহ্নিত</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={editForm.watch("is_best_selling") ? "default" : "outline"}
                    size="sm"
                    className={editForm.watch("is_best_selling") ? "bg-blue-500 hover:bg-blue-600" : ""}
                    onClick={() => {
                      const currentValue = editForm.watch("is_best_selling");
                      editForm.setValue("is_best_selling", !currentValue);
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {editForm.watch("is_best_selling") ? "চালু" : "বন্ধ"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
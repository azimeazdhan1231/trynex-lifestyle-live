import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { formatPrice } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, Plus, Pencil, Trash2, Eye, Search, RefreshCw, AlertTriangle, ImageIcon, Upload
} from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
  additional_images?: string[];
  is_active: boolean;
}

function ProductForm({ product, onClose, isEdit = false }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(product?.additional_images || []);

  const { data: categories = [] } = useQuery({ queryKey: ["/api/categories"] });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      stock: product?.stock || 0,
      image_url: product?.image_url || '',
      is_active: product?.is_active ?? true,
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          additional_images: additionalImages.filter(Boolean)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "নতুন পণ্য যোগ করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: error?.message || "পণ্য যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          additional_images: additionalImages.filter(Boolean)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "পণ্য আপডেট করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: error?.message || "পণ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProductFormData) => {
    if (isEdit) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    setValue('image_url', url);
  };

  const addAdditionalImage = () => {
    if (additionalImages.length < 5) {
      setAdditionalImages([...additionalImages, '']);
    }
  };

  const updateAdditionalImage = (index: number, url: string) => {
    const newImages = [...additionalImages];
    newImages[index] = url;
    setAdditionalImages(newImages);
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">পণ্যের নাম *</Label>
            <Input
              id="name"
              {...register("name", { required: "পণ্যের নাম আবশ্যক" })}
              placeholder="পণ্যের নাম লিখুন"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="পণ্যের বিবরণ লিখুন"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">দাম (টাকা) *</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { 
                  required: "দাম আবশ্যক",
                  valueAsNumber: true,
                  min: { value: 1, message: "দাম ১ টাকার বেশি হতে হবে" }
                })}
                placeholder="০"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="stock">স্টক *</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { 
                  required: "স্টক আবশ্যক",
                  valueAsNumber: true,
                  min: { value: 0, message: "স্টক ০ বা বেশি হতে হবে" }
                })}
                placeholder="০"
              />
              {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="category">ক্যাটেগরি *</Label>
            <Select onValueChange={(value) => setValue('category', value)} defaultValue={product?.category}>
              <SelectTrigger>
                <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image_url">মূল ছবির URL *</Label>
            <Input
              id="image_url"
              {...register("image_url", { required: "ছবির URL আবশ্যক" })}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => handleImageUrlChange(e.target.value)}
            />
            {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
          </div>

          {imagePreview && (
            <div>
              <Label>ছবির প্রিভিউ</Label>
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg border"
                onError={() => setImagePreview('')}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>অতিরিক্ত ছবি (সর্বোচ্চ ৫টি)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addAdditionalImage}
                disabled={additionalImages.length >= 5}
              >
                <Plus className="w-4 h-4 mr-1" />
                যোগ করুন
              </Button>
            </div>
            
            <div className="space-y-2">
              {additionalImages.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`অতিরিক্ত ছবি ${index + 1} URL`}
                    value={url}
                    onChange={(e) => updateAdditionalImage(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdditionalImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          বাতিল
        </Button>
        <Button 
          type="submit" 
          disabled={createProductMutation.isPending || updateProductMutation.isPending}
        >
          {createProductMutation.isPending || updateProductMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "আপডেট হচ্ছে..." : "যোগ করা হচ্ছে..."}
            </>
          ) : (
            isEdit ? "আপডেট করুন" : "পণ্য যোগ করুন"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ProductManagement() {
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "পণ্য মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: error?.message || "পণ্য মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const filteredProducts = React.useMemo(() => {
    return products.filter((product: any) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

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
          <CardDescription>আপনার সব পণ্য এক জায়গায় দেখুন ও পরিচালনা করুন</CardDescription>
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>পণ্য তালিকা ({filteredProducts.length}টি)</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ছবি</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>ক্যাটেগরি</TableHead>
                  <TableHead>দাম</TableHead>
                  <TableHead>স্টক</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      পণ্য লোড হচ্ছে...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      কোন পণ্য পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="truncate">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate">{product.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(Number(product.price))}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>পণ্য মুছে ফেলুন?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  আপনি কি নিশ্চিত যে আপনি "{product.name}" পণ্যটি মুছে ফেলতে চান? 
                                  এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
            <DialogDescription>
              নতুন পণ্যের সমস্ত তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>
          <ProductForm onClose={closeAddModal} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>পণ্য সম্পাদনা</DialogTitle>
            <DialogDescription>
              পণ্যের তথ্য আপডেট করুন
            </DialogDescription>
          </DialogHeader>
          <ProductForm product={selectedProduct} onClose={closeEditModal} isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
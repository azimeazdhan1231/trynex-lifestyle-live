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
  price: string;
  category: string;
  stock: string;
  image_url: string;
  additional_images?: string[];
  is_active: boolean;
  is_featured?: boolean;
  is_latest?: boolean;
  is_best_selling?: boolean;
}

function ProductForm({ product, onClose, isEdit = false }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(product?.additional_images || []);

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({ 
    queryKey: ["/api/categories"],
    retry: 2,
    staleTime: 60000,
    onError: (error) => {
      console.error('Failed to load categories:', error);
      toast({
        title: "ত্রুটি!",
        description: "ক্যাটেগরি লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price?.toString() || '0',
      category: product?.category || '',
      stock: product?.stock?.toString() || '0',
      image_url: product?.image_url || '',
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      is_latest: product?.is_latest ?? false,
      is_best_selling: product?.is_best_selling ?? false,
    }
  });

  // Reset form when product data changes
  React.useEffect(() => {
    if (product) {
      console.log('🔄 Resetting form with updated product data:', product);
      reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '0',
        category: product.category || '',
        stock: product.stock?.toString() || '0',
        image_url: product.image_url || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_latest: product.is_latest ?? false,
        is_best_selling: product.is_best_selling ?? false,
      });
      setImagePreview(product.image_url || '');
      setAdditionalImages(product.additional_images || []);
    }
  }, [product, reset]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log('Creating product with data:', data);

      // Convert data to match server expectations
      const productData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        price: data.price.toString(), // Server expects string
        stock: typeof data.stock === 'number' ? data.stock : parseInt(data.stock.toString(), 10) || 0, // Server expects number
        category: data.category,
        image_url: data.image_url.trim(),
        additional_images: additionalImages.filter(Boolean),
        is_active: Boolean(data.is_active),
        is_featured: Boolean(data.is_featured),
        is_latest: Boolean(data.is_latest),
        is_best_selling: Boolean(data.is_best_selling)
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Bust': Date.now().toString()
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: async (newProduct) => {
      console.log('✅ Product created successfully:', newProduct);

      toast({
        title: "সফল!",
        description: "নতুন পণ্য যোগ করা হয়েছে",
      });

      // Clear all caches and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/products"] }),
        queryClient.refetchQueries({ queryKey: ["/api/products"] }),
        queryClient.removeQueries({ queryKey: ["/api/products"] }),
      ]);

      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Create product error:', error);
      toast({
        title: "ত্রুটি!",
        description: error?.message || "পণ্য যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log('Updating product with data:', data);

      // Convert data to match server expectations
      const productData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        price: data.price.toString(), // Server expects string
        stock: typeof data.stock === 'number' ? data.stock : parseInt(data.stock.toString(), 10) || 0, // Server expects number
        category: data.category,
        image_url: data.image_url.trim(),
        additional_images: additionalImages.filter(Boolean),
        is_active: Boolean(data.is_active),
        is_featured: Boolean(data.is_featured),
        is_latest: Boolean(data.is_latest),
        is_best_selling: Boolean(data.is_best_selling)
      };

      console.log('Processed product data:', productData);

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Bust': Date.now().toString(),
          'X-Force-Update': 'true'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update API error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: async (updatedProduct) => {
      console.log('✅ Product updated successfully:', updatedProduct);

      toast({
        title: "সফল!",
        description: "পণ্য আপডেট করা হয়েছে",
      });

      // Clear all caches and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/products"] }),
        queryClient.refetchQueries({ queryKey: ["/api/products"] }),
        queryClient.removeQueries({ queryKey: ["/api/products"] }),
      ]);

      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Update product error:', error);
      toast({
        title: "ত্রুটি!",
        description: error?.message || "পণ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProductFormData) => {
    console.log('Form submitted with data:', data);

    // Convert data to match server expectations - price as string, stock as number
    const processedData = {
      ...data,
      price: data.price.toString(), // Server expects string
      stock: parseInt(data.stock.toString(), 10) || 0, // Server expects number
    };

    console.log('Processed data for server:', processedData);

    if (isEdit) {
      updateProductMutation.mutate(processedData);
    } else {
      createProductMutation.mutate(processedData);
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
                step="0.01"
                {...register("price", { 
                  required: "দাম আবশ্যক",
                  min: { value: "0", message: "দাম ০ বা বেশি হতে হবে" }
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
                  min: { value: "0", message: "স্টক ০ বা বেশি হতে হবে" }
                })}
                placeholder="০"
              />
              {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="category">ক্যাটেগরি *</Label>
            <Select onValueChange={(value) => setValue('category', value)} value={watch('category')}>
              <SelectTrigger>
                <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.length > 0 ? (
                  categories.map((category: any) => (
                    <SelectItem key={category.id || category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    কোন ক্যাটেগরি পাওয়া যায়নি
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          {/* Product Status Checkboxes */}
          <div className="space-y-2">
            <Label>পণ্যের স্ট্যাটাস</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  {...register("is_featured")}
                />
                <Label htmlFor="is_featured">ফিচার্ড পণ্য</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_latest"
                  {...register("is_latest")}
                />
                <Label htmlFor="is_latest">নতুন পণ্য</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_best_selling"
                  {...register("is_best_selling")}
                />
                <Label htmlFor="is_best_selling">বেস্ট সেলিং</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register("is_active")}
                />
                <Label htmlFor="is_active">সক্রিয়</Label>
              </div>
            </div>
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

  const { data: products = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/products"],
    refetchInterval: 5000,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'always',
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error?.message?.includes('Invalid product data')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const { data: categories = [] } = useQuery({ 
    queryKey: ["/api/categories"],
    retry: 2,
    staleTime: 60000
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      console.log('Deleting product:', productId);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Bust': Date.now().toString()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: async (result) => {
      console.log('✅ Product deleted successfully:', result);

      toast({
        title: "সফল!",
        description: "পণ্য মুছে ফেলা হয়েছে",
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/products"] }),
        queryClient.refetchQueries({ queryKey: ["/api/products"] }),
        queryClient.removeQueries({ queryKey: ["/api/products"] }),
      ]);

      await refetch();
    },
    onError: (error: any) => {
      console.error('❌ Delete product error:', error);
      toast({
        title: "ত্রুটি!",
        description: error?.message || "পণ্য মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const openEditModal = async (product: any) => {
    console.log('Opening edit modal for product:', product);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const freshProduct = await response.json();
        console.log('✅ Fetched fresh product data:', freshProduct);
        setSelectedProduct(freshProduct);
      } else {
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error('Failed to fetch fresh product data:', error);
      setSelectedProduct(product);
    }

    setIsEditModalOpen(true);
  };

  const closeEditModal = async () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);

    await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    await refetch();
  };

  const closeAddModal = async () => {
    setIsAddModalOpen(false);

    await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    await refetch();
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');

    queryClient.removeQueries({ queryKey: ["/api/products"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    await refetch();

    toast({
      title: "রিফ্রেশ সম্পন্ন!",
      description: "পণ্যের তালিকা আপডেট করা হয়েছে",
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">পণ্য লোড করতে সমস্যা</h3>
            <p className="text-gray-600 mb-4">পণ্যের তথ্য লোড করতে সমস্যা হয়েছে</p>
            <Button onClick={handleRefresh}>
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
      {/* Header with Add Button */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>পণ্য ব্যবস্থাপনা</CardTitle>
              <CardDescription>আপনার সব পণ্য এক জায়গায় দেখুন ও পরিচালনা করুন</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                রিফ্রেশ
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                নতুন পণ্য
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>পণ্য তালিকা ({products.length}টি)</span>
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
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      কোন পণ্য পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => (
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
                        <div className="flex flex-col gap-1">
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                          {product.is_featured && <Badge variant="outline" className="text-xs">ফিচার্ড</Badge>}
                          {product.is_latest && <Badge variant="outline" className="text-xs">নতুন</Badge>}
                          {product.is_best_selling && <Badge variant="outline" className="text-xs">বেস্ট সেলিং</Badge>}
                        </div>
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
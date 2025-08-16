import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, Eye, Package, Star, AlertTriangle, ImageIcon, X } from "lucide-react";
import type { Product, Category, InsertProduct } from "@shared/schema";

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  old_price: string;
  category: string;
  images: string[];
  stock: number;
  is_featured: boolean;
  is_available: boolean;
  sku: string;
  tags: string[];
}

export default function ProductManagement({ products, categories }: ProductManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    old_price: "",
    category: "",
    images: [""],
    stock: 0,
    is_featured: false,
    is_available: true,
    sku: "",
    tags: [],
  });
  const [imageInput, setImageInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "সফল",
        description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "পণ্য যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertProduct }) => {
      return apiRequest("PATCH", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "সফল",
        description: "পণ্য সফলভাবে আপডেট করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "পণ্য আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "সফল",
        description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "পণ্য মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      old_price: "",
      category: "",
      images: [""],
      stock: 0,
      is_featured: false,
      is_available: true,
      sku: "",
      tags: [],
    });
    setImageInput("");
    setTagInput("");
    setEditingProduct(null);
  };

  const handleInputChange = (key: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img), imageInput.trim()]
      }));
      setImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      old_price: product.old_price?.toString() || "",
      category: product.category || "",
      images: Array.isArray(product.images) ? product.images : typeof product.images === 'string' ? [product.images] : [""],
      stock: product.stock || 0,
      is_featured: product.is_featured || false,
      is_available: product.is_available !== false,
      sku: product.sku || "",
      tags: Array.isArray(product.tags) ? product.tags : [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "ত্রুটি",
        description: "পণ্যের নাম প্রয়োজন।",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক দাম প্রয়োজন।",
        variant: "destructive",
      });
      return;
    }

    const productData: InsertProduct = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: Number(formData.price),
      old_price: formData.old_price ? Number(formData.old_price) : null,
      category: formData.category || null,
      images: formData.images.filter(img => img.trim()),
      stock: formData.stock || 0,
      is_featured: formData.is_featured,
      is_available: formData.is_available,
      sku: formData.sku.trim() || null,
      tags: formData.tags,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleDelete = (productId: string) => {
    deleteProductMutation.mutate(productId);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const lowStockProducts = products.filter(product => (product.stock || 0) < 5);
  const outOfStockProducts = products.filter(product => (product.stock || 0) === 0);
  const featuredProducts = products.filter(product => product.is_featured);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">মোট পণ্য</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">ফিচার্ড পণ্য</p>
                <p className="text-2xl font-bold">{featuredProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">কম স্টক</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">স্টক শেষ</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Products Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>পণ্য ব্যবস্থাপনা</CardTitle>
              <CardDescription>পণ্য যোগ, সম্পাদনা এবং মুছে ফেলুন</CardDescription>
            </div>
            <Button onClick={openCreateDialog} data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              নতুন পণ্য যোগ করুন
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Products Table */}
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
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={Array.isArray(product.images) ? product.images[0] : product.images}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-product-${product.id}`}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.sku && (
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        )}
                        {product.is_featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                            <Star className="h-3 w-3 mr-1" />
                            ফিচার্ড
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category || <span className="text-gray-400">কোন ক্যাটেগরি নেই</span>}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.old_price && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.old_price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          (product.stock || 0) === 0 ? "text-red-600 border-red-200" :
                          (product.stock || 0) < 5 ? "text-orange-600 border-orange-200" :
                          "text-green-600 border-green-200"
                        }
                      >
                        {product.stock || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.is_available ? "default" : "secondary"}
                        className={product.is_available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {product.is_available ? "উপলব্ধ" : "অনুপলব্ধ"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-product-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>পণ্য মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
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

          {products.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">কোনো পণ্য পাওয়া যায়নি।</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "পণ্য সম্পাদনা করুন" : "নতুন পণ্য যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              পণ্যের বিস্তারিত তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">পণ্যের নাম *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="পণ্যের নাম"
                  data-testid="input-product-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="PROD-001"
                  data-testid="input-product-sku"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">দাম (টাকা) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="৫০০"
                  data-testid="input-product-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="old_price">পুরাতন দাম (টাকা)</Label>
                <Input
                  id="old_price"
                  type="number"
                  min="0"
                  value={formData.old_price}
                  onChange={(e) => handleInputChange("old_price", e.target.value)}
                  placeholder="৮০০"
                  data-testid="input-product-old-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">ক্যাটেগরি</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger data-testid="select-product-category">
                    <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">স্টক পরিমাণ</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                  placeholder="১০"
                  data-testid="input-product-stock"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="পণ্যের বিস্তারিত বিবরণ"
                className="min-h-20"
                data-testid="textarea-product-description"
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <Label>পণ্যের ছবি</Label>
              
              {/* Add new image */}
              <div className="flex space-x-2">
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="ছবির URL যোগ করুন"
                  className="flex-1"
                  data-testid="input-image-url"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                  data-testid="button-add-image"
                >
                  যোগ করুন
                </Button>
              </div>

              {/* Current images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.filter(img => img).map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      data-testid={`button-remove-image-${index}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <Label>ট্যাগ</Label>
              
              {/* Add new tag */}
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="নতুন ট্যাগ যোগ করুন"
                  className="flex-1"
                  data-testid="input-tag"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  data-testid="button-add-tag"
                >
                  যোগ করুন
                </Button>
              </div>

              {/* Current tags */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveTag(tag)}
                    data-testid={`tag-${index}`}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_featured">ফিচার্ড পণ্য</Label>
                  <p className="text-sm text-gray-600">এই পণ্যটি ফিচার্ড সেকশনে দেখান</p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                  data-testid="switch-product-featured"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_available">পণ্য উপলব্ধ</Label>
                  <p className="text-sm text-gray-600">এই পণ্যটি বিক্রির জন্য উপলব্ধ রাখুন</p>
                </div>
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleInputChange("is_available", checked)}
                  data-testid="switch-product-available"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              data-testid="button-save-product"
            >
              {createProductMutation.isPending || updateProductMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
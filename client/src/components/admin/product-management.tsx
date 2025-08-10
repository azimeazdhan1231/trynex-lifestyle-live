import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, Eye, Package, AlertTriangle } from "lucide-react";
import type { Product, Category, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
}

interface ProductFormData {
  name: string;
  price: string;
  image_url: string;
  category: string;
  stock: number;
  description: string;
  is_featured: boolean;
  is_latest: boolean;
  is_best_selling: boolean;
}

export default function ProductManagement({ products, categories }: ProductManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    image_url: "",
    category: "",
    stock: 0,
    description: "",
    is_featured: false,
    is_latest: false,
    is_best_selling: false,
  });
  const { toast } = useToast();

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "সফল",
        description: "পণ্য সফলভাবে যোগ করা হয়েছে।",
      });
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      return apiRequest("PATCH", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({
        title: "সফল",
        description: "পণ্য সফলভাবে আপডেট করা হয়েছে।",
      });
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
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/products/${id}`);
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
        description: error.message || "পণ্য মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      image_url: "",
      category: "",
      stock: 0,
      description: "",
      is_featured: false,
      is_latest: false,
      is_best_selling: false,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image_url: product.image_url || "",
      category: product.category || "",
      stock: product.stock,
      description: product.description || "",
      is_featured: product.is_featured || false,
      is_latest: product.is_latest || false,
      is_best_selling: product.is_best_selling || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const productData: InsertProduct = {
      name: formData.name,
      price: formData.price,
      image_url: formData.image_url || null,
      category: formData.category || null,
      stock: formData.stock,
      description: formData.description || null,
      is_featured: formData.is_featured,
      is_latest: formData.is_latest,
      is_best_selling: formData.is_best_selling,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>পণ্য ব্যবস্থাপনা</CardTitle>
              <CardDescription>আপনার পণ্য যোগ, সম্পাদনা এবং মুছে ফেলুন</CardDescription>
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
                  <TableHead>দাম</TableHead>
                  <TableHead>ক্যাটেগরি</TableHead>
                  <TableHead>স্টক</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-product-${product.id}`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </TableCell>
                    <TableCell data-testid={`text-product-price-${product.id}`}>
                      {formatPrice(Number(product.price))}
                    </TableCell>
                    <TableCell data-testid={`text-product-category-${product.id}`}>
                      {product.category || "No Category"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span data-testid={`text-product-stock-${product.id}`}>{product.stock}</span>
                        {product.stock === 0 && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                        {product.stock > 0 && product.stock < 5 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {product.is_featured && <Badge variant="default">ফিচার্ড</Badge>}
                        {product.is_latest && <Badge variant="secondary">নতুন</Badge>}
                        {product.is_best_selling && <Badge variant="outline">বেস্ট সেলার</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-product-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>পণ্য মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি "{product.name}" পণ্যটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।
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
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "পণ্য সম্পাদনা করুন" : "নতুন পণ্য যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              পণ্যের তথ্য পূরণ করুন এবং সেভ করুন।
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">পণ্যের নাম *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="পণ্যের নাম লিখুন"
                  data-testid="input-product-name"
                />
              </div>

              <div>
                <Label htmlFor="price">দাম *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="দাম লিখুন"
                  data-testid="input-product-price"
                />
              </div>

              <div>
                <Label htmlFor="category">ক্যাটেগরি</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-product-category">
                    <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">কোন ক্যাটেগরি নেই</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name_bengali || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stock">স্টক *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="স্টক সংখ্যা"
                  data-testid="input-product-stock"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="image_url">ছবির URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="ছবির লিঙ্ক"
                  data-testid="input-product-image"
                />
              </div>

              <div>
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="পণ্যের বিবরণ লিখুন"
                  rows={4}
                  data-testid="textarea-product-description"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    data-testid="switch-product-featured"
                  />
                  <Label htmlFor="is_featured">ফিচার্ড পণ্য</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_latest"
                    checked={formData.is_latest}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_latest: checked })}
                    data-testid="switch-product-latest"
                  />
                  <Label htmlFor="is_latest">নতুন পণ্য</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_best_selling"
                    checked={formData.is_best_selling}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_best_selling: checked })}
                    data-testid="switch-product-bestselling"
                  />
                  <Label htmlFor="is_best_selling">বেস্ট সেলার</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.price || createProductMutation.isPending || updateProductMutation.isPending}
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
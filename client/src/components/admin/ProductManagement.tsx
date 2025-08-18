import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package, Image, Tag, Eye, Star, Zap, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatPrice } from '@/lib/utils';
import type { Product, InsertProduct, Category } from '@shared/schema';

interface ProductWithFlags extends Product {
  is_featured?: boolean;
  is_latest?: boolean;
  is_best_selling?: boolean;
}

export default function ProductManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithFlags | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<InsertProduct & {
    is_featured?: boolean;
    is_latest?: boolean;
    is_best_selling?: boolean;
  }>>({
    name: '',
    price: '',
    image_url: '',
    category: '',
    stock: 0,
    description: '',
    is_featured: false,
    is_latest: false,
    is_best_selling: false,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading, refetch } = useQuery<ProductWithFlags[]>({
    queryKey: ['/api/products'],
    refetchInterval: 30000,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: Partial<InsertProduct>) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল!', description: 'পণ্য সফলভাবে যোগ করা হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'পণ্য যোগ করতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল!', description: 'পণ্য সফলভাবে আপডেট হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'পণ্য আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল!', description: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'পণ্য মুছতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  // Toggle product flags
  const toggleProductFlag = async (product: ProductWithFlags, flag: string, value: boolean) => {
    const updateData = { [flag]: value };
    updateProductMutation.mutate({ id: product.id, data: updateData });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image_url: '',
      category: '',
      stock: 0,
      description: '',
      is_featured: false,
      is_latest: false,
      is_best_selling: false,
    });
  };

  const openDialog = (product?: ProductWithFlags) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image_url: product.image_url || '',
        category: product.category || '',
        stock: product.stock,
        description: product.description || '',
        is_featured: product.is_featured || false,
        is_latest: product.is_latest || false,
        is_best_selling: product.is_best_selling || false,
      });
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: 'ত্রুটি!',
        description: 'পণ্যের নাম এবং দাম আবশ্যক',
        variant: 'destructive'
      });
      return;
    }

    const productData = {
      ...formData,
      price: formData.price?.toString() || '0',
      stock: formData.stock || 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="পণ্য অনুসন্ধান করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন পণ্য যোগ করুন
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">পণ্যের নাম *</Label>
                  <Input
                    id="name"
                    data-testid="input-product-name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">দাম (৳) *</Label>
                  <Input
                    id="price"
                    data-testid="input-product-price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">ক্যাটেগরি</Label>
                  <Select 
                    value={formData.category || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name_bengali}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="stock">স্টক</Label>
                  <Input
                    id="stock"
                    data-testid="input-product-stock"
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="image_url">ছবির লিংক</Label>
                <Input
                  id="image_url"
                  data-testid="input-product-image"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="description">বর্ণনা</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-product-description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="পণ্যের বিস্তারিত বর্ণনা..."
                />
              </div>
              
              {/* Product Flags */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    data-testid="switch-featured"
                    checked={formData.is_featured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured" className="text-sm">ফিচার্ড</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_latest"
                    data-testid="switch-latest"
                    checked={formData.is_latest || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_latest: checked }))}
                  />
                  <Label htmlFor="is_latest" className="text-sm">সর্বশেষ</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_best_selling"
                    data-testid="switch-best-selling"
                    checked={formData.is_best_selling || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_best_selling: checked }))}
                  />
                  <Label htmlFor="is_best_selling" className="text-sm">বেস্ট সেলিং</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {editingProduct ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মোট পণ্য</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ফিচার্ড</p>
                <p className="text-2xl font-bold">{products.filter(p => p.is_featured).length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">স্টক শেষ</p>
                <p className="text-2xl font-bold">{products.filter(p => p.stock <= 5).length}</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">বেস্ট সেলিং</p>
                <p className="text-2xl font-bold">{products.filter(p => p.is_best_selling).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>পণ্য তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">লোড হচ্ছে...</span>
            </div>
          ) : (
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
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category || 'অন্যান্য'}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(parseFloat(product.price.toString()))}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.stock <= 5 ? 'destructive' : 'secondary'}
                        className={product.stock <= 5 ? 'bg-red-100 text-red-800' : ''}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            ফিচার্ড
                          </Badge>
                        )}
                        {product.is_latest && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            সর্বশেষ
                          </Badge>
                        )}
                        {product.is_best_selling && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            বেস্ট সেলিং
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(product)}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!productsLoading && filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">কোন পণ্য পাওয়া যায়নি</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
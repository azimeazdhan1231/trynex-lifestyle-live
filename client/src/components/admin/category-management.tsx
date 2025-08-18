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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Tag, Eye, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@shared/schema';

export default function CategoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bengali: '',
    description: '',
    is_active: true,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading, refetch } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল!', description: 'ক্যাটেগরি সফলভাবে যোগ করা হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'ক্যাটেগরি যোগ করতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল!', description: 'ক্যাটেগরি সফলভাবে আপডেট হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      resetForm();
      setEditingCategory(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'ক্যাটেগরি আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল!', description: 'ক্যাটেগরি সফলভাবে মুছে ফেলা হয়েছে' });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'ত্রুটি!', 
        description: error.message || 'ক্যাটেগরি মুছতে সমস্যা হয়েছে',
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      name_bengali: '',
      description: '',
      is_active: true,
    });
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        name_bengali: category.name_bengali,
        description: category.description || '',
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.name_bengali) {
      toast({
        title: 'ত্রুটি!',
        description: 'ক্যাটেগরির নাম (ইংরেজি ও বাংলা) আবশ্যক',
        variant: 'destructive'
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const activeCategories = categories.filter(c => c.is_active);
  const inactiveCategories = categories.filter(c => !c.is_active);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ক্যাটেগরি ব্যবস্থাপনা</h2>
          <p className="text-gray-600">পণ্যের ক্যাটেগরি যোগ, সম্পাদনা এবং ব্যবস্থাপনা করুন</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন ক্যাটেগরি
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'ক্যাটেগরি সম্পাদনা' : 'নতুন ক্যাটেগরি যোগ করুন'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">ইংরেজি নাম *</Label>
                <Input
                  id="name"
                  data-testid="input-category-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Category Name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name_bengali">বাংলা নাম *</Label>
                <Input
                  id="name_bengali"
                  data-testid="input-category-name-bengali"
                  value={formData.name_bengali}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_bengali: e.target.value }))}
                  placeholder="ক্যাটেগরির নাম"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">বর্ণনা</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-category-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ক্যাটেগরির বিস্তারিত বর্ণনা..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  data-testid="switch-category-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">সক্রিয়</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {editingCategory ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মোট ক্যাটেগরি</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Folder className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">সক্রিয় ক্যাটেগরি</p>
                <p className="text-3xl font-bold text-green-600">{activeCategories.length}</p>
              </div>
              <Eye className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">নিষ্ক্রিয় ক্যাটেগরি</p>
                <p className="text-3xl font-bold text-red-600">{inactiveCategories.length}</p>
              </div>
              <Tag className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>ক্যাটেগরি তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">লোড হচ্ছে...</span>
            </div>
          ) : categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ইংরেজি নাম</TableHead>
                  <TableHead>বাংলা নাম</TableHead>
                  <TableHead>বর্ণনা</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.name_bengali}</TableCell>
                    <TableCell>
                      {category.description ? (
                        <span className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">কোন বর্ণনা নেই</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.is_active ? "default" : "secondary"}
                        className={category.is_active 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : "bg-gray-100 text-gray-800 border-gray-300"
                        }
                      >
                        {category.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          disabled={deleteCategoryMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">কোন ক্যাটেগরি পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm mb-4">
                আপনার পণ্যগুলি সংগঠিত করার জন্য ক্যাটেগরি যোগ করুন
              </p>
              <Button 
                onClick={() => openDialog()}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                প্রথম ক্যাটেগরি যোগ করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
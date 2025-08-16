import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Tag, ImageIcon } from "lucide-react";
import type { Category, InsertCategory } from "@shared/schema";

interface CategoryManagementProps {
  categories: Category[];
}

interface CategoryFormData {
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function CategoryManagement({ categories }: CategoryManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  });
  const { toast } = useToast();

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      return apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "সফল",
        description: "নতুন ক্যাটেগরি সফলভাবে যোগ করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "ক্যাটেগরি যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertCategory }) => {
      return apiRequest("PATCH", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "সফল",
        description: "ক্যাটেগরি সফলভাবে আপডেট করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "ক্যাটেগরি আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "সফল",
        description: "ক্যাটেগরি সফলভাবে মুছে ফেলা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "ক্যাটেগরি মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingCategory(null);
  };

  const handleInputChange = (key: keyof CategoryFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active !== false,
      sort_order: category.sort_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "ত্রুটি",
        description: "ক্যাটেগরির নাম প্রয়োজন।",
        variant: "destructive",
      });
      return;
    }

    const categoryData: InsertCategory = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      image_url: formData.image_url.trim() || null,
      is_active: formData.is_active,
      sort_order: formData.sort_order || 0,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const activeCategories = categories.filter(category => category.is_active !== false);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">মোট ক্যাটেগরি</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">সক্রিয় ক্যাটেগরি</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">নিষ্ক্রিয় ক্যাটেগরি</p>
                <p className="text-2xl font-bold text-gray-600">{categories.length - activeCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Categories Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>ক্যাটেগরি ব্যবস্থাপনা</CardTitle>
              <CardDescription>পণ্যের ক্যাটেগরি যোগ, সম্পাদনা এবং মুছে ফেলুন</CardDescription>
            </div>
            <Button onClick={openCreateDialog} data-testid="button-add-category">
              <Plus className="h-4 w-4 mr-2" />
              নতুন ক্যাটেগরি যোগ করুন
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Categories Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ছবি</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>বিবরণ</TableHead>
                  <TableHead>ক্রম</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-category-${category.id}`}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{category.name}</p>
                    </TableCell>
                    <TableCell>
                      {category.description ? (
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {category.description}
                        </p>
                      ) : (
                        <span className="text-gray-400">কোন বিবরণ নেই</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category.sort_order || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.is_active !== false ? "default" : "secondary"}
                        className={category.is_active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {category.is_active !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-category-${category.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ক্যাটেগরি মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি এই ক্যাটেগরিটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category.id)}
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

          {categories.length === 0 && (
            <div className="text-center py-8">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">কোনো ক্যাটেগরি পাওয়া যায়নি।</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "ক্যাটেগরি সম্পাদনা করুন" : "নতুন ক্যাটেগরি যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              ক্যাটেগরির বিস্তারিত তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ক্যাটেগরির নাম *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="ক্যাটেগরির নাম"
                data-testid="input-category-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="ক্যাটেগরির বিস্তারিত বিবরণ"
                className="min-h-20"
                data-testid="textarea-category-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">ছবির URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-category-image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">প্রদর্শন ক্রম</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value) || 0)}
                placeholder="0"
                data-testid="input-category-sort-order"
              />
              <p className="text-sm text-gray-600">
                কম সংখ্যা আগে দেখানো হবে
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">ক্যাটেগরি সক্রিয় করুন</Label>
                <p className="text-sm text-gray-600">এই ক্যাটেগরিটি ওয়েবসাইটে দেখান</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                data-testid="switch-category-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
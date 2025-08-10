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
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import type { Category, InsertCategory } from "@shared/schema";

interface CategoryManagementProps {
  categories: Category[];
}

interface CategoryFormData {
  name: string;
  name_bengali: string;
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
    name_bengali: "",
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
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "সফল",
        description: "ক্যাটেগরি সফলভাবে যোগ করা হয়েছে।",
      });
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategory> }) => {
      return apiRequest("PATCH", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({
        title: "সফল",
        description: "ক্যাটেগরি সফলভাবে আপডেট করা হয়েছে।",
      });
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
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/categories/${id}`);
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
        description: error.message || "ক্যাটেগরি মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_bengali: "",
      description: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_bengali: category.name_bengali,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active || true,
      sort_order: category.sort_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const categoryData: InsertCategory = {
      name: formData.name,
      name_bengali: formData.name_bengali,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>ক্যাটেগরি ব্যবস্থাপনা</CardTitle>
              <CardDescription>পণ্যের ক্যাটেগরি যোগ এবং সম্পাদনা করুন</CardDescription>
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
                  <TableHead>নাম (ইংরেজি)</TableHead>
                  <TableHead>নাম (বাংলা)</TableHead>
                  <TableHead>বিবরণ</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead>ক্রম</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_url && (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-category-${category.id}`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>
                      {category.name}
                    </TableCell>
                    <TableCell data-testid={`text-category-bengali-${category.id}`}>
                      {category.name_bengali}
                    </TableCell>
                    <TableCell data-testid={`text-category-description-${category.id}`}>
                      {category.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-category-order-${category.id}`}>
                      {category.sort_order}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-category-${category.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ক্যাটেগরি মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি "{category.name_bengali}" ক্যাটেগরিটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।
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
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "ক্যাটেগরি সম্পাদনা করুন" : "নতুন ক্যাটেগরি যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              ক্যাটেগরির তথ্য পূরণ করুন এবং সেভ করুন।
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">নাম (ইংরেজি) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name in English"
                  data-testid="input-category-name"
                />
              </div>

              <div>
                <Label htmlFor="name_bengali">নাম (বাংলা) *</Label>
                <Input
                  id="name_bengali"
                  value={formData.name_bengali}
                  onChange={(e) => setFormData({ ...formData, name_bengali: e.target.value })}
                  placeholder="বাংলায় ক্যাটেগরির নাম"
                  data-testid="input-category-bengali"
                />
              </div>

              <div>
                <Label htmlFor="image_url">ছবির URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="ছবির লিঙ্ক"
                  data-testid="input-category-image"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ক্যাটেগরির বিবরণ লিখুন"
                  rows={4}
                  data-testid="textarea-category-description"
                />
              </div>

              <div>
                <Label htmlFor="sort_order">ক্রম নম্বর</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  data-testid="input-category-order"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  data-testid="switch-category-active"
                />
                <Label htmlFor="is_active">সক্রিয় ক্যাটেগরি</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.name_bengali || createCategoryMutation.isPending || updateCategoryMutation.isPending}
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
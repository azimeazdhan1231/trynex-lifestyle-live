import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Calendar, User, Star, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Blog } from "@shared/schema";

const blogSchema = z.object({
  title: z.string().min(1, "শিরোনাম প্রয়োজন"),
  content: z.string().min(1, "কন্টেন্ট প্রয়োজন"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  category: z.string().min(1, "ক্যাটেগরি প্রয়োজন"),
  author: z.string().min(1, "লেখকের নাম প্রয়োজন"),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  blog?: Blog;
  onClose: () => void;
}

function BlogForm({ blog, onClose }: BlogFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || "",
      content: blog?.content || "",
      excerpt: blog?.excerpt || "",
      featured_image: blog?.featured_image || "",
      category: blog?.category || "general",
      author: blog?.author || "Admin",
      status: blog?.status || "published",
      is_featured: blog?.is_featured || false,
    },
  });

  const createBlogMutation = useMutation({
    mutationFn: (data: BlogFormData) => apiRequest('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      onClose();
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: (data: BlogFormData) => apiRequest(`/api/blogs/${blog?.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      onClose();
    },
  });

  const onSubmit = (data: BlogFormData) => {
    if (blog) {
      updateBlogMutation.mutate(data);
    } else {
      createBlogMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>শিরোনাম *</FormLabel>
                <FormControl>
                  <Input placeholder="ব্লগ পোস্টের শিরোনাম লিখুন" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ক্যাটেগরি *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">সাধারণ</SelectItem>
                    <SelectItem value="product">পণ্য</SelectItem>
                    <SelectItem value="lifestyle">লাইফস্টাইল</SelectItem>
                    <SelectItem value="tips">টিপস</SelectItem>
                    <SelectItem value="news">সংবাদ</SelectItem>
                    <SelectItem value="offers">অফার</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>সংক্ষিপ্ত বিবরণ</FormLabel>
              <FormControl>
                <Textarea placeholder="ব্লগ পোস্টের সংক্ষিপ্ত বিবরণ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>কন্টেন্ট *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="ব্লগ পোস্টের বিস্তারিত কন্টেন্ট লিখুন"
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ফিচার্ড ইমেজ URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>লেখক *</FormLabel>
                <FormControl>
                  <Input placeholder="লেখকের নাম" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>স্ট্যাটাস</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">ড্রাফট</SelectItem>
                    <SelectItem value="published">প্রকাশিত</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">ফিচার্ড পোস্ট</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            বাতিল
          </Button>
          <Button 
            type="submit" 
            disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
          >
            {blog ? "আপডেট করুন" : "তৈরি করুন"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function BlogManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | undefined>();
  const queryClient = useQueryClient();

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["/api/blogs"],
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/blogs/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
    },
  });

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ব্লগ পোস্ট মুছে ফেলতে চান?')) {
      deleteBlogMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBlog(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ব্লগ ম্যানেজমেন্ট</h2>
          <p className="text-muted-foreground">
            ব্লগ পোস্ট তৈরি, সম্পাদনা এবং পরিচালনা করুন
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBlog(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন ব্লগ পোস্ট
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? "ব্লগ পোস্ট সম্পাদনা" : "নতুন ব্লগ পোস্ট তৈরি"}
              </DialogTitle>
            </DialogHeader>
            <BlogForm blog={editingBlog} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: Blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {blog.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {blog.category}
                    </Badge>
                    {blog.status === 'published' ? (
                      <Badge className="text-xs bg-green-500">প্রকাশিত</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">ড্রাফট</Badge>
                    )}
                    {blog.is_featured && (
                      <Badge className="text-xs bg-yellow-500">
                        <Star className="w-3 h-3 mr-1" />
                        ফিচার্ড
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {blog.excerpt || blog.content.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(blog.created_at), 'dd/MM/yy')}
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {blog.author}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {blog.views || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(blog)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      সম্পাদনা
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(blog.id)}
                      disabled={deleteBlogMutation.isPending}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      মুছুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {blogs.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোনো ব্লগ পোস্ট নেই</h3>
            <p className="text-muted-foreground mb-4">
              আপনার প্রথম ব্লগ পোস্ট তৈরি করুন
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন ব্লগ পোস্ট
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
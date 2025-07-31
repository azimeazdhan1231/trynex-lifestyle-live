
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Eye, Calendar, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "শিরোনাম প্রয়োজন"),
  content: z.string().min(1, "কন্টেন্ট প্রয়োজন"),
  excerpt: z.string().min(1, "সারাংশ প্রয়োজন"),
  author: z.string().min(1, "লেখকের নাম প্রয়োজন"),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type BlogPost = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  status: "draft" | "published";
  is_featured: boolean;
  tags?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
};

export default function BlogManagement() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    status: "draft" as const,
    is_featured: false,
    tags: "",
    meta_title: "",
    meta_description: "",
  });

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      blogSchema.parse(formData);
      
      const method = editingBlog ? 'PUT' : 'POST';
      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "সফল!",
          description: editingBlog ? "ব্লগ পোস্ট আপডেট করা হয়েছে" : "নতুন ব্লগ পোস্ট তৈরি করা হয়েছে",
        });
        
        resetForm();
        setIsDialogOpen(false);
        fetchBlogs();
      } else {
        throw new Error('Failed to save blog post');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "ত্রুটি",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ত্রুটি",
          description: "ব্লগ পোস্ট সেভ করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author,
      status: blog.status,
      is_featured: blog.is_featured,
      tags: blog.tags || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "সফল!",
          description: "ব্লগ পোস্ট ডিলিট করা হয়েছে",
        });
        fetchBlogs();
      } else {
        throw new Error('Failed to delete blog post');
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "ব্লগ পোস্ট ডিলিট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      status: "draft",
      is_featured: false,
      tags: "",
      meta_title: "",
      meta_description: "",
    });
    setEditingBlog(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ব্লগ ম্যানেজমেন্ট</h2>
          <p className="text-gray-600">ব্লগ পোস্ট তৈরি এবং পরিচালনা করুন</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="w-4 h-4 mr-2" />
              নতুন পোস্ট
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "পোস্ট এডিট করুন" : "নতুন পোস্ট তৈরি করুন"}</DialogTitle>
              <DialogDescription>
                ব্লগ পোস্টের তথ্য পূরণ করুন
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">শিরোনাম *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ব্লগ পোস্টের শিরোনাম"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="author">লেখক *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="লেখকের নাম"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="excerpt">সারাংশ *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="পোস্টের সংক্ষিপ্ত বিবরণ"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">কন্টেন্ট *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="পোস্টের বিস্তারিত কন্টেন্ট"
                  rows={10}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">স্ট্যাটাস</Label>
                  <Select value={formData.status} onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">খসড়া</SelectItem>
                      <SelectItem value="published">প্রকাশিত</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">ট্যাগ</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="কমা দিয়ে আলাদা করুন"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">ফিচার্ড পোস্ট</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_title">মেটা টাইটেল</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO টাইটেল"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meta_description">মেটা বিবরণ</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="SEO বিবরণ"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit">
                  {editingBlog ? "আপডেট করুন" : "তৈরি করুন"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Posts List */}
      <div className="grid gap-4">
        {blogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">কোনো ব্লগ পোস্ট নেই</p>
            </CardContent>
          </Card>
        ) : (
          blogs.map((blog) => (
            <Card key={blog.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{blog.title}</h3>
                      {blog.is_featured && (
                        <Badge variant="secondary">ফিচার্ড</Badge>
                      )}
                      <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                        {blog.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">{blog.excerpt}</p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(blog.created_at)}
                      </span>
                      <span>লেখক: {blog.author}</span>
                      {blog.tags && (
                        <span className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {blog.tags}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(`/blog/${blog.id}`, '_blank')}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>নিশ্চিত করুন</AlertDialogTitle>
                          <AlertDialogDescription>
                            আপনি কি এই ব্লগ পোস্টটি ডিলিট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(blog.id)}>
                            ডিলিট করুন
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

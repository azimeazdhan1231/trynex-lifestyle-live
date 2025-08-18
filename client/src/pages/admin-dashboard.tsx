import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, Package, Users, TrendingUp, Plus, Edit2, Trash2, 
  Eye, CheckCircle, Clock, AlertCircle, DollarSign, Star, 
  BarChart3, Settings, Search, Filter 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomOrders: number;
  totalCategories: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  is_featured: boolean;
  is_latest: boolean;
  is_best_selling: boolean;
  image_url?: string;
  description?: string;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  district: string;
  thana: string;
  phone: string;
  total: string;
  status: string;
  created_at: string;
  items: any;
}

interface Category {
  id: string;
  name: string;
  name_bengali: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication check
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <Card className="w-96 backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">অ্যাডমিন লগইন</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLogin />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    meta: { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    }
  });

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
    meta: { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    }
  });

  // Fetch orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    meta: { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    meta: { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    }
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({ title: "সফল!", description: "পণ্য তৈরি হয়েছে" });
      setShowProductForm(false);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({ title: "সফল!", description: "পণ্য আপডেট হয়েছে" });
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({ title: "সফল!", description: "পণ্য ডিলিট হয়েছে" });
    }
  });

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter orders based on search  
  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm)
  );

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">অ্যাডমিন প্যানেল</h1>
            <p className="text-blue-200">অর্ডার ও কাস্টম অর্ডার ম্যানেজমেন্ট</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-white/20 text-white hover:bg-white/10"
            >
              লগআউট
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">মোট অর্ডার</p>
                    <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">কাস্টম অর্ডার</p>
                    <p className="text-3xl font-bold text-white">{stats.totalCustomOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">মোট পণ্য</p>
                    <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-sm">পেন্ডিং অর্ডার</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20">
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="products" className="text-white data-[state=active]:bg-white/20">
              পণ্য ব্যবস্থাপনা
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-white/20">
              অর্ডার ব্যবস্থাপনা
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-white data-[state=active]:bg-white/20">
              ক্যাটেগরি
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">সাম্প্রতিক অর্ডার</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{order.customer_name}</p>
                          <p className="text-blue-200 text-sm">{order.tracking_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-300 font-bold">৳{order.total}</p>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">জনপ্রিয় পণ্য</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.filter(p => p.is_featured || p.is_best_selling).slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-blue-200 text-sm">{product.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-green-300 font-bold">৳{product.price}</p>
                          {product.is_featured && <Star className="h-4 w-4 text-yellow-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">পণ্য ব্যবস্থাপনা</CardTitle>
                <Button 
                  onClick={() => setShowProductForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন পণ্য
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Input
                    placeholder="পণ্য খোঁজ করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{product.name}</h3>
                              <p className="text-blue-200 text-sm">{product.category}</p>
                              <p className="text-green-300 font-bold mt-1">৳{product.price}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                className="text-red-300 hover:text-red-100 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {product.is_featured && (
                              <Badge className="bg-yellow-600/20 text-yellow-300">ফিচার্ড</Badge>
                            )}
                            {product.is_latest && (
                              <Badge className="bg-green-600/20 text-green-300">নতুন</Badge>
                            )}
                            {product.is_best_selling && (
                              <Badge className="bg-blue-600/20 text-blue-300">বেস্ট সেলিং</Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-300 text-sm">স্টক: {product.stock}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">অর্ডার ব্যবস্থাপনা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Input
                    placeholder="অর্ডার খোঁজ করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-white font-medium">{order.customer_name}</p>
                            <p className="text-blue-200 text-sm">{order.phone}</p>
                            <p className="text-gray-300 text-sm">{order.district}, {order.thana}</p>
                          </div>
                          
                          <div>
                            <p className="text-white font-medium">{order.tracking_id}</p>
                            <p className="text-gray-300 text-sm">
                              {new Date(order.created_at).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-green-300 font-bold">৳{order.total}</p>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-blue-300">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-green-300">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">ক্যাটেগরি ব্যবস্থাপনা</CardTitle>
                <Button 
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ক্যাটেগরি
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">{category.name}</h3>
                            <p className="text-blue-200 text-sm">{category.name_bengali}</p>
                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                              {category.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCategory(category)}
                              className="text-blue-300 hover:text-blue-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-300 hover:text-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      {(showProductForm || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSubmit={(data) => {
            if (editingProduct) {
              updateProductMutation.mutate({ id: editingProduct.id, ...data });
            } else {
              createProductMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}

// Admin Login Component
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('লগইন ব্যর্থ');
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      window.location.reload();
    } catch (error) {
      toast({
        title: "লগইন ব্যর্থ",
        description: "ইমেইল বা পাসওয়ার্ড ভুল",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        type="email"
        placeholder="ইমেইল"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
        required
      />
      <Input
        type="password"
        placeholder="পাসওয়ার্ড"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
        required
      />
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
      </Button>
    </form>
  );
}

// Product Form Modal Component
function ProductFormModal({ product, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    description: product?.description || '',
    image_url: product?.image_url || '',
    is_featured: product?.is_featured || false,
    is_latest: product?.is_latest || false,
    is_best_selling: product?.is_best_selling || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/10 border-white/20 m-4">
        <CardHeader>
          <CardTitle className="text-white">
            {product ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="পণ্যের নাম"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
              <Input
                placeholder="দাম"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
              <Input
                placeholder="ক্যাটেগরি"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
              <Input
                placeholder="স্টক"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <Input
              placeholder="ছবির URL"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
            />
            
            <Textarea
              placeholder="পণ্যের বিবরণ"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                />
                ফিচার্ড
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.is_latest}
                  onChange={(e) => setFormData({...formData, is_latest: e.target.checked})}
                />
                নতুন
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.is_best_selling}
                  onChange={(e) => setFormData({...formData, is_best_selling: e.target.checked})}
                />
                বেস্ট সেলিং
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {product ? 'আপডেট করুন' : 'যোগ করুন'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                বাতিল
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
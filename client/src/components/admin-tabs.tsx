import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Package, Gift, TrendingUp, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, ORDER_STATUSES } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  price: string;
  image_url: string;
  category: string;
  stock: number;
  created_at: string;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  phone: string;
  district: string;
  thana: string;
  address: string;
  status: string;
  items: any[];
  total: string;
  payment_info?: string;
  created_at: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

const categories = [
  { value: "gifts", label: "গিফট" },
  { value: "lifestyle", label: "লাইফস্টাইল" },
  { value: "accessories", label: "অ্যাক্সেসরিজ" },
  { value: "custom", label: "কাস্টম" }
];

export default function AdminTabs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orders");

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "", price: "", image_url: "", category: "", stock: 0
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Offer Form State
  const [offerForm, setOfferForm] = useState({
    title: "", description: "", discount_percentage: 0, min_order_amount: 0, 
    max_discount_amount: 0, expires_at: "", is_active: true
  });
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  // Fetch data
  const { data: orders = [] } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: offers = [] } = useQuery<Offer[]>({ queryKey: ["/api/offers"] });

  // Statistics
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const totalProducts = products.length;

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "পণ্য যোগ করা হয়েছে", description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      setProductForm({ name: "", price: "", image_url: "", category: "", stock: 0 });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "পণ্য আপডেট হয়েছে", description: "পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({ name: "", price: "", image_url: "", category: "", stock: 0 });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "পণ্য মুছে ফেলা হয়েছে", description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    }
  });

  // Offer Mutations
  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/offers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "অফার যোগ করা হয়েছে", description: "নতুন অফার সফলভাবে যোগ করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsOfferDialogOpen(false);
      setOfferForm({ title: "", description: "", discount_percentage: 0, min_order_amount: 0, max_discount_amount: 0, expires_at: "", is_active: true });
    }
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/offers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "অফার আপডেট হয়েছে", description: "অফারের তথ্য সফলভাবে আপডেট করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsOfferDialogOpen(false);
      setEditingOffer(null);
    }
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/offers/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "অফার মুছে ফেলা হয়েছে", description: "অফার সফলভাবে মুছে ফেলা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    }
  });

  // Order Status Update
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে", description: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }
  });

  const handleProductSubmit = () => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productForm });
    } else {
      createProductMutation.mutate(productForm);
    }
  };

  const handleOfferSubmit = () => {
    const formData = {
      ...offerForm,
      expires_at: offerForm.expires_at || null
    };
    if (editingOffer) {
      updateOfferMutation.mutate({ id: editingOffer.id, data: formData });
    } else {
      createOfferMutation.mutate(formData);
    }
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: typeof product.price === 'string' ? product.price : product.price.toString(),
        image_url: product.image_url,
        category: product.category,
        stock: product.stock
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", price: "", image_url: "", category: "", stock: 0 });
    }
    setIsProductDialogOpen(true);
  };

  const openOfferDialog = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title: offer.title,
        description: offer.description,
        discount_percentage: offer.discount_percentage,
        min_order_amount: offer.min_order_amount || 0,
        max_discount_amount: offer.max_discount_amount || 0,
        expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().split('T')[0] : "",
        is_active: offer.is_active
      });
    } else {
      setEditingOffer(null);
      setOfferForm({ title: "", description: "", discount_percentage: 0, min_order_amount: 0, max_discount_amount: 0, expires_at: "", is_active: true });
    }
    setIsOfferDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">মোট আয়</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">মোট অর্ডার</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">অপেক্ষমান অর্ডার</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">মোট পণ্য</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">অর্ডার ম্যানেজমেন্ট</TabsTrigger>
          <TabsTrigger value="products">পণ্য ম্যানেজমেন্ট</TabsTrigger>
          <TabsTrigger value="offers">অফার ম্যানেজমেন্ট</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ট্র্যাকিং আইডি</TableHead>
                    <TableHead>কাস্টমার</TableHead>
                    <TableHead>মোট</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.tracking_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">{order.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(Number(order.total))}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateOrderStatusMutation.mutate({ orderId: order.id, status })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          বিস্তারিত
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>পণ্য তালিকা</CardTitle>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openProductDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    নতুন পণ্য যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
                    </DialogTitle>
                    <DialogDescription>
                      পণ্যের তথ্য দিয়ে ফর্ম পূরণ করুন
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">পণ্যের নাম</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="পণ্যের নাম লিখুন"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">দাম</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">ক্যাটেগরি</Label>
                      <Select 
                        value={productForm.category} 
                        onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stock">স্টক</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">ছবির URL</Label>
                      <Input
                        id="image_url"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleProductSubmit} className="flex-1">
                        {editingProduct ? "আপডেট করুন" : "যোগ করুন"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                        বাতিল
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ছবি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>দাম</TableHead>
                    <TableHead>ক্যাটেগরি</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{formatPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categories.find(c => c.value === product.category)?.label || product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProductDialog(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>অফার তালিকা</CardTitle>
              <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openOfferDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    নতুন অফার যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOffer ? "অফার সম্পাদনা" : "নতুন অফার যোগ করুন"}
                    </DialogTitle>
                    <DialogDescription>
                      অফারের তথ্য দিয়ে ফর্ম পূরণ করুন
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">অফারের শিরোনাম</Label>
                      <Input
                        id="title"
                        value={offerForm.title}
                        onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                        placeholder="অফারের শিরোনাম"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">বিবরণ</Label>
                      <Textarea
                        id="description"
                        value={offerForm.description}
                        onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                        placeholder="অফারের বিবরণ"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">ছাড় (শতাংশ)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={offerForm.discount_percentage}
                        onChange={(e) => setOfferForm({ ...offerForm, discount_percentage: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_amount">সর্বনিম্ন অর্ডার পরিমাণ</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        value={offerForm.min_order_amount}
                        onChange={(e) => setOfferForm({ ...offerForm, min_order_amount: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_discount">সর্বোচ্চ ছাড়ের পরিমাণ</Label>
                      <Input
                        id="max_discount"
                        type="number"
                        value={offerForm.max_discount_amount}
                        onChange={(e) => setOfferForm({ ...offerForm, max_discount_amount: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expires_at">মেয়াদ শেষ (ঐচ্ছিক)</Label>
                      <Input
                        id="expires_at"
                        type="date"
                        value={offerForm.expires_at}
                        onChange={(e) => setOfferForm({ ...offerForm, expires_at: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={offerForm.is_active}
                        onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                      />
                      <Label htmlFor="is_active">সক্রিয় অফার</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleOfferSubmit} className="flex-1">
                        {editingOffer ? "আপডেট করুন" : "যোগ করুন"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
                        বাতিল
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>ছাড়</TableHead>
                    <TableHead>সর্বনিম্ন অর্ডার</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>মেয়াদ</TableHead>
                    <TableHead>অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{offer.title}</p>
                          <p className="text-sm text-gray-600">{offer.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{offer.discount_percentage}%</TableCell>
                      <TableCell>{formatPrice(offer.min_order_amount || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={offer.is_active ? "default" : "secondary"}>
                          {offer.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {offer.expires_at 
                          ? new Date(offer.expires_at).toLocaleDateString('en-US')
                          : "কোন মেয়াদ নেই"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOfferDialog(offer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteOfferMutation.mutate(offer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
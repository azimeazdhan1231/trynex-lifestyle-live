import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, RefreshCw, AlertTriangle, Search, Plus, Pencil, Eye
} from "lucide-react";

// Simple Products Management without complex queries
export default function ProductsManagementSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: products = [], isLoading, error, refetch } = useQuery({ 
    queryKey: ["/api/products"],
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const { data: categories = [] } = useQuery({ 
    queryKey: ["/api/categories"],
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  // Safe filtering with error handling
  const filteredProducts = React.useMemo(() => {
    try {
      if (!Array.isArray(products)) return [];
      
      return products.filter((product: any) => {
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesSearch = searchTerm === '' || 
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesSearch;
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }, [products, categoryFilter, searchTerm]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">পণ্য লোড করতে সমস্যা</h3>
            <p className="text-gray-600 mb-4">দয়া করে পুনরায় চেষ্টা করুন</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>পণ্য ব্যবস্থাপনা</CardTitle>
          <CardDescription>আপনার সব পণ্য এক জায়গায় দেখুন ও পরিচালনা করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product-search">অনুসন্ধান</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="product-search"
                  placeholder="পণ্যের নাম..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category-filter">ক্যাটেগরি ফিল্টার</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  {Array.isArray(categories) && categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={() => refetch()} variant="outline" className="w-full" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
            </div>

            <div className="flex items-end">
              <Button className="w-full" disabled>
                <Plus className="w-4 h-4 mr-2" />
                নতুন পণ্য
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>পণ্য তালিকা ({filteredProducts.length}টি)</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">কোন পণ্য পাওয়া যায়নি</h3>
                <p className="text-gray-600">নতুন পণ্য যোগ করুন বা ফিল্টার পরিবর্তন করুন</p>
              </div>
            ) : (
              filteredProducts.map((product: any) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
                      }}
                    />
                    <Badge 
                      className="absolute top-2 right-2"
                      variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                    >
                      স্টক: {product.stock || 0}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name || 'নাম নেই'}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || 'বিবরণ নেই'}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(Number(product.price) || 0)}
                      </span>
                      <Badge variant="outline">{product.category || 'ক্যাটেগরি নেই'}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        disabled
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        সম্পাদনা
                      </Button>
                      <Button size="sm" variant="outline" className="px-3" disabled>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
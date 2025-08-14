import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Star,
  TrendingUp,
  Zap
} from "lucide-react";
import UltraModernProductCard from "@/components/ultra-modern-product-card";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function UltraModernProducts() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "latest">("latest");

  // Fetch products and categories
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return parseFloat(a.price) - parseFloat(b.price);
        case "latest":
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCustomize = (product: Product) => {
    // Customization is handled by the UltraModernProductCard internally
    console.log('Customizing product:', product.name);
  };

  const handleAddToCart = (product: Product | any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url,
      quantity: 1,
    });
    
    toast({
      title: "পণ্য যোগ করা হয়েছে!",
      description: `${product.name} কার্টে যোগ করা হয়েছে।`,
    });
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-800">পণ্য লোড হচ্ছে...</h2>
          <p className="text-gray-600">আমাদের সেরা কালেকশন আনছি আপনার জন্য</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-white/20 text-white px-4 py-2 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              সব পণ্য
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              আমাদের সম্পূর্ণ কালেকশন
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              প্রিয়জনের জন্য নিখুঁত উপহার খুঁজে নিন আমাদের বিস্তৃত পণ্য পরিসর থেকে
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white/50 backdrop-blur-sm sticky top-0 z-20 border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border-white/30 focus:border-orange-300 rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 focus:border-orange-300 focus:outline-none"
                >
                  <option value="all">সব ক্যাটেগরি</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price" | "latest")}
                  className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 focus:border-orange-300 focus:outline-none"
                >
                  <option value="latest">নতুন প্রথম</option>
                  <option value="name">নাম অনুযায়ী</option>
                  <option value="price">দাম অনুযায়ী</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-lg border border-white/30 overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
              <div className="text-2xl font-bold text-orange-600">{products.length}</div>
              <div className="text-sm text-gray-600">মোট পণ্য</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
              <div className="text-2xl font-bold text-green-600">{products.filter(p => p.is_featured).length}</div>
              <div className="text-sm text-gray-600">ফিচার্ড পণ্য</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-gray-600">ক্যাটেগরি</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
              <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
              <div className="text-sm text-gray-600">ফলাফল</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                কোনো পণ্য পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 mb-8">
                অন্য কীওয়ার্ড দিয়ে খোঁজ করুন বা ক্যাটেগরি পরিবর্তন করুন
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                সব পণ্য দেখুন
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}>
              {filteredProducts.map((product) => (
                <UltraModernProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onCustomize={handleCustomize}
                  onAddToCart={handleAddToCart}
                  variant={viewMode === "list" ? "default" : "default"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                ক্যাটেগরি
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                পছন্দের ক্যাটেগরি খুঁজুন
              </h2>
              <p className="text-xl text-gray-600">
                আপনার প্রয়োজন অনুযায়ী সঠিক পণ্য খুঁজে নিন
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Card 
                  key={category.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                      📦
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {products.filter(p => p.category === category.name).length} টি পণ্য
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <UltraDynamicProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
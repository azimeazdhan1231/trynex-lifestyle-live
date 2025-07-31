import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, MessageCircle, Eye, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_CATEGORIES, formatPrice, createWhatsAppUrl } from "@/lib/constants";
import ProductModal from "@/components/product-modal";
import Header from "@/components/header";
import { useCart } from "@/hooks/use-cart";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product, Category } from "@shared/schema";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { addToCart, totalItems } = useCart();

  // Load products and categories
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: 3,
    retryDelay: 1000,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: 3,
    retryDelay: 1000,
  });

  // Filter products by category
  const productsFiltered = selectedCategory === "all" 
    ? products 
    : products.filter(product => {
        // Check if product category matches selected category or its parent
        const selectedCat = PRODUCT_CATEGORIES.find(cat => cat.id === selectedCategory);
        if (!selectedCat) return false;
        
        // If it's a parent category, show all products from its children
        if (selectedCat.isParent) {
          const childCategories = PRODUCT_CATEGORIES
            .filter(cat => cat.parent === selectedCategory)
            .map(cat => cat.id);
          return childCategories.includes(product.category) || 
                 childCategories.some(catId => 
                   PRODUCT_CATEGORIES.find(c => c.id === catId)?.name === product.category
                 );
        }
        
        // Otherwise, match by category id or name
        return product.category === selectedCategory || 
               PRODUCT_CATEGORIES.find(cat => cat.id === selectedCategory)?.name === product.category ||
               categories.find(cat => cat.id === selectedCategory)?.name === product.category;
      });

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
    });

    // Track add to cart event
    if (typeof window !== 'undefined') {
      import('@/lib/analytics').then(({ trackAddToCart }) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        trackAddToCart(product.id, product.name, price);
      });
    }

    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleWhatsAppOrder = (product: Product) => {
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Get parent categories for display
  const parentCategories = PRODUCT_CATEGORIES.filter(cat => cat.isParent);
  const getChildCategories = (parentId: string) => 
    PRODUCT_CATEGORIES.filter(cat => cat.parent === parentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={totalItems} onCartOpen={() => {}} />
        <div className="pt-20 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Product loading error:", error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={totalItems} onCartOpen={() => {}} />
        <div className="pt-20 text-center py-8">
          <p className="text-red-600">পণ্য লোড করতে সমস্যা হয়েছে</p>
          <p className="text-sm text-gray-500 mt-2">দয়া করে আবার চেষ্টা করুন</p>
        </div>
      </div>
    );
  }

  const trackProductView = (product: Product) => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'view_item', {
          currency: 'BDT',
          value: product.price,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: 1
          }]
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={totalItems} onCartOpen={() => {}} />

      <div className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">আমাদের পণ্যসমূহ</h1>
            <p className="text-gray-600 text-lg">সেরা মানের কাস্টম গিফট এবং লাইফস্টাইল পণ্য</p>
          </div>

          {/* Product Categories */}
          <div className="mb-8">
            <div className="max-w-4xl mx-auto">
              {/* All Products Button */}
              <div className="text-center mb-6">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full font-medium text-lg px-8 py-6"
                  size="lg"
                >
                  🛍️ সব পণ্য
                </Button>
              </div>

              {/* Hierarchical Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parentCategories.map((parentCategory) => {
                  const childCategories = getChildCategories(parentCategory.id);
                  const isExpanded = expandedCategories.has(parentCategory.id);
                  
                  return (
                    <div key={parentCategory.id} className="bg-white rounded-lg border shadow-sm">
                      {/* Parent Category Header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <Button
                            variant={selectedCategory === parentCategory.id ? "default" : "ghost"}
                            onClick={() => setSelectedCategory(parentCategory.id)}
                            className="flex-1 justify-start text-left font-semibold"
                          >
                            {parentCategory.name}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategoryExpansion(parentCategory.id)}
                            className="ml-2"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Child Categories */}
                      {isExpanded && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-2">
                            {childCategories.map((childCategory) => (
                              <Button
                                key={childCategory.id}
                                variant={selectedCategory === childCategory.id ? "default" : "outline"}
                                onClick={() => setSelectedCategory(childCategory.id)}
                                className="justify-start text-left text-sm"
                                size="sm"
                              >
                                {childCategory.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Count */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {selectedCategory === "all" 
                ? `সর্বমোট ${productsFiltered.length} টি পণ্য`
                : `${productsFiltered.length} টি পণ্য "${PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name || categories.find(c => c.id === selectedCategory)?.name_bengali}" ক্যাটেগরিতে`
              }
            </p>
          </div>

          {/* Product Grid */}
          {productsFiltered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">এই ক্যাটেগরিতে কোন পণ্য পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsFiltered.map((product) => {
                trackProductView(product);
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div
                      className="aspect-square overflow-hidden relative"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4
                        className="font-semibold text-lg mb-2 text-gray-800 hover:text-primary transition-colors cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                        <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                          স্টক: {product.stock}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.stock === 0}
                          className="w-full"
                          variant={product.stock === 0 ? "secondary" : "default"}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            দেখুন
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppOrder(product);
                            }}
                            variant="outline"
                            className="bg-green-500 text-white hover:bg-green-600 border-green-500"
                            size="sm"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}
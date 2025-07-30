import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, MessageCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_CATEGORIES, formatPrice, createWhatsAppUrl } from "@/lib/constants";
import ProductModal from "@/components/product-modal";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: allProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: true,
  });

  // Filter products by category
  const products = selectedCategory === "all" 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }
    onAddToCart(product);
    
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-300 h-4 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Product loading error:", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">পণ্য লোড করতে সমস্যা হয়েছে</p>
        <p className="text-sm text-gray-500 mt-2">দয়া করে আবার চেষ্টা করুন</p>
      </div>
    );
  }

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">আমাদের পণ্যসমূহ</h3>
          <p className="text-gray-600 text-lg">সেরা মানের কাস্টম গিফট এবং লাইফস্টাইল পণ্য</p>
        </div>

        {/* Product Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full font-medium"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">কোন পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
            ))}
          </div>
        )}

        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );
}

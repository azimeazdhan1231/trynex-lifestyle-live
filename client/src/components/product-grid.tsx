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

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        console.log('🚀 Fetching products...');
        const start = Date.now();
        
        const response = await fetch("/api/products", {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache' // Force fresh data on manual refresh
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const duration = Date.now() - start;
        console.log(`✅ Products received in ${duration}ms - ${Array.isArray(data) ? data.length : 0} items`);
        
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("❌ Product loading error:", error);
        return [];
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Filter products by category
  const allProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

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
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">আমাদের পণ্যসমূহ</h3>
          <p className="text-gray-600 text-lg">সেরা মানের কাস্টম গিফট এবং লাইফস্টাইল পণ্য</p>
        </div>

        {/* Product Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 touch-manipulation"
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg active:scale-[0.98] md:hover:scale-[1.02] transition-all duration-200 cursor-pointer group touch-manipulation">
                <div 
                  className="aspect-square overflow-hidden relative"
                  onClick={() => {
                    handleProductClick(product);
                    trackProductView(product);
                  }}
                >
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                    alt={product.name}
                    className="w-full h-full object-cover group-active:scale-105 md:group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-active:bg-opacity-20 md:group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-active:opacity-100 md:group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <CardContent className="p-2 sm:p-3 md:p-4">
                  <h4 
                    className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 text-gray-800 hover:text-primary transition-colors cursor-pointer line-clamp-2"
                    onClick={() => {
                      handleProductClick(product);
                      trackProductView(product);
                    }}
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-1">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                    <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-xs shrink-0">
                      স্টক: {product.stock}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className="w-full text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                      variant={product.stock === 0 ? "secondary" : "default"}
                      size="sm"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {product.stock === 0 ? "স্টক নেই" : (
                        <>
                          <span className="hidden sm:inline">কার্টে যোগ করুন</span>
                          <span className="sm:hidden">কার্ট</span>
                        </>
                      )}
                    </Button>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 sm:h-8 touch-manipulation"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">দেখুন</span>
                        <span className="sm:hidden">দেখুন</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppOrder(product);
                        }}
                        variant="outline"
                        className="bg-green-500 text-white hover:bg-green-600 border-green-500 text-xs h-7 sm:h-8 touch-manipulation"
                        size="sm"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <span className="sm:hidden">WA</span>
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
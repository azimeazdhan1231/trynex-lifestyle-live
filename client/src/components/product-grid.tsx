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
import UnifiedProductCard from "@/components/unified-product-card";
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
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Product loading error:", error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Filter products by category
  const filteredProducts = selectedCategory === "all"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <UnifiedProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                variant="detailed"
                showCustomizeButton={true}
              />
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
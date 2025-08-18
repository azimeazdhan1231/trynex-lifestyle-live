import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingAnimation from "@/components/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  filters?: {
    category?: string;
    priceRange?: [number, number];
    sortBy?: string;
  };
  limit?: number;
}

const ProductGrid = ({ filters = {}, limit }: ProductGridProps) => {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', filters],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes for faster updates
    gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingAnimation message="পণ্য খোঁজা হচ্ছে..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.div
              key={index}
              className="space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">পণ্য লোড করতে সমস্যা হয়েছে</h3>
        <p className="text-gray-600 mb-4">
          দুঃখিত, এই মুহূর্তে পণ্য লোড করা যাচ্ছে না।
        </p>
        <Button onClick={() => window.location.reload()}>
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  const productList = products || [];

  if (productList.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
        <p className="text-gray-600 mb-4">
          এই ক্যাটেগরিতে বর্তমানে কোনো পণ্য নেই।
        </p>
      </div>
    );
  }

  // Apply filters
  let filteredProducts = [...productList];

  if (filters.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter((product: Product) =>
      product.category?.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }

  if (filters.priceRange) {
    filteredProducts = filteredProducts.filter((product: Product) => {
      const price = parseFloat(product.price);
      return price >= filters.priceRange![0] && price <= filters.priceRange![1];
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        filteredProducts.sort((a: Product, b: Product) => 
          parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case 'price-high':
        filteredProducts.sort((a: Product, b: Product) => 
          parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case 'name':
        filteredProducts.sort((a: Product, b: Product) => 
          a.name.localeCompare(b.name)
        );
        break;
      case 'newest':
        filteredProducts.sort((a: Product, b: Product) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
      case 'featured':
      default:
        filteredProducts.sort((a: Product, b: Product) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_best_selling && !b.is_best_selling) return -1;
          if (!a.is_best_selling && b.is_best_selling) return 1;
          return 0;
        });
        break;
    }
  }

  // Apply limit
  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          {filteredProducts.length} টি পণ্য পাওয়া গেছে
        </p>
      </div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredProducts.map((product: Product, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More Button (if needed) */}
      {filteredProducts.length >= 20 && !limit && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            আরো পণ্য দেখুন
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
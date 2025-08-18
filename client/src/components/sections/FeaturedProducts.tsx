import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingAnimation from "@/components/LoadingAnimation";
import { ArrowRight } from "lucide-react";
import type { Product } from "@shared/schema";

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes for faster updates
    gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
  });

  const featuredProducts = (products || [])
    .filter((product: Product) => 
      product.is_featured || product.is_best_selling || product.is_latest
    )
    .sort((a, b) => {
      // Prioritize featured, then latest, then best selling
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (a.is_latest && !b.is_latest) return -1;
      if (!a.is_latest && b.is_latest) return 1;
      return 0;
    })
    .slice(0, 8);
  
  // If no featured products, show the first 8 products anyway
  const displayProducts = featuredProducts.length > 0 
    ? featuredProducts 
    : (products || []).slice(0, 8);

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <LoadingAnimation message="পণ্য লোড হচ্ছে..." className="my-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Skeleton className="h-80 rounded-xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ফিচারড পণ্য
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            আমাদের সবচেয়ে জনপ্রিয় এবং বেস্ট সেলিং পণ্যগুলো দেখুন
          </p>
        </motion.div>

        {displayProducts.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {displayProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Link href="/products">
                <Button size="lg" variant="outline" className="group">
                  সব পণ্য দেখুন
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                কোনো বিশেষ পণ্য পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                এই মুহূর্তে কোনো ফিচারড বা সর্বশেষ পণ্য নেই
              </p>
            </div>
            <Link href="/products">
              <Button className="btn-primary">সব পণ্য দেখুন</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
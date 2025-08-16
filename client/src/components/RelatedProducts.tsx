import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

interface RelatedProductsProps {
  productId: string;
}

const RelatedProducts = ({ productId }: RelatedProductsProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  // Filter out current product and get random related products
  const relatedProducts = products
    ?.filter((product: Product) => product.id !== productId)
    ?.sort(() => Math.random() - 0.5)
    ?.slice(0, 4) || [];

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          সম্পর্কিত পণ্য
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          এই পণ্যের সাথে গ্রাহকরা আরও কিনেছেন
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {relatedProducts.map((product: Product, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default RelatedProducts;
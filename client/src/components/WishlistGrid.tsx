import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, Heart } from "lucide-react";

const WishlistGrid = () => {
  // For now, showing empty state since wishlist functionality isn't implemented
  const wishlistItems: any[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-96 rounded-xl" />
        ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            আপনার উইশলিস্ট খালি
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            আপনার পছন্দের পণ্যগুলো সেভ করুন এবং পরে কিনুন
          </p>
          <Link href="/products">
            <Button size="lg" className="group">
              <ShoppingBag className="w-5 h-5 mr-2" />
              কেনাকাটা শুরু করুন
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wishlistItems.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};

export default WishlistGrid;
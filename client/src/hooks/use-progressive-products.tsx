import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@shared/schema';

export function useProgressiveProducts() {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isProgressive, setIsProgressive] = useState(false);

  // Fetch all products with caching
  const { data: allProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Progressive loading: show products one by one
  useEffect(() => {
    if (allProducts.length === 0) return;

    setIsProgressive(true);
    setDisplayedProducts([]); // Clear current products

    // Show products progressively - 3 at a time every 100ms
    const showProductsProgressively = () => {
      let index = 0;
      const batchSize = 3; // Show 3 products at once for faster display
      
      const interval = setInterval(() => {
        if (index >= allProducts.length) {
          clearInterval(interval);
          setIsProgressive(false);
          return;
        }

        const nextBatch = allProducts.slice(index, index + batchSize);
        setDisplayedProducts(prev => [...prev, ...nextBatch]);
        index += batchSize;
      }, 100); // Show new batch every 100ms

      return () => clearInterval(interval);
    };

    const cleanup = showProductsProgressively();
    return cleanup;
  }, [allProducts]);

  return {
    products: displayedProducts,
    allProducts,
    isLoading,
    isProgressive,
    error,
    totalCount: allProducts.length,
    displayedCount: displayedProducts.length
  };
}
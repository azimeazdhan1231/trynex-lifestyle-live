import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export function useOptimizedProducts() {
  return useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes in memory
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Pre-fetch products immediately
    placeholderData: [],
  });
}
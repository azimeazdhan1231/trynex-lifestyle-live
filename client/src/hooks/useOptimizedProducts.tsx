
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface UseOptimizedProductsProps {
  category?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

export function useOptimizedProducts({
  category,
  searchTerm = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  pageSize = 16
}: UseOptimizedProductsProps = {}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Ultra-reliable products with instant fallback
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['products-instant', category],
    queryFn: async () => {
      const CACHE_KEY = `products-instant-${category || 'all'}`;
      
      // Try browser cache first for instant loading
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log('⚡ Products loaded instantly from cache');
            // Still fetch fresh data in background
            fetchFreshData(CACHE_KEY);
            return data;
          }
        }
      } catch (e) {
        console.warn('Cache read failed, fetching fresh data');
      }
      
      // Fetch fresh data with timeout
      return await fetchFreshData(CACHE_KEY);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Background fetch function
  async function fetchFreshData(cacheKey: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const url = category ? `/api/products?category=${category}` : '/api/products';
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache immediately for next time
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache products');
      }
      
      console.log('🚀 Fresh products fetched and cached');
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('❌ Products fetch timeout');
        throw new Error('Request timeout - please check your connection');
      }
      
      console.error('❌ Products fetch failed:', error);
      throw error;
    }
  }

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    let filtered = [...allProducts] as Product[];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a: Product, b: Product) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = parseFloat(a.price.toString()) - parseFloat(b.price.toString());
          break;
        case 'created_at':
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          comparison = dateA - dateB;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allProducts, searchTerm, sortBy, sortOrder]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return (filteredProducts as Product[]).slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  // Total pages
  const totalPages = Math.ceil((filteredProducts as Product[]).length / pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm, sortBy, sortOrder]);

  return {
    products: paginatedProducts,
    allProducts: filteredProducts,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalProducts: (filteredProducts as Product[]).length,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

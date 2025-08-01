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

  // Ultra-fast products with instant cache loading
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['products-ultra-fast', category],
    queryFn: async () => {
      const CACHE_KEY = `products-cache-${category || 'all'}`;
      const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year
      
      // Try multiple cache strategies for instant loading
      let cachedData = null;
      
      // 1. Try sessionStorage first (fastest)
      try {
        const sessionCached = sessionStorage.getItem(CACHE_KEY);
        if (sessionCached) {
          cachedData = JSON.parse(sessionCached);
          console.log('⚡ Products loaded from session cache (instant)');
          return cachedData;
        }
      } catch (e) {}
      
      // 2. Try localStorage cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            // Store in session for next instant access
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            console.log('⚡ Products loaded from localStorage cache');
            return data;
          }
        }
      } catch (e) {}
      
      // 3. Fetch with aggressive optimization
      const url = category ? `/api/products?category=${category}` : '/api/products';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      try {
        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'max-age=31536000, immutable',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        
        // Cache in both storages immediately
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {}
        
        console.log('🚀 Products fetched and cached');
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0, // No retries for instant loading
    initialData: () => {
      // Try to get cached data as initial data for instant display
      try {
        const CACHE_KEY = `products-cache-${category || 'all'}`;
        const sessionCached = sessionStorage.getItem(CACHE_KEY);
        if (sessionCached) {
          return JSON.parse(sessionCached);
        }
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data } = JSON.parse(cached);
          return data;
        }
      } catch (e) {}
      return undefined;
    }
  });

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
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
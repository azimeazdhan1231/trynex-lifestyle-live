
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface UseUltraFastProductsProps {
  category?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

export function useUltraFastProducts({
  category,
  searchTerm = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  pageSize = 16
}: UseUltraFastProductsProps = {}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Ultra-aggressive caching strategy
  const { data: allProducts = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['products-ultra-fast-v2', category],
    queryFn: async () => {
      const CACHE_KEY = `trynex-products-ultra-v2-${category || 'all'}`;
      const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
      
      // Check browser cache for instant response
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_DURATION) {
            console.log(`⚡ INSTANT browser cache (${Math.round(age / 1000)}s old)`);
            
            // Start background fetch for freshness
            setTimeout(() => {
              fetch(category ? `/api/products?category=${category}` : '/api/products')
                .then(res => res.json())
                .then(freshData => {
                  localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: freshData,
                    timestamp: Date.now()
                  }));
                })
                .catch(() => {});
            }, 100);
            
            return data;
          }
        }
      } catch (e) {}
      
      // Fetch with ultra-aggressive timeout
      const url = category ? `/api/products?category=${category}` : '/api/products';
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        console.log('🚀 Ultra-fast API fetch...');
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=30',
            'Accept': 'application/json',
            'X-Ultra-Fast': 'true'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        
        // Cache immediately
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
        
        console.log(`⚡ Ultra-fast fetch complete: ${data.length} products`);
        return data;
        
      } catch (error) {
        console.warn('⚠️ Ultra-fast fetch failed:', error.message);
        
        // Return stale cache if available
        try {
          const stale = localStorage.getItem(CACHE_KEY);
          if (stale) {
            const { data } = JSON.parse(stale);
            console.log(`📦 Using stale cache: ${data.length} products`);
            return data;
          }
        } catch (e) {}
        
        // Emergency fallback
        return [
          {
            id: 'fallback-1',
            name: 'প্রিমিয়াম কাস্টম গিফট',
            price: '1500',
            image_url: 'https://i.postimg.cc/pT6F3Vzb/download.jpg',
            category: 'কাস্টম গিফট',
            description: 'বিশেষ কাস্টম উপহার',
            stock: 100,
            is_featured: true
          }
        ];
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false, // No retries for instant response
    networkMode: 'always'
  });

  // Instant filtering and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts] as Product[];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term)
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
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allProducts, searchTerm, sortBy, sortOrder]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return (filteredProducts as Product[]).slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil((filteredProducts as Product[]).length / pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm, sortBy, sortOrder]);

  return {
    products: paginatedProducts,
    allProducts: filteredProducts,
    isLoading: isLoading && allProducts.length === 0, // Only show loading if no data
    isFetching,
    error,
    currentPage,
    totalPages,
    totalProducts: (filteredProducts as Product[]).length,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

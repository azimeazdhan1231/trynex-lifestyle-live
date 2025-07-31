import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@shared/schema';

interface UseInfiniteProductsOptions {
  category?: string;
  searchTerm?: string;
  sortBy?: string;
  priceRange?: string;
  pageSize?: number;
  enabled?: boolean;
}

interface UseInfiniteProductsReturn {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  error: Error | null;
  totalCount: number;
  currentPage: number;
}

export const useInfiniteProducts = (options: UseInfiniteProductsOptions = {}): UseInfiniteProductsReturn => {
  const {
    category = 'all',
    searchTerm = '',
    sortBy = 'newest',
    priceRange = 'all',
    pageSize = 12,
    enabled = true
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Query for all products with optimized caching
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    enabled,
    retry: 1,
    placeholderData: []
  });

  // Filter and sort products
  const processedProducts = products
    .filter((product) => {
      // Category filter
      if (category !== 'all' && product.category !== category) return false;
      
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Price range filter
      if (priceRange !== 'all') {
        const price = Number(product.price);
        switch (priceRange) {
          case 'under-500':
            if (price >= 500) return false;
            break;
          case '500-1000':
            if (price < 500 || price > 1000) return false;
            break;
          case '1000-2000':
            if (price < 1000 || price > 2000) return false;
            break;
          case 'over-2000':
            if (price <= 2000) return false;
            break;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return Number(a.price) - Number(b.price);
        case 'price-high':
          return Number(b.price) - Number(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

  // Update displayed products when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllProducts(processedProducts.slice(0, pageSize));
  }, [category, searchTerm, sortBy, priceRange, pageSize, products]);

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasNextPage) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newProducts = processedProducts.slice(startIndex, endIndex);
      
      setAllProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 300);
  }, [currentPage, pageSize, processedProducts, isLoadingMore]);

  // Calculate if there's a next page
  const hasNextPage = allProducts.length < processedProducts.length;

  return {
    products: allProducts,
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    error: error as Error | null,
    totalCount: processedProducts.length,
    currentPage
  };
};
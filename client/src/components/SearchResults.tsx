import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { Product } from '@shared/schema';

interface SearchResultsProps {
  query: string;
}

const SearchResults = ({ query }: SearchResultsProps) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products', 'search', query],
    queryFn: async () => {
      if (!query.trim()) {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
      }
      
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search products');
      return response.json();
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">অনুসন্ধানে ত্রুটি ঘটেছে। আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {query ? `"${query}" এর জন্য কোনো পণ্য পাওয়া যায়নি।` : 'কোনো পণ্য পাওয়া যায়নি।'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          অন্য কোনো শব্দ দিয়ে অনুসন্ধান করে দেখুন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        {products.length} টি পণ্য পাওয়া গেছে
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product: Product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            data-testid={`product-card-${product.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
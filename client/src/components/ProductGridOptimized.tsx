import React, { memo } from 'react';
import OptimizedProductCard from './OptimizedProductCard';
import InfiniteScrollContainer from './InfiniteScrollContainer';
import { cn } from '@/lib/utils';
import type { Product } from '@shared/schema';

interface ProductGridOptimizedProps {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const ProductGridOptimized: React.FC<ProductGridOptimizedProps> = memo(({
  products,
  isLoading,
  isLoadingMore,
  hasNextPage,
  onLoadMore,
  onAddToCart,
  onViewProduct,
  onCustomize,
  viewMode = 'grid',
  className
}) => {
  // Loading state with skeleton cards
  if (isLoading && products.length === 0) {
    return (
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4",
        className
      )}>
        {Array.from({ length: 12 }).map((_, index) => (
          <OptimizedProductCard
            key={`skeleton-${index}`}
            product={{} as Product}
            onAddToCart={() => {}}
            onViewProduct={() => {}}
            onCustomize={onCustomize}
            loading={true}
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          কোন পণ্য পাওয়া যায়নি
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      hasNextPage={hasNextPage}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
      className={className}
    >
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      )}>
        {products.map((product, index) => (
          <OptimizedProductCard
            key={`${product.id}-${index}`}
            product={product}
            onAddToCart={onAddToCart}
            onViewProduct={onViewProduct}
            onCustomize={onCustomize}
            className={viewMode === 'list' ? "flex flex-row" : undefined}
          />
        ))}
      </div>
    </InfiniteScrollContainer>
  );
});

ProductGridOptimized.displayName = 'ProductGridOptimized';

export default ProductGridOptimized;
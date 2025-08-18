
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Package,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ProductSkeleton, ErrorState, EmptyState } from './enhanced-loading-system';
import { formatPrice } from '@/lib/constants';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  description?: string;
  category?: string;
  featured?: boolean;
  bestseller?: boolean;
  new?: boolean;
}

interface ProductGridProps {
  category?: string;
  limit?: number;
  featured?: boolean;
  className?: string;
}

const fetchProducts = async (params: any = {}): Promise<Product[]> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const url = `/api/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export default function EnhancedProductGrid({ 
  category, 
  limit, 
  featured, 
  className = '' 
}: ProductGridProps) {
  const [retryCount, setRetryCount] = useState(0);

  const { 
    data: products = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['products', { category, limit, featured, retryCount }],
    queryFn: () => fetchProducts({ category, limit, featured }),
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className={className}>
        <ProductSkeleton count={limit || 8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState 
          message="পণ্যের তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={className}>
        <EmptyState 
          title="কোনো পণ্য পাওয়া যায়নি"
          description="এই মুহূর্তে কোনো পণ্য উপলব্ধ নেই।"
        />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        
        {!imageError ? (
          <img
            src={product.image_url || product.image || '/placeholder-product.png'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-yellow-500 text-white text-xs">বিশেষ</Badge>
          )}
          {product.new && (
            <Badge className="bg-green-500 text-white text-xs">নতুন</Badge>
          )}
          {product.bestseller && (
            <Badge className="bg-purple-500 text-white text-xs">বেস্টসেলার</Badge>
          )}
        </div>

        {/* Action buttons - show on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">৪.৫</span>
          </div>
        </div>

        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 text-sm"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          কার্টে যোগ করুন
        </Button>
      </CardContent>
    </Card>
  );
}

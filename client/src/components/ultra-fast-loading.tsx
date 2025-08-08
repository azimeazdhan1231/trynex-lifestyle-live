
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

interface UltraFastLoadingProps {
  isLoading: boolean;
  hasData: boolean;
  children: React.ReactNode;
  minimumDuration?: number;
}

const ProductGridSkeleton = () => (
  <div className="space-y-6">
    {/* Quick loading indicator */}
    <div className="text-center py-4">
      <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">দ্রুত লোড হচ্ছে...</span>
      </div>
    </div>

    {/* Product grid skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export function UltraFastLoading({ 
  isLoading, 
  hasData, 
  children, 
  minimumDuration = 300 
}: UltraFastLoadingProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStartTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading && hasData) {
      const elapsed = Date.now() - loadingStartTime;
      
      if (elapsed < minimumDuration) {
        // Ensure loading shows for minimum duration for better UX
        const remainingTime = minimumDuration - elapsed;
        setTimeout(() => setShowLoading(false), remainingTime);
      } else {
        setShowLoading(false);
      }
    }
  }, [isLoading, hasData, loadingStartTime, minimumDuration]);

  if (showLoading || isLoading) {
    return <ProductGridSkeleton />;
  }

  return <>{children}</>;
}

export default UltraFastLoading;

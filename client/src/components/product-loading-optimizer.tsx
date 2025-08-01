import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ProductLoadingOptimizerProps {
  isLoading: boolean;
  itemCount?: number;
  showProductsOnLoad?: boolean;
}

// Enhanced loading skeleton with proper timing
function EnhancedProductSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-size-200 animate-shimmer"></div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300" />
          <Skeleton className="h-3 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 bg-gradient-to-r from-gray-200 to-gray-300" />
          <Skeleton className="h-8 flex-1 bg-gradient-to-r from-gray-200 to-gray-300" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductLoadingOptimizer({ 
  isLoading, 
  itemCount = 12,
  showProductsOnLoad = false 
}: ProductLoadingOptimizerProps) {
  // Only show loading when explicitly loading products
  if (!isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Simple Loading Message */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">পণ্য লোড হচ্ছে...</span>
        </div>
      </div>

      {/* Simple Skeleton Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <EnhancedProductSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// CSS for shimmer effect (add to your global CSS)
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.bg-size-200 {
  background-size: 200% 100%;
}

@media (max-width: 640px) {
  .animate-shimmer {
    animation-duration: 1.2s;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}
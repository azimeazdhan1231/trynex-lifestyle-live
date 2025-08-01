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
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [loadingText, setLoadingText] = useState("পণ্য লোড করা হচ্ছে...");

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowSkeletons(false), 200);
      return () => clearTimeout(timer);
    } else {
      setShowSkeletons(true);
      
      // Dynamic loading messages
      const messages = [
        "পণ্য লোড করা হচ্ছে...",
        "সেরা পণ্যগুলো খুঁজে আনা হচ্ছে...",
        "প্রায় শেষ...",
      ];
      
      let messageIndex = 0;
      const messageTimer = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingText(messages[messageIndex]);
      }, 1500);

      return () => clearInterval(messageTimer);
    }
  }, [isLoading]);

  // Show products immediately without loading screen if specified
  if (showProductsOnLoad && !isLoading) {
    return null;
  }

  if (!isLoading && !showSkeletons) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Loading Message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-full">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 font-medium">{loadingText}</span>
        </div>
      </div>

      {/* Skeleton Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <EnhancedProductSkeleton key={index} />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
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
import { Card, CardContent } from "@/components/ui/card";

interface PremiumLoadingSkeletonProps {
  variant?: "grid" | "list";
  count?: number;
  className?: string;
}

const PremiumProductSkeleton = ({ variant = "grid" }: { variant?: "grid" | "list" }) => {
  if (variant === "list") {
    return (
      <Card className="premium-card animate-pulse">
        <div className="flex h-32 sm:h-40">
          {/* Image Skeleton */}
          <div className="w-32 sm:w-40 flex-shrink-0">
            <div className="w-full h-full premium-skeleton rounded-l-lg" />
          </div>
          
          {/* Content Skeleton */}
          <div className="flex-1 p-3 sm:p-4 space-y-3">
            <div className="space-y-2">
              <div className="premium-skeleton h-4 w-3/4" />
              <div className="premium-skeleton h-3 w-1/2" />
            </div>
            
            <div className="flex justify-between items-end mt-auto">
              <div className="space-y-1">
                <div className="premium-skeleton h-6 w-20" />
                <div className="premium-skeleton h-3 w-16" />
              </div>
              <div className="flex gap-2">
                <div className="premium-skeleton h-8 w-8 rounded" />
                <div className="premium-skeleton h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="premium-card animate-pulse overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-[4/5] premium-skeleton" />
      
      {/* Content Skeleton */}
      <CardContent className="p-4 space-y-4">
        {/* Category Badge */}
        <div className="premium-skeleton h-5 w-16 rounded-full" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="premium-skeleton h-5 w-full" />
          <div className="premium-skeleton h-5 w-3/4" />
        </div>
        
        {/* Description */}
        <div className="space-y-1">
          <div className="premium-skeleton h-3 w-full" />
          <div className="premium-skeleton h-3 w-2/3" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="premium-skeleton w-3 h-3 rounded-sm" />
            ))}
          </div>
          <div className="premium-skeleton h-3 w-16" />
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="premium-skeleton h-7 w-24" />
            <div className="premium-skeleton h-3 w-16" />
          </div>
          <div className="flex gap-2">
            <div className="premium-skeleton h-8 w-8 rounded" />
            <div className="premium-skeleton h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PremiumLoadingSkeleton({ 
  variant = "grid", 
  count = 8,
  className = "" 
}: PremiumLoadingSkeletonProps) {
  return (
    <div className={`premium-grid ${variant === "list" ? "space-y-4" : "premium-grid-responsive"} ${className}`}>
      {[...Array(count)].map((_, index) => (
        <PremiumProductSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
}

// Enhanced loading for hero sections
export const PremiumHeroSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl premium-card animate-pulse">
    <div className="aspect-[16/9] md:aspect-[21/9] premium-skeleton" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="premium-skeleton h-12 w-64 mx-auto" />
        <div className="premium-skeleton h-6 w-48 mx-auto" />
        <div className="premium-skeleton h-10 w-32 mx-auto rounded-full" />
      </div>
    </div>
  </div>
);

// Enhanced loading for category sections
export const PremiumCategorySkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="premium-skeleton h-8 w-48" />
      <div className="premium-skeleton h-6 w-24" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="premium-card animate-pulse p-4 text-center">
          <div className="premium-skeleton w-12 h-12 rounded-full mx-auto mb-3" />
          <div className="premium-skeleton h-4 w-3/4 mx-auto mb-1" />
          <div className="premium-skeleton h-3 w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

// Enhanced loading for stats/features
export const PremiumStatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="premium-card animate-pulse p-6 text-center">
        <div className="premium-skeleton w-10 h-10 rounded-full mx-auto mb-4" />
        <div className="premium-skeleton h-8 w-16 mx-auto mb-2" />
        <div className="premium-skeleton h-4 w-20 mx-auto" />
      </div>
    ))}
  </div>
);
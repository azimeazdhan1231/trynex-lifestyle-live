import { Card, CardContent, Skeleton } from '@/components/ui';

interface LoadingSkeletonProps {
  variant?: 'product' | 'product-grid' | 'hero' | 'feature' | 'category';
  count?: number;
  className?: string;
}

export default function EnhancedLoadingSkeleton({ 
  variant = 'product', 
  count = 1, 
  className = '' 
}: LoadingSkeletonProps) {
  const renderProductSkeleton = () => (
    <Card className="overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="aspect-square bg-gray-200 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );

  const renderProductGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          {renderProductSkeleton()}
        </div>
      ))}
    </div>
  );

  const renderHeroSkeleton = () => (
    <div className="min-h-[60vh] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center">
      <div className="text-center space-y-6 w-full max-w-2xl">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-16 w-96 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );

  const renderFeatureSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </Card>
      ))}
    </div>
  );

  const renderCategorySkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 animate-pulse" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'product':
        return renderProductSkeleton();
      case 'product-grid':
        return renderProductGridSkeleton();
      case 'hero':
        return renderHeroSkeleton();
      case 'feature':
        return renderFeatureSkeleton();
      case 'category':
        return renderCategorySkeleton();
      default:
        return renderProductSkeleton();
    }
  };

  return (
    <div className={`animate-fade-in ${className}`}>
      {renderContent()}
    </div>
  );
}

// Specialized loading components
export function ProductGridSkeleton({ count = 8, className = '' }: { count?: number; className?: string }) {
  return (
    <EnhancedLoadingSkeleton 
      variant="product-grid" 
      count={count} 
      className={className} 
    />
  );
}

export function HeroSkeleton({ className = '' }: { className?: string }) {
  return (
    <EnhancedLoadingSkeleton 
      variant="hero" 
      className={className} 
    />
  );
}

export function FeatureSkeleton({ className = '' }: { className?: string }) {
  return (
    <EnhancedLoadingSkeleton 
      variant="feature" 
      className={className} 
    />
  );
}

export function CategorySkeleton({ count = 6, className = '' }: { count?: number; className?: string }) {
  return (
    <EnhancedLoadingSkeleton 
      variant="category" 
      count={count} 
      className={className} 
    />
  );
}

// Loading overlay for modals and full-screen loading
export function LoadingOverlay({ 
  message = "লোড হচ্ছে...", 
  showSpinner = true,
  className = '' 
}: { 
  message?: string; 
  showSpinner?: boolean;
  className?: string;
}) {
  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
        {showSpinner && (
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600 text-sm">অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    </div>
  );
}

// Inline loading spinner
export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin ${className}`} />
  );
}

// Skeleton for text content
export function TextSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}
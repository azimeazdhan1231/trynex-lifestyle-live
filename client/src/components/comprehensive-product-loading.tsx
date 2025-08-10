import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star, Clock, Package, Sparkles } from "lucide-react";

interface ProductLoadingSkeletonProps {
  count?: number;
  showPulse?: boolean;
  variant?: 'grid' | 'carousel' | 'list';
  className?: string;
}

function ProductLoadingSkeleton({ showPulse = true, variant = 'grid' }: { showPulse?: boolean; variant?: 'grid' | 'carousel' | 'list' }) {
  return (
    <Card className={`group overflow-hidden border border-gray-100 ${showPulse ? 'animate-pulse' : ''} bg-white hover:shadow-lg transition-all duration-300`}>
      <div className="relative">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer-wave" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 animate-float" />
          </div>
        </div>

        {/* Badge Skeletons */}
        <div className="absolute top-3 left-3 space-y-2">
          <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer" />
        </div>

        {/* Stock Badge Skeleton */}
        <div className="absolute top-3 right-3">
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer-wave" />
          <div className="h-4 w-3/4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-shimmer-wave" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Price and Stock Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-6 w-24 bg-gradient-to-r from-primary/20 to-primary/30 rounded animate-shimmer" />
            <div className="h-3 w-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-shimmer" style={{ animationDelay: '0.4s' }} />
          </div>
          <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Buttons Skeleton */}
        <div className="space-y-2">
          <div className="h-10 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg animate-shimmer-wave" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-shimmer" style={{ animationDelay: '0.6s' }} />
            <div className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-shimmer" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComprehensiveProductLoading({ 
  count = 8, 
  showPulse = true, 
  variant = 'grid',
  className = ""
}: ProductLoadingSkeletonProps) {
  const gridClass = variant === 'grid' 
    ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
    : variant === 'carousel'
    ? "flex space-x-4 overflow-hidden"
    : "space-y-4";

  return (
    <div className={`${className}`}>
      {/* Premium Loading Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-full animate-premium-pulse flex items-center justify-center">
              <Package className="w-8 h-8 text-primary animate-float" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce">
              <Sparkles className="w-4 h-4 text-white m-1" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-8 w-64 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-lg animate-shimmer-wave shadow-sm" />
            <div className="h-4 w-48 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-shimmer-wave" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 animate-pulse">
            আমাদের সেরা পণ্যগুলো লোড হচ্ছে...
          </h3>
          <div className="flex items-center justify-center space-x-3 text-gray-500">
            <Clock className="w-5 h-5 animate-spin" />
            <span className="text-sm">অনুগ্রহ করে অপেক্ষা করুন</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full animate-loading-progress" />
          </div>
        </div>
        
        <div className="w-32 h-1 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 mx-auto mt-8 rounded-full animate-premium-pulse" />
      </div>

      {/* Product Grid Loading */}
      <div className={gridClass}>
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="transform transition-all duration-500"
            style={{
              animation: `fadeInUp 0.8s ease-out ${index * 100}ms forwards`,
              opacity: 0
            }}
          >
            <ProductLoadingSkeleton showPulse={showPulse} variant={variant} />
          </div>
        ))}
      </div>

      {/* Loading Stats */}
      <div className="mt-16 text-center">
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mx-auto animate-pulse flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-shimmer" />
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto animate-shimmer" style={{ animationDelay: '0.3s' }} />
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full mx-auto animate-pulse flex items-center justify-center" style={{ animationDelay: '0.2s' }}>
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-shimmer" style={{ animationDelay: '0.4s' }} />
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto animate-shimmer" style={{ animationDelay: '0.7s' }} />
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full mx-auto animate-pulse flex items-center justify-center" style={{ animationDelay: '0.4s' }}>
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-shimmer" style={{ animationDelay: '0.6s' }} />
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto animate-shimmer" style={{ animationDelay: '0.9s' }} />
          </div>
        </div>
      </div>

      {/* Premium Loading Footer */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-100 via-white to-gray-100 px-8 py-4 rounded-full shadow-lg animate-shimmer-wave">
          <div className="w-5 h-5 bg-gradient-to-r from-primary/40 to-primary/60 rounded-full animate-pulse" />
          <div className="h-4 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
        </div>
      </div>
      
      {/* Premium Loading Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent pointer-events-none animate-shine" />


    </div>
  );
}
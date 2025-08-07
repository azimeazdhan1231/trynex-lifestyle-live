import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Heart, ShoppingCart } from "lucide-react";

export default function PremiumLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
      style={{ contain: 'layout style paint' }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card 
          key={index} 
          className="group relative overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="relative">
            {/* Premium Image Skeleton with Advanced Shimmer */}
            <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-wave"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-wave 2s infinite'
                }}
              />
              
              {/* Floating placeholder elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
              <div className="absolute top-6 right-6 w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Premium Badge Skeleton */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-2 py-1 rounded-md animate-pulse">
                <div className="w-3 h-3 bg-yellow-300 rounded-full" />
                <Skeleton className="h-3 w-12 bg-yellow-200" />
              </div>
            </div>

            {/* Premium Wishlist Button Skeleton */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center animate-pulse">
                <Heart className="w-4 h-4 text-gray-300" />
              </div>
            </div>

            {/* Hover Overlay Skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex gap-2 mb-2">
                <Skeleton className="flex-1 h-8 bg-white/20 rounded-md" />
                <Skeleton className="flex-1 h-8 bg-primary/20 rounded-md" />
              </div>
              <Skeleton className="w-full h-8 bg-white/20 rounded-md" />
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Premium Title Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
              <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" style={{ animationDelay: '0.2s' }} />
            </div>
            
            {/* Premium Price and Rating Skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-20 bg-gradient-to-r from-primary/20 to-primary/40 animate-shimmer" />
                <Skeleton className="h-4 w-16 bg-green-100 rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-gray-200" />
                <Skeleton className="h-4 w-8 bg-yellow-100" />
                <Skeleton className="h-3 w-6 bg-gray-200" />
              </div>
            </div>

            {/* Premium Mobile Buttons Skeleton */}
            <div className="flex gap-2 sm:hidden">
              <Skeleton className="flex-1 h-9 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md" />
              <Skeleton className="flex-1 h-9 bg-gradient-to-r from-primary/20 to-primary/30 rounded-md" />
            </div>
            
            <Skeleton className="w-full h-9 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md sm:hidden" />
          </CardContent>

          {/* Premium Loading Pulse Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
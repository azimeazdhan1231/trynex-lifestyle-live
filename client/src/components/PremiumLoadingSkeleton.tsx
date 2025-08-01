import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PremiumLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
          <div className="relative">
            {/* Image skeleton with shimmer effect */}
            <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            
            {/* Badge skeleton */}
            <div className="absolute top-3 left-3">
              <Skeleton className="h-6 w-20 bg-gray-300" />
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-full bg-gray-200" />
            <Skeleton className="h-4 w-3/4 bg-gray-200" />
            
            {/* Price and category skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-20 bg-gray-300" />
              <Skeleton className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>

            {/* Buttons skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full bg-gradient-to-r from-blue-200 to-purple-200" />
              <Skeleton className="h-10 w-full bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
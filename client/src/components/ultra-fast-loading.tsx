import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface UltraFastLoadingProps {
  isLoading: boolean;
  hasData: boolean;
  children: React.ReactNode;
  minimumDuration?: number; // Ensure loading shows for at least this long
}

export function UltraFastLoading({ 
  isLoading, 
  hasData, 
  children, 
  minimumDuration = 0 
}: UltraFastLoadingProps) {
  // Show content immediately when available
  if (!isLoading && hasData) {
    return <>{children}</>;
  }

  // Only show skeleton if actually loading and no data
  if (isLoading && !hasData) {
    return <ProductGridSkeleton />;
  }

  return <>{children}</>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full aspect-square" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
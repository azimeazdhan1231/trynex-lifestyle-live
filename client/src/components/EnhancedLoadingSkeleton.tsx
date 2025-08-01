import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Eye, Star, Sparkles, TrendingUp, Gift } from "lucide-react";
import { useEffect, useState } from "react";

interface EnhancedLoadingSkeletonProps {
  count?: number;
  minimumDuration?: number; // Minimum loading time in ms
  onLoadingComplete?: () => void;
}

export default function EnhancedLoadingSkeleton({ 
  count = 6, 
  minimumDuration = 5000,
  onLoadingComplete 
}: EnhancedLoadingSkeletonProps) {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Phase 1: Initial connection (0-1s)
    const phase1Timer = setTimeout(() => setLoadingPhase(1), 800);
    
    // Phase 2: Loading products (1-2.5s)
    const phase2Timer = setTimeout(() => setLoadingPhase(2), 2000);
    
    // Phase 3: Optimizing display (2.5-4s)
    const phase3Timer = setTimeout(() => setLoadingPhase(3), 3500);
    
    // Phase 4: Finalizing (4-5s)
    const phase4Timer = setTimeout(() => setLoadingPhase(4), 4500);
    
    // Complete loading after minimum duration
    const completeTimer = setTimeout(() => {
      setShowContent(true);
      onLoadingComplete?.();
    }, minimumDuration);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearTimeout(phase4Timer);
      clearTimeout(completeTimer);
    };
  }, [minimumDuration, onLoadingComplete]);

  const getLoadingText = () => {
    switch (loadingPhase) {
      case 0: return "ডাটাবেস সংযোগ স্থাপন করছি...";
      case 1: return "সেরা পণ্য খুঁজে আনছি...";
      case 2: return "দাম ও স্টক আপডেট করছি...";
      case 3: return "ইমেজ অপ্টিমাইজ করছি...";
      case 4: return "প্রায় সম্পন্ন...";
      default: return "লোড হচ্ছে...";
    }
  };

  if (showContent) {
    return null; // This component hides itself after loading
  }

  return (
    <div className="space-y-8">
      {/* Loading header with animated text */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 animate-pulse">
            {getLoadingText()}
          </h3>
        </div>
        
        {/* Progress bar */}
        <div className="w-80 mx-auto bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full transition-all duration-800 ease-out shadow-lg"
            style={{ 
              width: `${Math.min(100, (loadingPhase + 1) * 20)}%`,
              animation: 'shimmer 1.5s infinite'
            }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500 mt-3 animate-pulse">
          {loadingPhase < 3 ? "আমাদের প্রিমিয়াম কালেকশন প্রস্তুত করছি..." : "সবকিছু প্রস্তুত!"}
        </p>
        
        <div className="flex items-center justify-center space-x-4 mt-4">
          <div className="text-xs text-gray-400 flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${loadingPhase >= 1 ? 'bg-green-400' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <span>ডাটাবেস</span>
          </div>
          <div className="text-xs text-gray-400 flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${loadingPhase >= 2 ? 'bg-blue-400' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <span>পণ্য</span>
          </div>
          <div className="text-xs text-gray-400 flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${loadingPhase >= 3 ? 'bg-purple-400' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <span>ইমেজ</span>
          </div>
          <div className="text-xs text-gray-400 flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${loadingPhase >= 4 ? 'bg-orange-400' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <span>সম্পন্ন</span>
          </div>
        </div>
      </div>

      {/* Enhanced product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 animate-pulse"
            style={{
              animationDelay: `${index * 200}ms`,
              animationDuration: '2s'
            }}
          >
            <div className="relative">
              {/* Advanced shimmer image skeleton */}
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
                {/* Animated shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                
                {/* Floating icons animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <ShoppingCart 
                      className="w-8 h-8 text-gray-400 animate-bounce" 
                      style={{ animationDelay: `${index * 100}ms` }}
                    />
                    <Heart 
                      className="w-4 h-4 text-red-300 absolute -top-2 -right-2 animate-ping" 
                      style={{ animationDelay: `${index * 150}ms` }}
                    />
                  </div>
                </div>
                
                {/* Corner badge skeleton */}
                <div className="absolute top-3 left-3">
                  <div className="px-2 py-1 bg-primary/20 rounded-full">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-primary/60 animate-pulse" />
                      <Skeleton className="h-3 w-8 bg-primary/30" />
                    </div>
                  </div>
                </div>

                {/* Stock indicator */}
                <div className="absolute top-3 right-3">
                  <Skeleton className="h-6 w-16 bg-green-200 rounded-full" />
                </div>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Product title with typewriter effect */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300" />
              </div>
              
              {/* Price and rating skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
                  <Skeleton className="h-6 w-20 bg-gradient-to-r from-primary/20 to-primary/40" />
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-3 h-3 text-yellow-300 animate-pulse" 
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Skeleton className="h-9 flex-1 bg-gradient-to-r from-primary/30 to-primary/50 rounded-lg">
                    <div className="flex items-center justify-center h-full">
                      <ShoppingCart className="w-4 h-4 text-primary/60 animate-pulse" />
                    </div>
                  </Skeleton>
                  <Skeleton className="h-9 w-9 bg-gray-200 rounded-lg">
                    <div className="flex items-center justify-center h-full">
                      <Eye className="w-4 h-4 text-gray-400 animate-pulse" />
                    </div>
                  </Skeleton>
                </div>
                
                <Skeleton className="h-9 w-full bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg">
                  <div className="flex items-center justify-center h-full">
                    <Gift className="w-4 h-4 text-purple-400 animate-bounce" />
                  </div>
                </Skeleton>
              </div>

              {/* Feature indicators */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Skeleton className="h-4 w-4 bg-green-200 rounded-full animate-pulse" />
                  <Skeleton className="h-3 w-16 bg-green-200" />
                </div>
                <Skeleton className="h-3 w-20 bg-blue-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom loading indicators */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {count} টি পণ্য লোড হচ্ছে
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span>সর্বোচ্চ মানের পণ্য</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '500ms' }}></div>
            <span>দ্রুত ডেলিভারি</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1000ms' }}></div>
            <span>সাশ্রয়ী দাম</span>
          </div>
        </div>
      </div>
    </div>
  );
}
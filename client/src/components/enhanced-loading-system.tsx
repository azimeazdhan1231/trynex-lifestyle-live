import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}

// Enhanced Product Skeleton with smooth animations
export function EnhancedProductSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progressive Loading with Connection Status
export function ProgressiveLoader({ 
  loadingState, 
  onRetry,
  children 
}: { 
  loadingState: LoadingState;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'slow'>('online');
  
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Detect slow connection
    if (loadingState.isLoading) {
      const slowTimer = setTimeout(() => {
        if (navigator.onLine && loadingState.isLoading) {
          setConnectionStatus('slow');
        }
      }, 3000);
      
      return () => {
        clearTimeout(slowTimer);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadingState.isLoading]);

  if (loadingState.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <Wifi className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">ডেটা লোড করতে সমস্যা</h3>
          <p className="text-red-600 mb-4">{loadingState.error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              আবার চেষ্টা করুন
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loadingState.isLoading) {
    return (
      <div className="space-y-6">
        {/* Connection Status Indicator */}
        <div className="flex items-center justify-center p-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm ${
            connectionStatus === 'online' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'slow' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {connectionStatus === 'online' ? 'ডেটা লোড হচ্ছে...' :
               connectionStatus === 'slow' ? 'ধীর সংযোগ, অপেক্ষা করুন...' :
               'অফলাইন মোড'}
            </span>
            {loadingState.progress && (
              <span className="text-xs">({Math.round(loadingState.progress)}%)</span>
            )}
          </div>
        </div>
        
        {/* Enhanced Loading Skeleton */}
        <EnhancedProductSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}

// Smart Error Boundary for Performance Issues
export function PerformanceErrorBoundary({ 
  children,
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const resetError = () => {
    setHasError(false);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    if (hasError && retryCount < 3) {
      const timer = setTimeout(() => {
        resetError();
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [hasError, retryCount]);

  if (hasError) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">কিছু সমস্যা হয়েছে</h3>
          <p className="text-gray-600 mb-4">আমরা সমস্যাটি ঠিক করার চেষ্টা করছি...</p>
          {retryCount < 3 ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>আবার চেষ্টা করা হচ্ছে ({retryCount + 1}/3)</span>
            </div>
          ) : (
            <Button onClick={resetError} variant="outline">
              ম্যানুয়াল রিট্রাই
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Performance Monitor Component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    loadTime: number;
    renderTime: number;
  } | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setPerformanceMetrics({
            loadTime: startTime,
            renderTime: entry.duration
          });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    
    // Mark when component is ready
    setTimeout(() => {
      performance.mark('component-ready');
      performance.measure('render-time', 'navigationStart', 'component-ready');
    }, 0);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs font-mono">
          Load: {Math.round(performanceMetrics.loadTime)}ms | 
          Render: {Math.round(performanceMetrics.renderTime)}ms
        </div>
      )}
    </>
  );
}
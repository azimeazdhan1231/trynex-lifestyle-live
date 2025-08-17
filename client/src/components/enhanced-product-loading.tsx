import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedProductLoadingProps {
  children: (products: any[], isLoading: boolean, error: any) => React.ReactNode;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  category?: string;
}

export default function EnhancedProductLoading({ children }: EnhancedProductLoadingProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);

  const {
    data: products = [] as Product[],
    isLoading,
    error,
    refetch,
    isRefetching,
    isFetching
  } = useQuery<Product[]>({
    queryKey: ['/api/products', retryCount],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second max timeout
      
      try {
        const response = await fetch('/api/products', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=60',
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Products loaded: ${data.length} items`);
        setLastSuccessTime(Date.now());
        return data;
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('⚠️ Product fetch failed:', error.message);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for faster updates
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    networkMode: 'online',
    retry: 1, // Only retry once for faster failure
    retryDelay: 1000, // Quick retry
    meta: {
      errorMessage: 'পণ্য লোড করতে সমস্যা হচ্ছে'
    }
  });

  // Handle successful data loading
  React.useEffect(() => {
    if (products && products.length > 0 && !isLoading && !error) {
      setLastSuccessTime(Date.now());
      console.log(`✅ Products loaded successfully: ${products.length} items`);
    }
  }, [products, isLoading, error]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      console.error('❌ Product loading failed:', error);
    }
  }, [error]);

  const handleRetry = React.useCallback(() => {
    console.log('🔄 Manual retry initiated');
    setRetryCount(prev => prev + 1);
    refetch();
  }, [refetch]);

  // Show enhanced loading state
  if (isLoading && !products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-4 sm:mb-6">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
          <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-primary/20 animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 mb-2 text-base sm:text-lg font-medium">পণ্য লোড হচ্ছে...</p>
          <p className="text-sm text-gray-500">সর্বোত্তম পণ্য খুঁজে আনছি</p>
        </div>
        
        {/* Loading skeleton preview */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show enhanced error state with retry option
  if (error && !products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-200 animate-pulse"></div>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            পণ্য লোড করতে সমস্যা হচ্ছে
          </h3>
          <p className="text-gray-600 text-center max-w-md text-sm sm:text-base leading-relaxed">
            আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন। সমস্যা বজায় থাকলে কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            disabled={isRefetching}
            className="flex items-center gap-2 h-11 px-6 text-base"
          >
            {isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            আবার চেষ্টা করুন
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 h-10 px-4 text-sm"
          >
            পেজ রিফ্রেশ করুন
          </Button>
        </div>

        {lastSuccessTime && (
          <p className="text-xs text-gray-500 mt-6 text-center">
            শেষ সফল লোড: {new Date(lastSuccessTime).toLocaleTimeString('bn-BD')}
          </p>
        )}
      </div>
    );
  }

  // Show partial error if we have cached data but latest fetch failed
  if (error && products.length > 0) {
    return (
      <div className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            সর্বশেষ তথ্য আপডেট করতে সমস্যা হচ্ছে। পুরানো ডেটা দেখানো হচ্ছে।
            <Button
              variant="link"
              size="sm"
              onClick={handleRetry}
              className="h-auto p-0 ml-2 text-yellow-700 underline"
            >
              আপডেট করুন
            </Button>
          </AlertDescription>
        </Alert>
        {children(products, isLoading, null)}
      </div>
    );
  }

  // Show enhanced empty state if no products found
  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            কোনো পণ্য পাওয়া যায়নি
          </h3>
          <p className="text-gray-600 text-center max-w-md text-sm sm:text-base leading-relaxed">
            এই মুহূর্তে আমাদের কোনো পণ্য স্টকে নেই। শীঘ্রই নতুন পণ্য যুক্ত হবে।
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            className="flex items-center gap-2 h-11 px-6"
          >
            <RefreshCw className="w-4 h-4" />
            আবার চেক করুন
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/categories'}
            className="flex items-center gap-2 h-10 px-4 text-sm"
          >
            ক্যাটেগরি দেখুন
          </Button>
        </div>
      </div>
    );
  }

  // Render successful state
  return children(products, isLoading, error);
}
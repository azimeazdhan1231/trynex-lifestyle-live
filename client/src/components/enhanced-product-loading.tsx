import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedProductLoadingProps {
  children: (products: any[], isLoading: boolean, error: any) => React.ReactNode;
}

export default function EnhancedProductLoading({ children }: EnhancedProductLoadingProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['/api/products', retryCount],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Retry up to 3 times with exponential backoff
      if (failureCount < 3) {
        console.log(`🔄 Retrying product fetch (attempt ${failureCount + 1})`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setLastSuccessTime(Date.now());
        console.log(`✅ Products loaded successfully: ${data.length} items`);
      }
    },
    onError: (error) => {
      console.error('❌ Product loading failed:', error);
    }
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Show loading state
  if (isLoading && !products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600 mb-2">পণ্য লোড হচ্ছে...</p>
        <p className="text-sm text-gray-500">অনুগ্রহ করে অপেক্ষা করুন</p>
      </div>
    );
  }

  // Show error state with retry option
  if (error && !products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          পণ্য লোড করতে সমস্যা হচ্ছে
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন
        </p>
        
        <Button
          onClick={handleRetry}
          disabled={isRefetching}
          className="flex items-center gap-2"
        >
          {isRefetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          আবার চেষ্টা করুন
        </Button>

        {lastSuccessTime && (
          <p className="text-xs text-gray-500 mt-4">
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

  // Show empty state if no products found
  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          কোনো পণ্য পাওয়া যায়নি
        </h3>
        <p className="text-gray-600 text-center mb-6">
          এই মুহূর্তে আমাদের কোনো পণ্য স্টকে নেই
        </p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          রিফ্রেশ করুন
        </Button>
      </div>
    );
  }

  // Render successful state
  return children(products, isLoading, error);
}
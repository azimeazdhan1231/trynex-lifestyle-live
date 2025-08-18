import { QueryClient } from '@tanstack/react-query';

// Create query client with authentication support
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401 errors
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (gcTime replaces cacheTime in v5)
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey, signal }) => {
        const url = Array.isArray(queryKey) ? (queryKey[0] as string) : (queryKey as string);

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add auth token for admin routes
        if (url.includes('/api/admin/')) {
          const token = localStorage.getItem('admin_token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const response = await fetch(url, {
          headers,
          signal,
        });

        if (!response.ok) {
          // Handle 401 errors by clearing auth and redirecting
          if (response.status === 401 && url.includes('/api/admin/')) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_data');
            window.location.reload();
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Enhanced API request utility function optimized for Cloudflare deployment
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  // Ensure URL starts with /api for consistent routing
  const normalizedUrl = url.startsWith('/api') ? url : `/api${url}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth token for admin routes
  if (normalizedUrl.includes('/api/admin/')) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${normalizedUrl}`);
      
      const response = await fetch(normalizedUrl, {
        ...options,
        headers,
      });

      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Handle 401 errors by clearing auth and redirecting
        if (response.status === 401 && normalizedUrl.includes('/api/admin/')) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
          window.location.reload();
          return;
        }

        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        // Retry for server errors
        if (response.status >= 500 && retryCount < maxRetries) {
          retryCount++;
          console.warn(`⚠️ Server error, retrying (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`✅ API Success: ${options.method || 'GET'} ${normalizedUrl}`);
      return result;

    } catch (error: any) {
      if (retryCount < maxRetries && (
        error.name === 'NetworkError' || 
        error.message.includes('fetch') ||
        error.message.includes('network')
      )) {
        retryCount++;
        console.warn(`🔄 Network error, retrying (${retryCount}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        continue;
      }
      
      console.error(`❌ API Error [${options.method || 'GET'} ${normalizedUrl}]:`, error);
      throw error;
    }
  }
};
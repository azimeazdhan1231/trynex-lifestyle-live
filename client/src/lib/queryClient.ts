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
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey, signal }) => {
        const url = Array.isArray(queryKey) ? queryKey[0] as string : queryKey as string;

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

// API request utility function
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token for admin routes
  if (url.includes('/api/admin/')) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
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
};
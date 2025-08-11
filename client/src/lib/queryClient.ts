import { QueryClient } from "@tanstack/react-query";

const isDevelopment = import.meta.env.MODE === 'development';
const API_BASE_URL = isDevelopment ? '' : '';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        const [path, params] = queryKey as [string, string?];
        let url = `${API_BASE_URL}${path}`;

        if (params) {
          url += `?${params}`;
        }

        try {
          const headers: Record<string, string> = {
            'Cache-Control': 'public, max-age=480', // 8 minute client cache (aligned with staleTime)
            'Accept': 'application/json',
          };

          // Add authorization header if user is authenticated
          const token = localStorage.getItem("auth_token");
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(url, {
            signal: signal, // Only use the provided signal, no custom timeout
            credentials: 'include', // Include credentials for auth endpoints
            headers
          });

          if (!response.ok) {
            // For auth endpoints, don't throw for 401s as they're expected when not logged in
            if (url.includes('/api/auth/user') && response.status === 401) {
              throw new Error('Not authenticated');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response.json();
        } catch (error) {
          // Handle AbortError gracefully
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.warn(`Request aborted for ${url}`);
          } else {
            console.warn(`Fetch failed for ${url}:`, error);
          }
          throw error;
        }
      },
      retry: 1, // Allow 1 retry for failed requests
      retryDelay: 500, // Faster retry
      staleTime: 1000 * 60 * 2, // 2 minutes - faster refresh
      gcTime: 1000 * 60 * 5, // 5 minutes - less memory usage
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      networkMode: 'online', // Only run when online
      // Show cached data immediately while fetching fresh data
      placeholderData: (previousData: any) => previousData,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
      networkMode: 'online',
    },
  },
});

export const apiRequest = async (
  method: string,
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<any> => {
  const { skipLoading = false, timeout = 30000 } = options;

  console.log(`API Request: ${method} ${url}`, data ? { body: data } : '');

  if (!skipLoading) {
    setIsLoading(true);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token - check both user and admin tokens
    const userToken = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('admin_token');

    // For admin endpoints, prefer admin token
    if (url.includes('/admin/') || url.includes('/api/products') || url.includes('/api/categories') || url.includes('/api/offers')) {
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }
    } else if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);

      if (response.status === 401) {
        // Handle unauthorized
        if (url.includes('/admin/') || url.includes('/api/products') || url.includes('/api/categories')) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
          // Show admin login required
          console.error('Admin authentication required');
        } else {
          localStorage.removeItem('authToken');
          // Don't redirect on admin endpoints
          if (!url.includes('/admin/')) {
            window.location.href = '/auth';
          }
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error('Request timeout');
      throw new Error('Request timeout');
    }

    console.error('Network error:', error);
    throw error;
  } finally {
    if (!skipLoading) {
      setIsLoading(false);
    }
  }
};
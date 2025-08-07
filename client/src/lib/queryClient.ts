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

        // Add timeout for ultra-fast performance
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout (much faster)

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
            signal: signal || controller.signal,
            credentials: 'include', // Include credentials for auth endpoints
            headers
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            // For auth endpoints, don't throw for 401s as they're expected when not logged in
            if (url.includes('/api/auth/user') && response.status === 401) {
              throw new Error('Not authenticated');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      retry: 0, // No retries for fastest loading
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

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  const adminToken = localStorage.getItem("admin_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Use admin token for admin endpoints, regular token for user endpoints
  if (url.includes('/admin/') && adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  } else if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  console.log(`API Request: ${method} ${url}`, body ? { body } : {});

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
}
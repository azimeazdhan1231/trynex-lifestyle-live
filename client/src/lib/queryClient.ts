import { QueryClient } from "@tanstack/react-query";

const isDevelopment = import.meta.env.MODE === 'development';
const API_BASE_URL = isDevelopment ? 'http://localhost:5173' : '';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        const [path, params] = queryKey as [string, string?];
        let url = `${API_BASE_URL}${path}`;

        if (params) {
          url += `?${params}`;
        }

        const response = await fetch(url, { 
          signal, 
          credentials: 'include' // Include credentials for auth endpoints
        });

        if (!response.ok) {
          // For auth endpoints, don't throw for 401s as they're expected when not logged in
          if (url.includes('/api/auth/user') && response.status === 401) {
            throw new Error('Not authenticated');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      },
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(method: string, path: string, body?: any): Promise<Response> {
  // Use current domain for production, empty string for development
  const baseUrl = import.meta.env.DEV ? "" : window.location.origin;
  const url = `${baseUrl}${path}`;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
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
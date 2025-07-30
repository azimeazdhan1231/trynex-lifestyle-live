
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
        
        const response = await fetch(url, { signal });
        
        if (!response.ok) {
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

export async function apiRequest(method: string, path: string, data?: any) {
  const url = `${API_BASE_URL}${path}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
}

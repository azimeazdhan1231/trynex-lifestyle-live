
import { QueryClient } from "@tanstack/react-query";

// Base URL for API requests
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : '';

// Enhanced API request function with better error handling and timeout
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  data?: any
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const url = `${API_BASE}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'same-origin',
      signal: controller.signal,
    };

    if (data && method !== "GET") {
      config.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to ${url}`);
    
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    // Log response for debugging
    console.log(`Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
          errorMessage = errorText;
        }
      } catch (e) {
        console.error('Failed to read error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Network error:", error);
    
    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('অনুরোধ সময়সীমা অতিক্রম করেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
    
    // For offline scenarios or network issues
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('নেটওয়ার্ক সংযোগ নেই। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ চেক করুন।');
    }
    
    throw error;
  }
}

// Simple Query Client with minimal defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      retry: false, // No retries
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false, // No retries
    },
  },
});



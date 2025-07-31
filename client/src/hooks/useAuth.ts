import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/user");
        return await response.json();
      } catch (error) {
        // Don't throw on auth errors, just return null
        console.log("Auth check failed:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: false, // Disable automatic fetching
  });

  return {
    user: error ? null : user,
    isLoading: false, // Always return false to prevent loading screens
    isAuthenticated: !!user && !error,
  };
}
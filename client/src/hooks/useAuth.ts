import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Silently handle auth errors - user just isn't logged in
  if (error) {
    console.debug('Auth check failed (expected if not logged in):', error);
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error
  };
}
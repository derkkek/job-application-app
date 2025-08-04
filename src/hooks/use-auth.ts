"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserProfile, signOut } from "@/utils/auth";
import { UserProfile } from "@/utils/auth";

// Query keys
export const authKeys = {
  user: ["auth", "user"] as const,
};

// Get current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const result = await getCurrentUserProfile();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });
} 
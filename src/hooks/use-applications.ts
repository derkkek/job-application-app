"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApplications, getApplicationById, createApplication, updateApplication } from "@/utils/applications";
import { JobApplication, CreateApplicationData, UpdateApplicationData } from "@/lib/models/application";

// Query keys
export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters: string) => [...applicationKeys.lists(), { filters }] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

// Get all applications
export function useApplications(userType?: "employer" | "applicant") {
  return useQuery({
    queryKey: applicationKeys.list(userType || "all"),
    queryFn: () => getApplications(userType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get application by ID
export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplicationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateApplicationData) => createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationData }) => 
      updateApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
} 
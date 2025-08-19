"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, getJobById, createJob, updateJob, deleteJob } from "@/utils/jobs";
import { Job, CreateJobData, UpdateJobData } from "@/lib/models/job";

// Query keys
export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters: string) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

// Get all jobs
export function useJobs(userType?: "employer" | "applicant") {
  return useQuery({
    queryKey: jobKeys.list(userType || "all"),
    queryFn: () => getJobs(userType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get job by ID
export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJobById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create job mutation
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateJobData) => {
      const response = await createJob(data);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create job');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

// Update job mutation
export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateJobData }) => {
      const response = await updateJob(id, data);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update job');
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
}

// Delete job mutation
export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteJob(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete job');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
} 
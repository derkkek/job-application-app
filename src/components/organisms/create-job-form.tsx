"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { createJobAction } from "@/actions/jobs";
import { Country } from "@/types/job";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-auth";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  location_country_id: z.number(),
  work_location: z.enum(["onsite", "remote", "hybrid"]),
  requirements: z.string().min(10, "Requirements must be at least 10 characters").max(2000, "Requirements must be less than 2000 characters"),
});

type FormData = z.infer<typeof schema>;

interface CreateJobFormProps {
  countries: Country[];
}

export function CreateJobForm({ countries }: CreateJobFormProps) {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser, error: userError } = useCurrentUser();

  // Handle loading state
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle authentication error
  if (userError || !user) {
    router.push('/login');
    return null;
  }

  // Prevent applicants from creating jobs
  if (user.user_type === 'applicant') {
    return (
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Applicants cannot create job postings. Please switch to an employer account if you wish to post jobs.
      </div>
    );
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    mutate: serverCreateJob,
    isPending: isLoadingCreateJob,
    error: createJobError,
  } = useMutation({
    mutationFn: async (data: FormData) => {
      // Server action will handle all the auth checks
      const response = await createJobAction(data, user.id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create job');
      }
      return response.data;
    },
    onSuccess: (job) => {
      router.push(`/employer/jobs/${job?.id}`);
    },
    onError: (error) => {
      console.error('Failed to create job:', error);
    },
  });

  const onSubmit = (data: FormData) => {
    serverCreateJob(data);
  };

  return (
    <>
      {createJobError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {createJobError.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Job Title *
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Senior React Developer"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="location_country_id" className="block text-sm font-medium mb-2">
            Location (Country) *
          </label>
          <select
            id="location_country_id"
            {...register("location_country_id", { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.location_country_id && (
            <p className="text-red-500 text-sm mt-1">{errors.location_country_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="work_location" className="block text-sm font-medium mb-2">
            Work Location *
          </label>
          <select
            id="work_location"
            {...register("work_location")}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select work location</option>
            <option value="onsite">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.work_location && (
            <p className="text-red-500 text-sm mt-1">{errors.work_location.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium mb-2">
            Requirements *
          </label>
          <textarea
            id="requirements"
            {...register("requirements")}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the job requirements, responsibilities, and qualifications..."
          />
          {errors.requirements && (
            <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoadingCreateJob}>
            {isLoadingCreateJob ? "Creating..." : "Create Job"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { getJobById, updateJob, getCountries } from "@/utils/jobs";
import { Country } from "@/types/job";
import { useRouter } from "next/navigation";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  location_country_id: z.number(),
  work_location: z.enum(["onsite", "remote", "hybrid"]),
  requirements: z.string().min(10, "Requirements must be at least 10 characters").max(2000, "Requirements must be less than 2000 characters"),
});

type FormData = z.infer<typeof schema>;

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    loadJob();
    loadCountries();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    const { data: job, error } = await getJobById(id);
    
    if (error) {
      setError(error.message || "Failed to load job");
    } else if (job) {
      reset({
        title: job.title,
        location_country_id: job.location_country_id,
        work_location: job.work_location,
        requirements: job.requirements,
      });
    } else {
      setError("Job not found");
    }
    
    setLoading(false);
  };

  const loadCountries = async () => {
    setLoadingCountries(true);
    const { data, error } = await getCountries();
    if (error) {
      setError("Failed to load countries");
    } else {
      setCountries(data || []);
    }
    setLoadingCountries(false);
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    setIsSubmitting(true);
    
    const { data: job, error } = await updateJob(id, {
      id: id,
      ...data,
    });
    
    if (error) {
      setError(error.message || "Failed to update job");
    } else {
      router.push(`/employer/jobs/${id}`);
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="text-gray-600">Update the job posting details below.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
            disabled={loadingCountries}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Job"}
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
    </div>
  );
} 
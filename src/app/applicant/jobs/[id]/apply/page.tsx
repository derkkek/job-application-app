"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { 
  getJobWithCountry, 
  getApplicationByJobIdWithExperiences, 
  createApplication, 
  updateApplication,
  createExperience,
  updateExperience,
  deleteExperience,
  deleteApplication
} from "@/utils/applications";
import { getCountries } from "@/utils/jobs";
import { debugApplicationCreation } from "@/utils/debug";
import { Country } from "@/types/job";
import { JobApplicationExperience } from "@/types/application";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Schema for experience form
const experienceSchema = z.object({
  position: z.string().min(1, "Position is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  still_working: z.boolean(),
  summary: z.string().max(500, "Summary must be less than 500 characters").optional(),
});

// Schema for the main application form
const schema = z.object({
  // Personal Information
  first_name: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  country_id: z.number(),
  phone_number: z.string().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  email: z.string().email("Please enter a valid email"),
  
  // Expectations
  salary_expectation: z.number().min(0, "Salary expectation must be positive"),
  additional_expectations: z.string().max(250, "Additional expectations must be less than 250 characters").optional(),
  
  // Experiences
  experiences: z.array(experienceSchema).min(1, "At least one experience is required"),
});

type FormData = z.infer<typeof schema>;

export default function JobApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<any>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      experiences: [{ position: "", start_date: "", end_date: "", still_working: false, summary: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    
    // Load job details
    const { data: jobData, error: jobError } = await getJobWithCountry(id);
    if (jobError) {
      setError(jobError.message || "Failed to load job");
      setLoading(false);
      return;
    }
    setJob(jobData);

    // Load countries
    const { data: countriesData } = await getCountries();
    if (countriesData) {
      setCountries(countriesData);
    }

    // Check if application already exists
    const { data: existingApp } = await getApplicationByJobIdWithExperiences(id);
    if (existingApp) {
      setExistingApplication(existingApp);
      // Pre-populate form with existing data
      reset({
        first_name: existingApp.first_name,
        last_name: existingApp.last_name,
        country_id: existingApp.country_id,
        phone_number: existingApp.phone_number,
        email: existingApp.email,
        salary_expectation: existingApp.salary_expectation,
        additional_expectations: existingApp.additional_expectations || "",
        experiences: existingApp.experiences?.length > 0 
          ? existingApp.experiences.map((exp: JobApplicationExperience) => ({
              position: exp.position,
              start_date: exp.start_date,
              end_date: exp.end_date || "",
              still_working: exp.still_working,
              summary: exp.summary || "",
            }))
          : [{ position: "", start_date: "", end_date: "", still_working: false, summary: "" }],
      });
    }
    
    setLoading(false);
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    setIsSubmitting(true);

    try {
      if (existingApplication) {
        // Update existing application
        const { experiences, ...applicationData } = data;
        const { error: appError } = await updateApplication({
          id: existingApplication.id,
          job_id: id,
          ...applicationData,
        });

        if (appError) {
          setError(appError.message || "Failed to update application");
          setIsSubmitting(false);
          return;
        }

        // Handle experiences
        for (let i = 0; i < data.experiences.length; i++) {
          const experience = data.experiences[i];
          const existingExp = existingApplication.experiences?.[i];

          if (existingExp) {
            // Update existing experience
            await updateExperience({
              id: existingExp.id,
              application_id: existingApplication.id,
              ...experience,
            });
          } else {
            // Create new experience
            await createExperience({
              application_id: existingApplication.id,
              ...experience,
            });
          }
        }

        // Delete experiences that are no longer in the form
        if (existingApplication.experiences) {
          for (const exp of existingApplication.experiences) {
            if (!data.experiences.find(e => e.position === exp.position && e.start_date === exp.start_date)) {
              await deleteExperience(exp.id);
            }
          }
        }
      } else {
        // Create new application with debug
        console.log('Submitting application data:', { job_id: id, ...data });
        const { data: newApp, error: appError } = await debugApplicationCreation(id, {
          job_id: id,
          ...data,
        });

        if (appError) {
          console.error('Application creation error:', appError);
          setError(typeof appError === 'string' ? appError : appError.message || "Failed to create application");
          setIsSubmitting(false);
          return;
        }

        // Create experiences
        for (const experience of data.experiences) {
          await createExperience({
            application_id: newApp!.id,
            ...experience,
          });
        }
      }

      router.push("/applicant/applications");
    } catch (error) {
      setError("An unexpected error occurred");
    }

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!existingApplication) return;

    if (!confirm("Are you sure you want to delete this application?")) return;

    setIsSubmitting(true);
    const { error } = await deleteApplication(existingApplication.id);
    
    if (error) {
      setError(error.message || "Failed to delete application");
    } else {
      router.push("/applicant/applications");
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Job not found
        </div>
        <Link href="/applicant/jobs">
          <Button className="mt-4">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Job Application</h1>
        <p className="text-gray-600">Apply for: {job.title}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country *</label>
              <select
                {...register("country_id", { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country_id && (
                <p className="text-red-500 text-sm mt-1">{errors.country_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                {...register("phone_number")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                {...register("email")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Experiences Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Experiences</h2>
          {fields.map((field, index) => {
            const stillWorking = watch(`experiences.${index}.still_working`);
            return (
              <div key={field.id} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Experience {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Position *</label>
                    <input
                      type="text"
                      {...register(`experiences.${index}.position`)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Senior Developer"
                    />
                    {errors.experiences?.[index]?.position && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index]?.position?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      {...register(`experiences.${index}.start_date`)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.experiences?.[index]?.start_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index]?.start_date?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      {...register(`experiences.${index}.end_date`)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={stillWorking}
                    />
                    {errors.experiences?.[index]?.end_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index]?.end_date?.message}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`experiences.${index}.still_working`)}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium">Still working here</label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Summary (Optional)</label>
                    <textarea
                      {...register(`experiences.${index}.summary`)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your role and responsibilities..."
                    />
                    {errors.experiences?.[index]?.summary && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index]?.summary?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ position: "", start_date: "", end_date: "", still_working: false, summary: "" })}
          >
            Add Experience
          </Button>
        </div>

        {/* Expectations Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Expectations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Salary Expectation *</label>
              <input
                type="number"
                {...register("salary_expectation", { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 75000"
              />
              {errors.salary_expectation && (
                <p className="text-red-500 text-sm mt-1">{errors.salary_expectation.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Additional Expectations (Optional)</label>
              <textarea
                {...register("additional_expectations")}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional expectations or requirements..."
                maxLength={250}
              />
              <p className="text-sm text-gray-500 mt-1">
                {watch("additional_expectations")?.length || 0}/250 characters
              </p>
              {errors.additional_expectations && (
                <p className="text-red-500 text-sm mt-1">{errors.additional_expectations.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : existingApplication ? "Update Application" : "Submit Application"}
          </Button>
          {existingApplication && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete Application
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 
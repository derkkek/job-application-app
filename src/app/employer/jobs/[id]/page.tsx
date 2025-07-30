"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { getJobById, deleteJob, getCountries } from "@/utils/jobs";
import { Job, Country } from "@/types/job";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadJob();
    loadCountries();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    const { data, error } = await getJobById(id);
    
    if (error) {
      setError(error.message || "Failed to load job");
    } else {
      setJob(data);
    }
    
    setLoading(false);
  };

  const loadCountries = async () => {
    const { data, error } = await getCountries();
    if (!error) {
      setCountries(data || []);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    const { error } = await deleteJob(id);
    if (error) {
      setError(error.message || "Failed to delete job");
    } else {
      router.push("/employer/jobs");
    }
  };

  const getCountryName = (countryId: number) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : `Country ID: ${countryId}`;
  };

  const getWorkLocationDisplay = (workLocation: string) => {
    switch (workLocation) {
      case 'onsite': return 'On-site';
      case 'remote': return 'Remote';
      case 'hybrid': return 'Hybrid';
      default: return workLocation;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !job) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Job not found"}
        </div>
        <Link href="/employer/jobs">
          <Button className="mt-4">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-gray-600 text-lg">{getCountryName(job.location_country_id)}</p>
            <p className="text-gray-500">
              {getWorkLocationDisplay(job.work_location)} • Created {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/employer/jobs/${id}/edit`}>
              <Button variant="outline">Update</Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Job Requirements</h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-700">{job.requirements}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/employer/jobs">
          <Button variant="outline">Back to My Jobs</Button>
        </Link>
      </div>
    </div>
  );
} 
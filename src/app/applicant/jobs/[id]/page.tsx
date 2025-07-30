"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { getJobWithCountry } from "@/utils/applications";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    const { data, error } = await getJobWithCountry(id);
    
    if (error) {
      setError(error.message || "Failed to load job");
    } else {
      setJob(data);
    }
    
    setLoading(false);
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
        <Link href="/applicant/jobs">
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
            <p className="text-gray-600 text-lg">{job.countries?.name || `Country ID: ${job.location_country_id}`}</p>
            <p className="text-gray-500">
              {getWorkLocationDisplay(job.work_location)} • Posted {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/applicant/jobs/${id}/apply`}>
              <Button>Apply Now</Button>
            </Link>
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
        <Link href="/applicant/jobs">
          <Button variant="outline">Back to Available Jobs</Button>
        </Link>
      </div>
    </div>
  );
} 
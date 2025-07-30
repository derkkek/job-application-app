"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAvailableJobs } from "@/utils/applications";
import Link from "next/link";

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const { data, error } = await getAvailableJobs();
    if (error) {
      setError(error.message || "Failed to load jobs");
    } else {
      setJobs(data || []);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Available Jobs</h1>
        <p className="text-gray-600">Browse and apply for job opportunities.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No job postings available at the moment.</p>
          <p className="text-gray-400">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.countries?.name || `Country ID: ${job.location_country_id}`}</p>
              <p className="text-sm text-gray-500 mb-2">
                {getWorkLocationDisplay(job.work_location)} • Posted {new Date(job.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {job.requirements}
              </p>
              <div className="flex gap-2">
                <Link href={`/applicant/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <Link href={`/applicant/jobs/${job.id}/apply`}>
                  <Button size="sm">Apply Now</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
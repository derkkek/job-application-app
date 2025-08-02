"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAvailableJobs } from "@/utils/applications";
import Link from "next/link";

export default function ApplicantJobsPage() {
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
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No job postings available at the moment.</p>
          <p className="text-gray-400">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border rounded-lg p-4 shadow-sm">
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
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getEmployerJobs, deleteJob, getCountries } from "@/utils/jobs";
import { Job, Country } from "@/types/job";
import Link from "next/link";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs();
    loadCountries();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const { data, error } = await getEmployerJobs();
    if (error) {
      setError(error.message || "Failed to load jobs");
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const loadCountries = async () => {
    const { data, error } = await getCountries();
    if (!error) {
      setCountries(data || []);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    const { error } = await deleteJob(id);
    if (error) {
      setError(error.message || "Failed to delete job");
    } else {
      setJobs(jobs.filter(job => job.id !== id));
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
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
          <Link href="/employer/jobs/create">
            <Button>Create Job</Button>
          </Link>
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
        <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
        <Link href="/employer/jobs/create">
          <Button>Create Job</Button>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No job postings yet.</p>
          <Link href="/employer/jobs/create">
            <Button>Create Your First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{getCountryName(job.location_country_id)}</p>
              <p className="text-sm text-gray-500 mb-2">
                {getWorkLocationDisplay(job.work_location)} • Created {new Date(job.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {job.requirements}
              </p>
              <div className="flex gap-2">
                <Link href={`/employer/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <Link href={`/employer/jobs/${job.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(job.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
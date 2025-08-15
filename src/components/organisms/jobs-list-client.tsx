"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteJob } from "@/hooks/use-jobs";
import { Job } from "@/types/job";
import { Trash2, Edit, Eye } from "lucide-react";
import { formatCurrency, getWorkLocationDisplay } from "@/lib/utils";

interface JobsListClientProps {
  jobs: Job[];
  userType?: "employer" | "applicant";
}

export function JobsListClient({ jobs, userType }: JobsListClientProps) {
  const {
    mutate: serverDeleteJob,
    isPending: isLoadingDeleteJob,
    error: deleteJobError,
  } = useDeleteJob();

  const handleDeleteJob = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      serverDeleteJob(id);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No jobs found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {job.title}
              </h3>
              {job.company && (
                <p className="text-gray-600 mb-2">{job.company}</p>
              )}
              {job.location && (
                <p className="text-sm text-gray-500 mb-3">{job.location}</p>
              )}
              {job.description && (
                <p className="text-gray-700 line-clamp-2 mb-4">{job.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                {job.salary_min && job.salary_max && (
                  <span className="text-sm text-gray-500">
                    Salary: {formatCurrency(job.salary_min)} - {formatCurrency(job.salary_max)}
                  </span>
                )}
                {job.job_type && (
                  <span className="text-sm text-gray-500">
                    Type: {job.job_type}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {getWorkLocationDisplay(job.work_location)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {userType === "employer" ? (
                <>
                  <Link href={`/employer/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/employer/jobs/${job.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={isLoadingDeleteJob}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isLoadingDeleteJob ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              ) : (
                <Link href={`/applicant/jobs/${job.id}`}>
                  <Button variant="default" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
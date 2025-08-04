import { Suspense } from "react";
import { JobsListServer } from "@/components/organisms/jobs-list-server";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

export default function ApplicantJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
      </div>
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <JobsListServer userType="applicant" />
      </Suspense>
    </div>
  );
} 
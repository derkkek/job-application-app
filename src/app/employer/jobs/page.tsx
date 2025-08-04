import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JobsListServer } from "@/components/organisms/jobs-list-server";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

export default function EmployerJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
        <Link href="/employer/jobs/create">
          <Button>Create Job</Button>
        </Link>
      </div>
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <JobsListServer userType="employer" />
      </Suspense>
    </div>
  );
} 
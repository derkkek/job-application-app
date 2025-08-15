import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JobsListServer } from "@/components/organisms/jobs-list-server";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { getCurrentUserProfile } from "@/utils/auth";

export default async function EmployerJobsPage() {
  // Get current user profile to determine employer ID
  const { data: userProfile, error: profileError } = await getCurrentUserProfile();
  
  if (profileError || !userProfile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load user profile
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
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <JobsListServer userType="employer" employerId={userProfile.id} />
      </Suspense>
    </div>
  );
} 
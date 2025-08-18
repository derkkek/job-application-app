import { Suspense } from "react";
import { getJobsAction } from "@/actions/jobs";
import { JobsListClient } from "@/components/organisms/jobs-list-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUserProfileServer } from "@/utils/auth-server";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { redirect } from "next/navigation";

export default async function EmployerJobsPage() {
  // Get current user profile server-side
  const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();

  // If user is not authenticated, redirect to login
  if (profileError || !userProfile) {
    redirect('/login');
  }

  // If user is not an employer, redirect to appropriate page
  if (userProfile.user_type !== 'employer') {
    redirect('/applicant/jobs');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Welcome, {userProfile.first_name || userProfile.email}</p>
          <Link href="/employer/jobs/create">
            <Button>Create Job</Button>
          </Link>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <JobsListServer userType="employer" employerId={userProfile.id} />
      </Suspense>
    </div>
  );
}

// Server component for jobs list
async function JobsListServer({ userType, employerId }: { userType: "employer" | "applicant", employerId?: string }) {
  const { data: jobs, error } = await getJobsAction(userType, employerId);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to load jobs. Please try again later.
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No jobs found.</p>
      </div>
    );
  }

  // Convert jobs to client component format
  const typedJobs = jobs.map(job => ({
    ...job,
    work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
  }));

  return <JobsListClient jobs={typedJobs} userType={userType} />;
}
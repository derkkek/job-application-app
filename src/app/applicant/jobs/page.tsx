import { Suspense } from "react";
import { getJobsAction } from "@/actions/jobs";
import { JobsListClient } from "@/components/organisms/jobs-list-client";
import { getCurrentUserProfileServer } from "@/utils/auth-server";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { redirect } from "next/navigation";

export default async function ApplicantJobsPage() {
  // Get current user profile server-side
  const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();

  // If user is not authenticated, redirect to login
  if (profileError || !userProfile) {
    redirect('/login');
  }

  // If user is not an applicant, redirect to appropriate page
  if (userProfile.user_type !== 'applicant') {
    redirect('/employer/jobs');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
        <p className="text-sm text-gray-500">Welcome, {userProfile.first_name || userProfile.email}</p>
      </div>
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <JobsListServer userType="applicant" />
      </Suspense>
    </div>
  );
}

// Server component for jobs list
async function JobsListServer({ userType }: { userType: "employer" | "applicant" }) {
  const { data: jobs, error } = await getJobsAction(userType);

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
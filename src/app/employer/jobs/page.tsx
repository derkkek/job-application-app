"use client";

import { JobsListClient } from "@/components/organisms/jobs-list-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

export default function EmployerJobsPage() {
  const router = useRouter();
  const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useCurrentUser();

  // Handle loading state
  if (isLoadingProfile) {
    return <LoadingSpinner size="lg" className="py-8" />;
  }

  // If user is not authenticated, redirect to login
  if (profileError || !userProfile) {
    router.push('/login');
    return null;
  }

  // If user is not an employer, redirect to appropriate page
  if (userProfile.user_type !== 'employer') {
    router.push('/applicant/jobs');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
        <p className="text-sm text-gray-500">Welcome, {userProfile.first_name || userProfile.email}</p>
        <Link href="/employer/jobs/create">
          <Button>Create Job</Button>
        </Link>
      </div>
      
      <JobsListClient userType="employer" />
    </div>
  );
}
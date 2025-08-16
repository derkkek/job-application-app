// src/app/employer/jobs/page.tsx (Debug Version)
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JobsListServer } from "@/components/organisms/jobs-list-server";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { getCurrentUserProfileServer } from "@/utils/auth-server";
import { redirect } from "next/navigation";

export default async function EmployerJobsPage() {
  console.log('🔍 EmployerJobsPage: Starting authentication check...');
  
  // Get current user profile using server-side function
  const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();
  
  console.log('🔍 EmployerJobsPage: User profile result:', {
    userProfile: userProfile ? { id: userProfile.id, user_type: userProfile.user_type } : null,
    error: profileError
  });

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
        <p className="text-sm text-gray-500">Welcome, {userProfile.first_name || userProfile.email}</p>
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
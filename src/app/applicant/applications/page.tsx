import { Suspense } from "react";
import { getApplicationsAction } from "@/actions/applications";
import { ApplicationsListClient } from "@/components/organisms/applications-list-client";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { getCurrentUserProfile } from "@/utils/auth";

export default async function ApplicantApplicationsPage() {
  // Get current user profile to determine user ID
  const { data: userProfile, error: profileError } = await getCurrentUserProfile();
  
  if (profileError || !userProfile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Applied Jobs</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Applied Jobs</h1>
      </div>
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <ApplicationsListClient 
          userType="applicant" 
          userId={userProfile.id}
        />
      </Suspense>
    </div>
  );
} 
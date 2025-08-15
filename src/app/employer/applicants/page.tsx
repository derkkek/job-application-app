import { Suspense } from "react";
import { getCurrentUserProfile } from "@/utils/auth";
import { ApplicationsListClient } from "@/components/organisms/applications-list-client";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

export default async function EmployerApplicantsPage() {
  // Get current user profile to determine employer ID
  const { data: userProfile, error: profileError } = await getCurrentUserProfile();
  
  if (profileError || !userProfile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
      </div>
      
      <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
        <ApplicationsListClient 
          userType="employer" 
          userId={userProfile.id}
        />
      </Suspense>
    </div>
  );
} 
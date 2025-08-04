"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser, useSignOut } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { ErrorMessage } from "@/components/atoms/error-message";

export default function ApplicantSettingsPage() {
  const { data: userProfile, error, isLoading } = useCurrentUser();
  const signOutMutation = useSignOut();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="text-center py-8">
        <ErrorMessage message="Failed to load user profile" />
      </div>
    );
  }

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{userProfile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">
              {userProfile.first_name && userProfile.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : userProfile.first_name || userProfile.last_name || 'Not provided'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <p className="text-gray-900 capitalize">{userProfile.user_type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="text-gray-900">
              {userProfile.created_at 
                ? new Date(userProfile.created_at).toLocaleDateString()
                : 'Unknown'
              }
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={signOutMutation.isPending}
          >
            {signOutMutation.isPending ? 'Signing out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
} 
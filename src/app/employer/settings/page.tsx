import { getCurrentUserProfile } from "@/utils/auth";
import { SettingsClient } from "@/components/organisms/settings-client";
import { redirect } from "next/navigation";
import { getCurrentUserProfileServer } from "@/utils/auth-server";

export default async function EmployerSettingsPage() {
  // Get current user profile server-side
  const { data: userProfile, error } = await getCurrentUserProfileServer();
  
  if (error || !userProfile) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <SettingsClient userProfile={userProfile} />
    </div>
  );
} 
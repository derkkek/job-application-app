"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { getCurrentUserProfile } from "@/utils/auth";
import { UserProfile } from "@/utils/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await getCurrentUserProfile();
        
        if (error || !data) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null; // Will redirect to login
  }

  const userName = userProfile.first_name && userProfile.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile.first_name || userProfile.last_name || undefined;

  return (
    <div className="flex h-screen">
      <Sidebar
        userType={userProfile.user_type}
        userName={userName}
        userEmail={userProfile.email}
      />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 
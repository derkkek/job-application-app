"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { ErrorMessage } from "@/components/atoms/error-message";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: userProfile, error, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (error && !isLoading) {
      router.push('/login');
    }
  }, [error, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <ErrorMessage message="Authentication failed. Redirecting to login..." />
        </div>
      </div>
    );
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
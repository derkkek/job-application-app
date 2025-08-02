"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: profile, error } = await getCurrentUserProfile();
        
        if (error || !profile) {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }

        // Redirect based on user type
        if (profile.user_type === 'employer') {
          router.push('/employer/jobs');
        } else if (profile.user_type === 'applicant') {
          router.push('/applicant/jobs');
        } else {
          // Unknown user type, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

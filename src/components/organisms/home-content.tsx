"use client";

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { signOut } from '@/utils/auth';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: 'employer' | 'applicant';
  created_at: string;
  updated_at: string;
}

interface HomeContentProps {
  userProfile: UserProfile;
}

export default function HomeContent({ userProfile }: HomeContentProps) {
  const router = useRouter();

  const {
    mutate: serverSignOut,
    isPending: isLoadingSignOut,
  } = useMutation({
    mutationFn: async () => {
      const response = await signOut();
      if (response.error) {
        throw new Error(response.error.message || 'Sign out failed');
      }
      return response;
    },
    onSuccess: () => {
      router.push('/login');
      router.refresh();
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {userProfile.first_name || userProfile.email}!
          </h1>
          <p className="text-gray-600 capitalize">
            {userProfile.user_type} Dashboard
          </p>
        </div>
        
        <button
          onClick={() => serverSignOut()}
          disabled={isLoadingSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoadingSignOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {userProfile.user_type === 'employer' ? (
          <>
            <div className="p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Job Management</h2>
              <p className="text-gray-600 mb-4">Create and manage your job postings</p>
              <button
                onClick={() => handleNavigation('/employer/jobs')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Manage Jobs
              </button>
            </div>
            
            <div className="p-6 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Applications</h2>
              <p className="text-gray-600 mb-4">Review applications from candidates</p>
              <button
                onClick={() => handleNavigation('/employer/applications')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                View Applications
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 bg-purple-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Browse Jobs</h2>
              <p className="text-gray-600 mb-4">Find and apply to job opportunities</p>
              <button
                onClick={() => handleNavigation('/applicant/jobs')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Browse Jobs
              </button>
            </div>
            
            <div className="p-6 bg-orange-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">My Applications</h2>
              <p className="text-gray-600 mb-4">Track your job applications</p>
              <button
                onClick={() => handleNavigation('/applicant/applications')}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                View Applications
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
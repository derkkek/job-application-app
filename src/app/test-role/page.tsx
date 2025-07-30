"use client";
import { useEffect, useState } from "react";
import { getCurrentUserProfile, isApplicant, isEmployer } from "@/utils/auth";

export default function TestRolePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isApplicantUser, setIsApplicantUser] = useState<boolean | null>(null);
  const [isEmployerUser, setIsEmployerUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    setLoading(true);
    
    // Get user profile
    const { data: profileData, error: profileError } = await getCurrentUserProfile();
    console.log('Profile:', profileData, 'Error:', profileError);
    setProfile(profileData);

    // Check roles
    const applicantCheck = await isApplicant();
    const employerCheck = await isEmployer();
    
    console.log('Is Applicant:', applicantCheck);
    console.log('Is Employer:', employerCheck);
    
    setIsApplicantUser(applicantCheck);
    setIsEmployerUser(employerCheck);
    
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Role Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Role Checks</h2>
          <p>Is Applicant: {isApplicantUser ? 'Yes' : 'No'}</p>
          <p>Is Employer: {isEmployerUser ? 'Yes' : 'No'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Recommendations</h2>
          {!profile && (
            <p className="text-red-600">No profile found. You may need to register again.</p>
          )}
          {profile && profile.user_type !== 'applicant' && (
            <p className="text-red-600">
              Your user type is "{profile.user_type}". You need to be an "applicant" to apply for jobs.
            </p>
          )}
          {profile && profile.user_type === 'applicant' && (
            <p className="text-green-600">You are correctly registered as an applicant!</p>
          )}
        </div>
      </div>
    </div>
  );
} 
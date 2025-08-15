import { getCurrentUserProfile } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  try {
    const { data: profile, error } = await getCurrentUserProfile();
    
    if (error || !profile) {
      // Not authenticated, redirect to login
      redirect('/login');
    }

    // Redirect based on user type
    if (profile.user_type === 'employer') {
      redirect('/employer/jobs');
    } else if (profile.user_type === 'applicant') {
      redirect('/applicant/jobs');
    } else {
      // Unknown user type, redirect to login
      redirect('/login');
    }
  } catch (error) {
    console.error('Error checking user:', error);
    redirect('/login');
  }

  // This should never be reached due to redirects
  return null;
}

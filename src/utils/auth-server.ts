import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/utils/database';
import type { UserProfile } from '@/lib/models/user';

export async function getCurrentUserProfileServer(): Promise<{ data: UserProfile | null; error: any }> {
  
  try {
    const supabase = await createClient();
    
    // Get current user from Supabase auth (server-side)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔍 getCurrentUserProfileServer: Auth user result:', {
      user: user ? { id: user.id, email: user.email } : null,
      error: userError
    });
    
    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get user profile from Prisma
    console.log('🔍 getCurrentUserProfileServer: Fetching profile from database...');
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id }
    });
    
    if (!profile) {
      return { data: null, error: { message: 'User profile not found' } };
    }

    // Transform the data to match UserProfile interface
    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      user_type: profile.user_type as 'employer' | 'applicant',
      created_at: profile.created_at.toISOString(),
      updated_at: profile.updated_at.toISOString()
    };

    console.log('🔍 getCurrentUserProfileServer: Database result:', {
      data: { id: userProfile.id, user_type: userProfile.user_type },
      error: null
    });
    
    return { data: userProfile, error: null };
  } catch (error) {
    console.error('❌ getCurrentUserProfileServer: Unexpected error:', error);
    return { data: null, error: 'Server error' };
  }
}

export async function isEmployerServer(): Promise<boolean> {
  const { data: profile } = await getCurrentUserProfileServer();
  const isEmployer = profile?.user_type === 'employer';
  console.log('🔍 isEmployerServer:', isEmployer);
  return isEmployer;
}

export async function isApplicantServer(): Promise<boolean> {
  const { data: profile } = await getCurrentUserProfileServer();
  const isApplicant = profile?.user_type === 'applicant';
  console.log('🔍 isApplicantServer:', isApplicant);
  return isApplicant;
}
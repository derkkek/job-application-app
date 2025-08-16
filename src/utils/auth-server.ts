import { createClient } from '@/utils/supabase/server';
import { UserModel } from '@/models/user';
import type { UserProfile } from '@/types/user';

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
    const result = await UserModel.getById(user.id);
    console.log('🔍 getCurrentUserProfileServer: Database result:', {
      data: result.data ? { id: result.data.id, user_type: result.data.user_type } : null,
      error: result.error
    });
    
    return result;
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
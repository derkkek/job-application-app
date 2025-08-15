import { createClient } from '@/utils/supabase/client';
import { UserModel } from '@/models/user';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: 'employer' | 'applicant';
  created_at: string;
  updated_at: string;
}

export async function getCurrentUserProfile(): Promise<{ data: UserProfile | null; error: any }> {
  const supabase = createClient();
  
  // Get current user from Supabase auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  // Get user profile from Prisma
  const result = await UserModel.getById(user.id);
  return result;
}

export async function isEmployer(): Promise<boolean> {
  const { data: profile } = await getCurrentUserProfile();
  return profile?.user_type === 'employer';
}

export async function isApplicant(): Promise<boolean> {
  const { data: profile } = await getCurrentUserProfile();
  return profile?.user_type === 'applicant';
}

export async function signOut(): Promise<{ error: any }> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();
  return { error };
} 
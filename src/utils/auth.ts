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

// Client-side version
export async function getCurrentUserProfile(): Promise<{ data: UserProfile | null; error: any }> {
  const supabase = createClient();
  
  // Get current user from Supabase auth (client-side)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  // For client-side, we'll fetch from API route instead of direct Prisma
  try {
    const response = await fetch('/api/auth/profile');
    const result = await response.json();
    return result;
  } catch (error) {
    return { data: null, error: 'Failed to fetch profile' };
  }
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
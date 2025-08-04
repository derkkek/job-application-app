import { createClient } from '@/utils/supabase/server';
import { Job } from '@/types/job';

// Server-side function to get jobs (for server components only)
export async function getJobsServer(userType?: "employer" | "applicant"): Promise<{ data: Job[] | null; error: any }> {
  const supabase = await createClient();
  
  if (userType === "employer") {
    // Get employer's own jobs - we'll need to get the user from the server context
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get user profile to check if they're an employer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || profile.user_type !== 'employer') {
      return { data: null, error: 'Only employers can view their job postings' };
    }

    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } else {
    // Get all published jobs for applicants
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    return { data, error };
  }
} 
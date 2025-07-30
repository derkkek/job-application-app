import { createClient } from '@/utils/supabase/client';
import { getCurrentUserProfile } from '@/utils/auth';

export async function debugApplicationCreation(jobId: string, applicationData: any) {
  const supabase = createClient();
  
  console.log('=== DEBUG: Application Creation ===');
  
  // 1. Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('User authenticated:', !!user, 'Error:', userError);
  
  if (!user) {
    return { error: 'User not authenticated' };
  }
  
  // 2. Check user profile
  const { data: profile, error: profileError } = await getCurrentUserProfile();
  console.log('User profile:', profile, 'Error:', profileError);
  
  // 3. Check if job exists and is published
  const { data: job, error: jobError } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .eq('is_published', true)
    .single();
  
  console.log('Job exists and published:', !!job, 'Error:', jobError);
  
  // 4. Check if application already exists for this user and job
  const { data: existingApp, error: existingError } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .single();
  
  console.log('Existing application:', !!existingApp, 'Error:', existingError);
  
  // 5. Try to create application
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      ...applicationData,
      applicant_id: user.id,
    })
    .select()
    .single();
  
  console.log('Application creation result:', data, 'Error:', error);
  
  return { data, error };
}

// Get a real job ID for testing
export async function getRealJobId(): Promise<string | null> {
  const supabase = createClient();
  
  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select('id, title')
    .eq('is_published', true)
    .limit(1);
  
  if (error || !jobs || jobs.length === 0) {
    console.log('No published jobs found');
    return null;
  }
  
  console.log('Found job:', jobs[0]);
  return jobs[0].id;
} 
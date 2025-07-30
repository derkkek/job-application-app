import { createClient } from '@/utils/supabase/client';
import { Job, CreateJobData, UpdateJobData, Country } from '@/types/job';
import { isEmployer } from '@/utils/auth';

export async function createJob(jobData: CreateJobData): Promise<{ data: Job | null; error: any }> {
  const supabase = createClient();
  
  // Check if user is an employer
  const userIsEmployer = await isEmployer();
  if (!userIsEmployer) {
    return { data: null, error: 'Only employers can create job postings' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      ...jobData,
      employer_id: user.id,
    })
    .select()
    .single();

  return { data, error };
}

export async function getEmployerJobs(): Promise<{ data: Job[] | null; error: any }> {
  const supabase = createClient();
  
  // Check if user is an employer
  const userIsEmployer = await isEmployer();
  if (!userIsEmployer) {
    return { data: null, error: 'Only employers can view their job postings' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getJobById(id: string): Promise<{ data: Job | null; error: any }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function updateJob(jobData: UpdateJobData): Promise<{ data: Job | null; error: any }> {
  const supabase = createClient();
  
  // Check if user is an employer
  const userIsEmployer = await isEmployer();
  if (!userIsEmployer) {
    return { data: null, error: 'Only employers can update job postings' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('job_postings')
    .update({
      title: jobData.title,
      location_country_id: jobData.location_country_id,
      work_location: jobData.work_location,
      requirements: jobData.requirements,
    })
    .eq('id', jobData.id)
    .eq('employer_id', user.id) // Ensure user owns the job
    .select()
    .single();

  return { data, error };
}

export async function deleteJob(id: string): Promise<{ error: any }> {
  const supabase = createClient();
  
  // Check if user is an employer
  const userIsEmployer = await isEmployer();
  if (!userIsEmployer) {
    return { error: 'Only employers can delete job postings' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', id)
    .eq('employer_id', user.id); // Ensure user owns the job

  return { error };
}

export async function getCountries(): Promise<{ data: Country[] | null; error: any }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name');

  return { data, error };
} 
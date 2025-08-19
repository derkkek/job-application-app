import { createClient } from '@/utils/supabase/client';
import { 
  JobApplication, 
  CreateApplicationData, 
  UpdateApplicationData,
  JobApplicationExperience,
  CreateExperienceData,
  UpdateExperienceData,
  ApplicationWithExperiences
} from '@/lib/models/application';
import { isApplicant, isEmployer } from '@/utils/auth';

// Clear any cached queries and create a fresh client
function getFreshClient() {
  return createClient();
}

// Unified function to get applications based on user type
export async function getApplications(userType?: "employer" | "applicant"): Promise<{ data: ApplicationWithExperiences[] | null; error: any }> {
  if (userType === "employer") {
    return getEmployerApplicants();
  } else {
    return getApplicantApplications();
  }
}

// Get a specific application by ID
export async function getApplicationById(id: string): Promise<{ data: ApplicationWithExperiences | null; error: any }> {
  const supabase = getFreshClient();
  
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_postings!job_applications_job_id_fkey(
        id,
        title,
        countries!job_postings_location_country_id_fkey(name)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  // Get experiences for this application
  const { data: experiences, error: expError } = await getApplicationExperiences(data.id);
  
  if (expError) {
    console.error('Error fetching experiences:', expError);
  }

  // Combine application with experiences
  const applicationWithExperiences: ApplicationWithExperiences = {
    ...data,
    experiences: experiences || [],
  };

  return { data: applicationWithExperiences, error: null };
}

// Get all available jobs (published jobs)
export async function getAvailableJobs(): Promise<{ data: any[] | null; error: any }> {
  const supabase = getFreshClient();
  
  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      countries!job_postings_location_country_id_fkey(name)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return { data, error };
}

// Get a specific job by ID
export async function getJobWithCountry(id: string): Promise<{ data: any | null; error: any }> {
  const supabase = getFreshClient();
  
  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      countries!job_postings_location_country_id_fkey(name)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();

  return { data, error };
}

// Create a job application
export async function createApplication(applicationData: CreateApplicationData): Promise<{ data: JobApplication | null; error: any }> {
  const supabase = getFreshClient();
  
  // Check if user is an applicant
  const userIsApplicant = await isApplicant();
  if (!userIsApplicant) {
    return { data: null, error: 'Only applicants can create job applications' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  // Check for existing application
  const { data: existingApp, error: existingError } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', applicationData.job_id)
    .eq('applicant_id', user.id)
    .single();

  if (existingApp) {
    // Option 1: Return an error (prevent duplicate)
    // return { data: null, error: 'You have already applied for this job.' };
    // Option 2: Update the existing application instead
    const { data, error } = await supabase
      .from('job_applications')
      .update({
        ...applicationData,
        applicant_id: user.id,
      })
      .eq('id', existingApp.id)
      .select()
      .single();
    return { data, error };
  }

  // Insert new application
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: applicationData.job_id,
      applicant_id: user.id,
      first_name: applicationData.first_name,
      last_name: applicationData.last_name,
      country_id: applicationData.country_id,
      phone_number: applicationData.phone_number,
      email: applicationData.email,
      experiences: applicationData.experiences || [], // Make sure it's an array
      salary_expectation: applicationData.salary_expectation,
      additional_expectations: applicationData.additional_expectations
    })
    .select()
    .single();

  return { data, error };
}

// Get applicant's applications
export async function getApplicantApplications(): Promise<{ data: ApplicationWithExperiences[] | null; error: any }> {
  const supabase = getFreshClient();
  
  // Check if user is an applicant
  const userIsApplicant = await isApplicant();
  if (!userIsApplicant) {
    return { data: null, error: 'Only applicants can view their applications' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_postings!job_applications_job_id_fkey(
        id,
        title,
        countries!job_postings_location_country_id_fkey(name)
      )
    `)
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
}

// Get experiences for an application
export async function getApplicationExperiences(applicationId: string): Promise<{ data: JobApplicationExperience[] | null; error: any }> {
  const supabase = getFreshClient();
  
  const { data, error } = await supabase
    .from('job_application_experiences')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  return { data, error };
}

// Get application by job ID for current applicant (with experiences)
export async function getApplicationByJobIdWithExperiences(jobId: string): Promise<{ data: ApplicationWithExperiences | null; error: any }> {
  const supabase = getFreshClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  // Get application
  const { data: application, error: appError } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_postings!job_applications_job_id_fkey(
        id,
        title,
        countries!job_postings_location_country_id_fkey(name)
      )
    `)
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .single();

  if (appError || !application) {
    return { data: null, error: appError };
  }

  // Get experiences for this application
  const { data: experiences, error: expError } = await getApplicationExperiences(application.id);
  
  if (expError) {
    console.error('Error fetching experiences:', expError);
  }

  // Combine application with experiences
  const applicationWithExperiences: ApplicationWithExperiences = {
    ...application,
    experiences: experiences || [],
  };

  return { data: applicationWithExperiences, error: null };
}

// Update a job application
export async function updateApplication(id: string, applicationData: UpdateApplicationData): Promise<{ data: JobApplication | null; error: any }> {
  const supabase = getFreshClient();
  
  // Check if user is an applicant
  const userIsApplicant = await isApplicant();
  if (!userIsApplicant) {
    return { data: null, error: 'Only applicants can update job applications' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update({
      first_name: applicationData.first_name,
      last_name: applicationData.last_name,
      country_id: applicationData.country_id,
      phone_number: applicationData.phone_number,
      email: applicationData.email,
      salary_expectation: applicationData.salary_expectation,
      additional_expectations: applicationData.additional_expectations,
    })
    .eq('id', id)
    .eq('applicant_id', user.id) // Ensure user owns the application
    .select()
    .single();

  return { data, error };
}

// Delete a job application
export async function deleteApplication(id: string): Promise<{ error: any }> {
  const supabase = getFreshClient();
  
  // Check if user is an applicant
  const userIsApplicant = await isApplicant();
  if (!userIsApplicant) {
    return { error: 'Only applicants can delete job applications' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)
    .eq('applicant_id', user.id); // Ensure user owns the application

  return { error };
}

// Create an experience
export async function createExperience(experienceData: CreateExperienceData): Promise<{ data: JobApplicationExperience | null; error: any }> {
  const supabase = getFreshClient();
  
  const { data, error } = await supabase
    .from('job_application_experiences')
    .insert(experienceData)
    .select()
    .single();

  return { data, error };
}

// Update an experience
export async function updateExperience(experienceData: UpdateExperienceData): Promise<{ data: JobApplicationExperience | null; error: any }> {
  const supabase = getFreshClient();
  
  const { data, error } = await supabase
    .from('job_application_experiences')
    .update({
      position: experienceData.position,
      start_date: experienceData.start_date,
      end_date: experienceData.end_date,
      still_working: experienceData.still_working,
      summary: experienceData.summary,
    })
    .eq('id', experienceData.id)
    .select()
    .single();

  return { data, error };
}

// Delete an experience
export async function deleteExperience(id: string): Promise<{ error: any }> {
  const supabase = getFreshClient();
  
  const { error } = await supabase
    .from('job_application_experiences')
    .delete()
    .eq('id', id);

  return { error };
} 

// Get applicants for employer's job postings
export async function getEmployerApplicants(): Promise<{ data: any[] | null; error: any }> {
  const supabase = getFreshClient();
  
  // Check if user is an employer
  const userIsEmployer = await isEmployer();
  if (!userIsEmployer) {
    return { data: null, error: 'Only employers can view applicants' };
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_postings!job_applications_job_id_fkey(
        id,
        title,
        employer_id,
        countries!job_postings_location_country_id_fkey(name)
      )
    `)
    .eq('job_postings.employer_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
} 
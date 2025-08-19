'use server'

import { ApplicationModel } from '@/lib/actions/application'
import { revalidatePath } from 'next/cache'
import { getCurrentUserProfileServer } from '@/utils/auth-server' // Use server-side auth
import { ServerResponse, createServerAction } from '@/lib/models/server'
import type { 
  CreateApplicationData, 
  UpdateApplicationData,
  CreateExperienceData,
  UpdateExperienceData,
  ApplicationWithExperiences
} from '@/lib/models/application'

export async function getApplicationsAction(
  userType?: "employer" | "applicant", 
  userId?: string
): Promise<ServerResponse<ApplicationWithExperiences[]>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (userType && !['employer', 'applicant'].includes(userType)) {
      throw new Error('Invalid user type');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.getAll(userType, userId);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to fetch applications');
    }
    
    // Transform data to match ApplicationWithExperiences interface
    const transformedData = (result.data || []).map((app: any) => ({
      ...app,
      created_at: app.created_at instanceof Date ? app.created_at.toISOString() : app.created_at,
      updated_at: app.updated_at instanceof Date ? app.updated_at.toISOString() : app.updated_at,
      experiences: (app.job_application_experiences || []).map((exp: any) => ({
        ...exp,
        end_date: exp.end_date ?? undefined,
        summary: exp.summary ?? undefined,
        created_at: exp.created_at instanceof Date ? exp.created_at.toISOString() : exp.created_at
      })),
      additional_expectations: app.additional_expectations ?? undefined
    }));
    
    return transformedData;
  });
}

export async function getApplicationByIdAction(
  id: string
): Promise<ServerResponse<ApplicationWithExperiences>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Application ID is required');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.getById(id);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to fetch application');
    }
    
    if (!result.data) {
      throw new Error('Application not found');
    }
    
    // Transform data to match ApplicationWithExperiences interface
    const transformedData = {
      ...result.data,
      created_at: (result.data as any).created_at instanceof Date ? (result.data as any).created_at.toISOString() : (result.data as any).created_at,
      updated_at: (result.data as any).updated_at instanceof Date ? (result.data as any).updated_at.toISOString() : (result.data as any).updated_at,
      experiences: ((result.data as any).job_application_experiences || []).map((exp: any) => ({
        ...exp,
        end_date: exp.end_date ?? undefined,
        summary: exp.summary ?? undefined,
        created_at: exp.created_at instanceof Date ? exp.created_at.toISOString() : exp.created_at
      })),
      additional_expectations: (result.data as any).additional_expectations ?? undefined
    };
    
    return transformedData;
  });
}

export async function getApplicationByJobAndApplicantAction(
  jobId: string, 
  applicantId: string
): Promise<ServerResponse<ApplicationWithExperiences | null>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!jobId || typeof jobId !== 'string') {
      throw new Error('Job ID is required');
    }
    if (!applicantId || typeof applicantId !== 'string') {
      throw new Error('Applicant ID is required');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.getByJobAndApplicant(jobId, applicantId);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to fetch application');
    }
    
    // Transform data to match ApplicationWithExperiences interface
    if (!result.data) {
      return null;
    }
    
    const transformedData = {
      ...result.data,
      created_at: (result.data as any).created_at instanceof Date ? (result.data as any).created_at.toISOString() : (result.data as any).created_at,
      updated_at: (result.data as any).updated_at instanceof Date ? (result.data as any).updated_at.toISOString() : (result.data as any).updated_at,
      experiences: ((result.data as any).job_application_experiences || []).map((exp: any) => ({
        ...exp,
        end_date: exp.end_date ?? undefined,
        summary: exp.summary ?? undefined,
        created_at: exp.created_at instanceof Date ? exp.created_at.toISOString() : exp.created_at
      })),
      additional_expectations: (result.data as any).additional_expectations ?? undefined
    };
    
    return transformedData;
  });
}

export async function createApplicationAction(
  data: CreateApplicationData, 
  applicantId: string
): Promise<ServerResponse<any>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!data || !applicantId) {
      throw new Error('Application data and applicant ID are required');
    }
    
    if (!data.job_id || !data.first_name || !data.last_name || !data.email) {
      throw new Error('Required application fields are missing');
    }
    
    // Use server-side authentication
    const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();
    
    if (profileError || !userProfile) {
      throw new Error('User not authenticated');
    }

    // Check if user is an applicant
    if (userProfile.user_type !== 'applicant') {
      throw new Error('Unauthorized: Only applicants can apply for jobs');
    }

    // Verify the applicantId matches the authenticated user
    if (userProfile.id !== applicantId) {
      throw new Error('Unauthorized: Invalid applicant ID');
    }

    // 2. Business logic
    const result = await ApplicationModel.create(data, applicantId);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to create application');
    }

    // 3. Revalidate paths for fresh data
    if (result.data) {
      revalidatePath('/applicant/applications');
      revalidatePath(`/applicant/jobs/${data.job_id}`);
    }
    
    return result.data;
  });
}

export async function updateApplicationAction(
  id: string, 
  data: UpdateApplicationData
): Promise<ServerResponse<any>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Application ID is required');
    }
    
    if (!data) {
      throw new Error('Application data is required');
    }

    // Add authentication check for update as well
    const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();
    
    if (profileError || !userProfile) {
      throw new Error('User not authenticated');
    }

    if (userProfile.user_type !== 'applicant') {
      throw new Error('Unauthorized: Only applicants can update applications');
    }

    // 2. Business logic
    const result = await ApplicationModel.update(id, data);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to update application');
    }
    
    // 3. Revalidate paths for fresh data
    if (result.data) {
      revalidatePath('/applicant/applications');
      revalidatePath(`/applicant/jobs/${data.id}`);
    }
    
    return result.data;
  });
}

export async function deleteApplicationAction(
  id: string
): Promise<ServerResponse<void>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Application ID is required');
    }

    // Add authentication check for delete as well
    const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();
    
    if (profileError || !userProfile) {
      throw new Error('User not authenticated');
    }

    if (userProfile.user_type !== 'applicant') {
      throw new Error('Unauthorized: Only applicants can delete applications');
    }

    // 2. Business logic
    const result = await ApplicationModel.delete(id);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to delete application');
    }
    
    // 3. Revalidate paths for fresh data
    revalidatePath('/applicant/applications');
    
    return undefined;
  });
}

export async function createExperienceAction(
  data: CreateExperienceData
): Promise<ServerResponse<any>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!data || !data.application_id || !data.position) {
      throw new Error('Experience data with application_id and position are required');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.createExperience(data);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to create experience');
    }
    
    // 3. Revalidate paths for fresh data
    if (result.data) {
      revalidatePath('/applicant/applications');
    }
    
    return result.data;
  });
}

export async function updateExperienceAction(
  data: UpdateExperienceData
): Promise<ServerResponse<any>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!data || !data.id || !data.application_id || !data.position) {
      throw new Error('Experience data with id, application_id and position are required');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.updateExperience(data);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to update experience');
    }
    
    // 3. Revalidate paths for fresh data
    if (result.data) {
      revalidatePath('/applicant/applications');
    }
    
    return result.data;
  });
}

export async function deleteExperienceAction(
  id: string
): Promise<ServerResponse<void>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Experience ID is required');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.deleteExperience(id);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to delete experience');
    }
    
    // 3. Revalidate paths for fresh data
    revalidatePath('/applicant/applications');
    
    return undefined;
  });
}

export async function getExperiencesAction(
  applicationId: string
): Promise<ServerResponse<any[]>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!applicationId || typeof applicationId !== 'string') {
      throw new Error('Application ID is required');
    }
    
    // 2. Business logic
    const result = await ApplicationModel.getExperiences(applicationId);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to fetch experiences');
    }
    
    return result.data || [];
  });
}

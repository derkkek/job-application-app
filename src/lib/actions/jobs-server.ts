'use server'

import { JobModel } from '@/lib/actions/job'
import { revalidatePath } from 'next/cache'
import { ServerResponse, createServerAction } from '@/lib/models/server'
import type { CreateJobData, UpdateJobData, Job, Country } from '@/lib/models/job'
import { getCurrentUserProfileServer } from '@/utils/auth-server'

export async function getJobsAction(
  userType?: "employer" | "applicant", 
  employerId?: string
): Promise<ServerResponse<Job[]>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (userType && !['employer', 'applicant'].includes(userType)) {
      throw new Error('Invalid user type');
    }
    
    // 2. Business logic
    const result = await JobModel.getAll(userType, employerId);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to fetch jobs');
    }
    
    // Transform data to match Job interface
    const transformedData = (result.data || []).map((job: any) => ({
      ...job,
      work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
    }));
    
    return transformedData;
  });
}

export async function getJobByIdAction(
  id: string
): Promise<ServerResponse<Job | null>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Job ID is required');
    }
    
    // 2. Business logic
    const result = await JobModel.getById(id);
    if (result.error) {
      // Instead of throwing, return null to indicate job not found
      console.log(`Job ${id} not found:`, result.error.message);
      return null;
    }
    
    if (!result.data) {
      console.log(`Job ${id} not found: No data returned`);
      return null;
    }
    
    // Transform data to match Job interface
    const transformedData = {
      ...result.data,
      work_location: (result.data as any).work_location as 'onsite' | 'remote' | 'hybrid'
    };
    
    return transformedData;
  });
}

export async function createJobAction(
  data: CreateJobData, 
  employerId: string
): Promise<ServerResponse<Job>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!data || !employerId) {
      throw new Error('Job data and employer ID are required');
    }
    
    if (!data.title || !data.location_country_id || !data.work_location || !data.requirements) {
      throw new Error('Required job fields are missing');
    }

    // Check if user is an employer and matches the employerId
    const { data: userProfile, error: profileError } = await getCurrentUserProfileServer();
    
    if (profileError || !userProfile) {
      throw new Error('User not authenticated');
    }
    
    if (userProfile.user_type !== 'employer') {
      throw new Error('Unauthorized: Only employers can create jobs');
    }
    
    if (userProfile.id !== employerId) {
      throw new Error('Unauthorized: Invalid employer ID');
    }

    // 2. Business logic
    const result = await JobModel.create(data, employerId);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to create job');
    }
    
    // 3. Revalidate paths for fresh data
    if (result.data) {
      revalidatePath('/employer/jobs');
    }
    
    // Transform data to match Job interface
    const transformedData = {
      ...result.data!,
      work_location: (result.data as any).work_location as 'onsite' | 'remote' | 'hybrid'
    };
    
    return transformedData;
  });
}

export async function updateJobAction(
  id: string, 
  data: UpdateJobData
): Promise<ServerResponse<Job>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Job ID is required');
    }
    
    if (!data) {
      throw new Error('Job data is required');
    }
    
    // 2. Business logic
    const result = await JobModel.update(id, data);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to update job');
    }
    
    // 3. Revalidate paths for fresh data
    if (result.data) {
      revalidatePath('/employer/jobs');
      revalidatePath(`/employer/jobs/${id}`);
    }
    
    // Transform data to match Job interface
    const transformedData = {
      ...result.data!,
      work_location: (result.data as any).work_location as 'onsite' | 'remote' | 'hybrid'
    };
    
    return transformedData;
  });
}

export async function deleteJobAction(
  id: string
): Promise<ServerResponse<void>> {
  return createServerAction(async () => {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Job ID is required');
    }
    
    // 2. Business logic
    const result = await JobModel.delete(id);
    if (result.error) {
      throw new Error(result.error.message || 'Failed to delete job');
    }
    
    // 3. Revalidate paths for fresh data
    revalidatePath('/employer/jobs');
    
    return undefined;
  });
}

export async function getCountriesAction(): Promise<ServerResponse<Country[]>> {
  return createServerAction(async () => {
    // 1. Input validation - no parameters needed
    
    // 2. Business logic
    const result = await JobModel.getCountries();
    if (result.error) {
      throw new Error(result.error.message || 'Failed to fetch countries');
    }
    
    return result.data || [];
  });
}

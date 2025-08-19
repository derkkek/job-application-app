'use server'

import { prisma } from '@/utils/database'
import { revalidatePath } from 'next/cache'
import { ServerResponse } from '@/lib/models/server'
import type { CreateJobData, UpdateJobData, Job, Country } from '@/lib/models/job'
import { getCurrentUserProfileServer } from '@/utils/auth-server'

export async function getJobsAction(
  userType?: "employer" | "applicant", 
  employerId?: string
): Promise<ServerResponse<Job[]>> {
  try {
    // 1. Input validation
    if (userType && !['employer', 'applicant'].includes(userType)) {
      throw new Error('Invalid user type');
    }
    
    // 2. Business logic
    let where: any = {}
    
    if (userType === "employer" && employerId) {
      where.employer_id = employerId
    } else if (userType === "applicant") {
      where.is_published = true
    }

    const jobs = await prisma.job_postings.findMany({
      where,
      include: {
        country: true,
        employer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Transform data to match Job interface
    const transformedData = jobs.map((job: any) => ({
      ...job,
      work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
    }));
    
    // 3. Return successful response
    return {
      success: true,
      data: transformedData,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Jobs not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch jobs',
      status: 500
    };
  }
}

export async function getJobByIdAction(
  id: string
): Promise<ServerResponse<Job | null>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Job ID is required');
    }
    
    // 2. Business logic
    const job = await prisma.job_postings.findUnique({
      where: { id },
      include: {
        country: true,
        employer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    if (!job) {
      // Instead of throwing, return null to indicate job not found
      console.log(`Job ${id} not found: No data returned`);
      return {
        success: true,
        data: null,
        status: 200
      };
    }
    
    // Transform data to match Job interface
    const transformedData = {
      ...job,
      work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
    };
    
    // 3. Return successful response
    return {
      success: true,
      data: transformedData,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Job not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch job',
      status: 500
    };
  }
}

export async function createJobAction(
  data: CreateJobData, 
  employerId: string
): Promise<ServerResponse<Job>> {
  try {
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
    const job = await prisma.job_postings.create({
      data: {
        ...data,
        employer_id: employerId,
        is_published: true
      },
      include: {
        country: true
      }
    })
    
    // 3. Revalidate paths for fresh data
    if (job) {
      revalidatePath('/employer/jobs');
    }
    
    // Transform data to match Job interface
    const transformedData = {
      ...job,
      work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
    };
    
    // 3. Return successful response
    return {
      success: true,
      data: transformedData,
      status: 201
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Job with this title already exists',
          status: 409
        };
      }
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Country not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to create job',
      status: 500
    };
  }
}

export async function updateJobAction(
  id: string, 
  data: UpdateJobData
): Promise<ServerResponse<Job>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Job ID is required');
    }
    
    if (!data) {
      throw new Error('Job data is required');
    }
    
    // 2. Business logic
    const job = await prisma.job_postings.update({
      where: { id },
      data,
      include: {
        country: true
      }
    })
    
    // 3. Revalidate paths for fresh data
    if (job) {
      revalidatePath('/employer/jobs');
      revalidatePath(`/employer/jobs/${id}`);
    }
    
    // Transform data to match Job interface
    const transformedData = {
      ...job,
      work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
    };
    
    // 3. Return successful response
    return {
      success: true,
      data: transformedData,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Job not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to update job',
      status: 500
    };
  }
}

export async function deleteJobAction(
  id: string
): Promise<ServerResponse<void>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Job ID is required');
    }
    
    // 2. Business logic
    await prisma.job_postings.delete({
      where: { id }
    })
    
    // 3. Revalidate paths for fresh data
    revalidatePath('/employer/jobs');
    
    // 3. Return successful response
    return {
      success: true,
      data: undefined,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Job not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to delete job',
      status: 500
    };
  }
}

export async function getCountriesAction(): Promise<ServerResponse<Country[]>> {
  try {
    // 1. Input validation - no parameters needed
    
    // 2. Business logic
    const countries = await prisma.countries.findMany({
      orderBy: { name: 'asc' }
    })
    
    // 3. Return successful response
    return {
      success: true,
      data: countries || [],
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Countries not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch countries',
      status: 500
    };
  }
}

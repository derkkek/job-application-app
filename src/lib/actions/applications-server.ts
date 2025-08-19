'use server'

import { prisma } from '@/utils/database'
import { revalidatePath } from 'next/cache'
import { getCurrentUserProfileServer } from '@/utils/auth-server'
import { ServerResponse } from '@/lib/models/server'
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
  try {
    // 1. Input validation
    if (userType && !['employer', 'applicant'].includes(userType)) {
      throw new Error('Invalid user type');
    }
    
    // 2. Business logic
    let where: any = {}
    
    if (userType === "employer") {
      // For employers, get applications for their jobs
      where.job = {
        employer_id: userId
      }
    } else if (userType === "applicant") {
      // For applicants, get their own applications
      where.applicant_id = userId
    }

    const applications = await prisma.job_applications.findMany({
      where,
      include: {
        job: {
          include: {
            country: true
          }
        },
        applicant: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        country: true,
        job_application_experiences: {
          orderBy: { created_at: 'desc' }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Transform data to match ApplicationWithExperiences interface
    const transformedData = applications.map((app: any) => ({
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
          error: 'Applications not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch applications',
      status: 500
    };
  }
}

export async function getApplicationByIdAction(
  id: string
): Promise<ServerResponse<ApplicationWithExperiences>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Application ID is required');
    }
    
    // 2. Business logic
    const application = await prisma.job_applications.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            country: true
          }
        },
        applicant: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        country: true,
        job_application_experiences: {
          orderBy: { created_at: 'desc' }
        }
      }
    })

    if (!application) {
      throw new Error('Application not found');
    }
    
    // Transform data to match ApplicationWithExperiences interface
    const transformedData = {
      ...application,
      created_at: application.created_at instanceof Date ? application.created_at.toISOString() : application.created_at,
      updated_at: application.updated_at instanceof Date ? application.updated_at.toISOString() : application.updated_at,
      experiences: (application.job_application_experiences || []).map((exp: any) => ({
        ...exp,
        end_date: exp.end_date ?? undefined,
        summary: exp.summary ?? undefined,
        created_at: exp.created_at instanceof Date ? exp.created_at.toISOString() : exp.created_at
      })),
      additional_expectations: application.additional_expectations ?? undefined
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
          error: 'Application not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch application',
      status: 500
    };
  }
}

export async function getApplicationByJobAndApplicantAction(
  jobId: string, 
  applicantId: string
): Promise<ServerResponse<ApplicationWithExperiences | null>> {
  try {
    // 1. Input validation
    if (!jobId || typeof jobId !== 'string') {
      throw new Error('Job ID is required');
    }
    if (!applicantId || typeof applicantId !== 'string') {
      throw new Error('Applicant ID is required');
    }
    
    // 2. Business logic
    const application = await prisma.job_applications.findUnique({
      where: {
        job_id_applicant_id: {
          job_id: jobId,
          applicant_id: applicantId
        }
      },
      include: {
        job_application_experiences: {
          orderBy: { created_at: 'desc' }
        }
      }
    })

    // Transform data to match ApplicationWithExperiences interface
    if (!application) {
      return {
        success: true,
        data: null,
        status: 200
      };
    }
    
    const transformedData = {
      ...application,
      created_at: application.created_at instanceof Date ? application.created_at.toISOString() : application.created_at,
      updated_at: application.updated_at instanceof Date ? application.updated_at.toISOString() : application.updated_at,
      experiences: (application.job_application_experiences || []).map((exp: any) => ({
        ...exp,
        end_date: exp.end_date ?? undefined,
        summary: exp.summary ?? undefined,
        created_at: exp.created_at instanceof Date ? exp.created_at.toISOString() : exp.created_at
      })),
      additional_expectations: application.additional_expectations ?? undefined
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
          error: 'Application not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch application',
      status: 500
    };
  }
}

export async function createApplicationAction(
  data: CreateApplicationData, 
  applicantId: string
): Promise<ServerResponse<any>> {
  try {
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
    const application = await prisma.job_applications.create({
      data: {
        ...data,
        applicant_id: applicantId
      },
      include: {
        job: {
          include: {
            country: true
          }
        },
        country: true
      }
    })

    // 3. Revalidate paths for fresh data
    if (application) {
      revalidatePath('/applicant/applications');
      revalidatePath(`/applicant/jobs/${data.job_id}`);
    }
    
    // 3. Return successful response
    return {
      success: true,
      data: application,
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
          error: 'Application already exists',
          status: 409
        };
      }
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
      error: error.message || 'Failed to create application',
      status: 500
    };
  }
}

export async function updateApplicationAction(
  id: string, 
  data: UpdateApplicationData
): Promise<ServerResponse<any>> {
  try {
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
    const application = await prisma.job_applications.update({
      where: { id },
      data,
      include: {
        job: {
          include: {
            country: true
          }
        },
        country: true
      }
    })
    
    // 3. Revalidate paths for fresh data
    if (application) {
      revalidatePath('/applicant/applications');
      revalidatePath(`/applicant/jobs/${data.id}`);
    }
    
    // 3. Return successful response
    return {
      success: true,
      data: application,
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
          error: 'Application not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to update application',
      status: 500
    };
  }
}

export async function deleteApplicationAction(
  id: string
): Promise<ServerResponse<void>> {
  try {
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
    await prisma.job_applications.delete({
      where: { id }
    })
    
    // 3. Revalidate paths for fresh data
    revalidatePath('/applicant/applications');
    
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
          error: 'Application not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to delete application',
      status: 500
    };
  }
}

export async function createExperienceAction(
  data: CreateExperienceData
): Promise<ServerResponse<any>> {
  try {
    // 1. Input validation
    if (!data || !data.application_id || !data.position) {
      throw new Error('Experience data with application_id and position are required');
    }
    
    // 2. Business logic
    const experience = await prisma.job_application_experiences.create({
      data
    })
    
    // 3. Revalidate paths for fresh data
    if (experience) {
      revalidatePath('/applicant/applications');
    }
    
    // 3. Return successful response
    return {
      success: true,
      data: experience,
      status: 201
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Application not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to create experience',
      status: 500
    };
  }
}

export async function updateExperienceAction(
  data: UpdateExperienceData
): Promise<ServerResponse<any>> {
  try {
    // 1. Input validation
    if (!data || !data.id || !data.application_id || !data.position) {
      throw new Error('Experience data with id, application_id and position are required');
    }
    
    // 2. Business logic
    const experience = await prisma.job_application_experiences.update({
      where: { id: data.id },
      data: {
        position: data.position,
        start_date: data.start_date,
        end_date: data.end_date,
        still_working: data.still_working,
        summary: data.summary
      }
    })
    
    // 3. Revalidate paths for fresh data
    if (experience) {
      revalidatePath('/applicant/applications');
    }
    
    // 3. Return successful response
    return {
      success: true,
      data: experience,
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
          error: 'Experience not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to update experience',
      status: 500
    };
  }
}

export async function deleteExperienceAction(
  id: string
): Promise<ServerResponse<void>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Experience ID is required');
    }
    
    // 2. Business logic
    await prisma.job_application_experiences.delete({
      where: { id }
    })
    
    // 3. Revalidate paths for fresh data
    revalidatePath('/applicant/applications');
    
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
          error: 'Experience not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to delete experience',
      status: 500
    };
  }
}

export async function getExperiencesAction(
  applicationId: string
): Promise<ServerResponse<any[]>> {
  try {
    // 1. Input validation
    if (!applicationId || typeof applicationId !== 'string') {
      throw new Error('Application ID is required');
    }
    
    // 2. Business logic
    const experiences = await prisma.job_application_experiences.findMany({
      where: { application_id: applicationId },
      orderBy: { created_at: 'desc' }
    })
    
    // 3. Return successful response
    return {
      success: true,
      data: experiences || [],
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
          error: 'Application not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch experiences',
      status: 500
    };
  }
}

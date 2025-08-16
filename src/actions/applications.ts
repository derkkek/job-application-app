'use server'

import { ApplicationModel } from '@/models/application'
import { revalidatePath } from 'next/cache'
import type { 
  CreateApplicationData, 
  UpdateApplicationData,
  CreateExperienceData,
  UpdateExperienceData
} from '@/types/application'

export async function getApplicationsAction(userType?: "employer" | "applicant", userId?: string) {
  try {
    const result = await ApplicationModel.getAll(userType, userId)
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch applications' } }
  }
}

export async function getApplicationByIdAction(id: string) {
  try {
    const result = await ApplicationModel.getById(id)
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch application' } }
  }
}

export async function getApplicationByJobAndApplicantAction(jobId: string, applicantId: string) {
  try {
    const result = await ApplicationModel.getByJobAndApplicant(jobId, applicantId)
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch application' } }
  }
}

export async function createApplicationAction(data: CreateApplicationData, applicantId: string) {
  try {
    // Check if user is an applicant
    const { isApplicant } = await import('@/utils/auth');
    const userIsApplicant = await isApplicant();
    
    if (!userIsApplicant) {
      return { data: null, error: { message: 'Unauthorized: Only applicants can apply for jobs' } };
    }

    const result = await ApplicationModel.create(data, applicantId)
    if (result.data) {
      revalidatePath('/applicant/applications')
      revalidatePath(`/applicant/jobs/${data.job_id}`)
    }
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to create application' } }
  }
}

export async function updateApplicationAction(id: string, data: UpdateApplicationData) {
  try {
    const result = await ApplicationModel.update(id, data)
    if (result.data) {
      revalidatePath('/applicant/applications')
      revalidatePath(`/applicant/jobs/${data.id}`)
    }
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to update application' } }
  }
}

export async function deleteApplicationAction(id: string) {
  try {
    const result = await ApplicationModel.delete(id)
    if (!result.error) {
      revalidatePath('/applicant/applications')
    }
    return result
  } catch (error) {
    return { error: { message: 'Failed to delete application' } }
  }
}

export async function createExperienceAction(data: CreateExperienceData) {
  try {
    const result = await ApplicationModel.createExperience(data)
    if (result.data) {
      revalidatePath('/applicant/applications')
    }
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to create experience' } }
  }
}

export async function updateExperienceAction(data: UpdateExperienceData) {
  try {
    const result = await ApplicationModel.updateExperience(data)
    if (result.data) {
      revalidatePath('/applicant/applications')
    }
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to update experience' } }
  }
}

export async function deleteExperienceAction(id: string) {
  try {
    const result = await ApplicationModel.deleteExperience(id)
    if (!result.error) {
      revalidatePath('/applicant/applications')
    }
    return result
  } catch (error) {
    return { error: { message: 'Failed to delete experience' } }
  }
}

export async function getExperiencesAction(applicationId: string) {
  try {
    const result = await ApplicationModel.getExperiences(applicationId)
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch experiences' } }
  }
}

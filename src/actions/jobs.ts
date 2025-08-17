'use server'

import { JobModel } from '@/models/job'
import { revalidatePath } from 'next/cache'
import type { CreateJobData, UpdateJobData } from '@/types/job'
import { getCurrentUserProfileServer } from '@/utils/auth-server' // ✅ Use server-side version

export async function getJobsAction(userType?: "employer" | "applicant", employerId?: string) {
  try {
    const result = await JobModel.getAll(userType, employerId)
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch jobs' } }
  }
}

export async function getJobByIdAction(id: string) {
  try {
    const result = await JobModel.getById(id)
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch job' } }
  }
}

export async function createJobAction(data: CreateJobData, employerId: string) {
  try {
    // Check if user is an employer and matches the employerId
    const { data: userProfile, error: profileError } = await getCurrentUserProfileServer(); // ✅ Use server-side version
    
    if (profileError || !userProfile) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    
    if (userProfile.user_type !== 'employer') {
      return { data: null, error: { message: 'Unauthorized: Only employers can create jobs' } };
    }
    
    if (userProfile.id !== employerId) {
      return { data: null, error: { message: 'Unauthorized: Invalid employer ID' } };
    }

    const result = await JobModel.create(data, employerId)
    if (result.data) {
      revalidatePath('/employer/jobs')
    }
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to create job' } }
  }
}

export async function updateJobAction(id: string, data: UpdateJobData) {
  try {
    const result = await JobModel.update(id, data)
    if (result.data) {
      revalidatePath('/employer/jobs')
      revalidatePath(`/employer/jobs/${id}`)
    }
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to update job' } }
  }
}

export async function deleteJobAction(id: string) {
  try {
    const result = await JobModel.delete(id)
    if (!result.error) {
      revalidatePath('/employer/jobs')
    }
    return result
  } catch (error) {
    return { error: { message: 'Failed to delete job' } }
  }
}

export async function getCountriesAction() {
  try {
    const result = await JobModel.getCountries()
    return result
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch countries' } }
  }
}
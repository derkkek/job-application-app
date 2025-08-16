'use server'

import { JobModel } from '@/models/job'
import { revalidatePath } from 'next/cache'
import type { CreateJobData, UpdateJobData } from '@/types/job'

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
    // Check if user is an employer
    const { isEmployer } = await import('@/utils/auth');
    const userIsEmployer = await isEmployer();
    
    if (!userIsEmployer) {
      return { data: null, error: { message: 'Unauthorized: Only employers can create jobs' } };
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

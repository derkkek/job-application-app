import { prisma } from '@/lib/prisma'
import { Job, CreateJobData } from '@/types/job'
import { JobApplication, CreateApplicationData } from '@/types/application'

// Jobs
export async function getJobs(employerId?: string): Promise<Job[]> {
  const jobs = await prisma.job_postings.findMany({
    where: employerId ? { employer_id: employerId } : { is_published: true },
    include: {
      country: true,
      employer: true,
    },
    orderBy: { created_at: 'desc' },
  })
  return jobs
}

export async function createJob(data: CreateJobData & { employer_id: string }): Promise<Job> {
  const job = await prisma.job_postings.create({
    data,
    include: {
      country: true,
      employer: true,
    },
  })
  return job
}

// Applications
export async function getApplications(applicantId?: string): Promise<JobApplication[]> {
  const applications = await prisma.job_applications.findMany({
    where: applicantId ? { applicant_id: applicantId } : {},
    include: {
      job: {
        include: {
          country: true,
        },
      },
      country: true,
      job_application_experiences: true,
    },
    orderBy: { created_at: 'desc' },
  })
  return applications
}

export async function createApplication(data: CreateApplicationData & { applicant_id: string }): Promise<JobApplication> {
  const application = await prisma.job_applications.create({
    data: {
      ...data,
      experiences: undefined, // Handle experiences separately
    },
    include: {
      job: true,
      country: true,
      job_application_experiences: true,
    },
  })
  return application
}
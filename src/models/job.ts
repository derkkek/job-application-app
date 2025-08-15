import { prisma, handlePrismaError } from '@/utils/database'
import type { Job, CreateJobData, UpdateJobData, Country } from '@/types/job'

export class JobModel {
  // Get all jobs with optional filtering
  static async getAll(userType?: "employer" | "applicant", employerId?: string) {
    try {
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

      return { data: jobs, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Get job by ID with related data
  static async getById(id: string) {
    try {
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
        return { data: null, error: { message: 'Job not found' } }
      }

      return { data: job, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Create new job
  static async create(data: CreateJobData, employerId: string) {
    try {
      const job = await prisma.job_postings.create({
        data: {
          ...data,
          employer_id: employerId,
          is_published: false
        },
        include: {
          country: true
        }
      })

      return { data: job, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Update job
  static async update(id: string, data: UpdateJobData) {
    try {
      const job = await prisma.job_postings.update({
        where: { id },
        data,
        include: {
          country: true
        }
      })

      return { data: job, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Delete job
  static async delete(id: string) {
    try {
      await prisma.job_postings.delete({
        where: { id }
      })

      return { error: null }
    } catch (error) {
      return { error: handlePrismaError(error) }
    }
  }

  // Get all countries
  static async getCountries() {
    try {
      const countries = await prisma.countries.findMany({
        orderBy: { name: 'asc' }
      })

      return { data: countries, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }
}

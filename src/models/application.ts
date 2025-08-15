import { prisma, handlePrismaError } from '@/utils/database'
import type { 
  JobApplication, 
  CreateApplicationData, 
  UpdateApplicationData,
  JobApplicationExperience,
  CreateExperienceData,
  UpdateExperienceData,
  ApplicationWithExperiences
} from '@/types/application'

export class ApplicationModel {
  // Get all applications with optional filtering
  static async getAll(userType?: "employer" | "applicant", userId?: string) {
    try {
      let where: any = {}
      
      if (userType === "employer") {
        // For employers, get applications for their jobs
        where.job_postings = {
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

      return { data: applications, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Get application by ID with experiences
  static async getById(id: string) {
    try {
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
        return { data: null, error: { message: 'Application not found' } }
      }

      return { data: application, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Get application by job ID and applicant ID
  static async getByJobAndApplicant(jobId: string, applicantId: string) {
    try {
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

      return { data: application, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Create new application
  static async create(data: CreateApplicationData, applicantId: string) {
    try {
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

      return { data: application, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Update application
  static async update(id: string, data: UpdateApplicationData) {
    try {
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

      return { data: application, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Delete application
  static async delete(id: string) {
    try {
      await prisma.job_applications.delete({
        where: { id }
      })

      return { error: null }
    } catch (error) {
      return { error: handlePrismaError(error) }
    }
  }

  // Create experience
  static async createExperience(data: CreateExperienceData) {
    try {
      const experience = await prisma.job_application_experiences.create({
        data
      })

      return { data: experience, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Update experience
  static async updateExperience(data: UpdateExperienceData) {
    try {
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

      return { data: experience, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Delete experience
  static async deleteExperience(id: string) {
    try {
      await prisma.job_application_experiences.delete({
        where: { id }
      })

      return { error: null }
    } catch (error) {
      return { error: handlePrismaError(error) }
    }
  }

  // Get experiences for an application
  static async getExperiences(applicationId: string) {
    try {
      const experiences = await prisma.job_application_experiences.findMany({
        where: { application_id: applicationId },
        orderBy: { created_at: 'desc' }
      })

      return { data: experiences, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }
}

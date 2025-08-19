import { prisma, handlePrismaError } from '@/utils/database'
import type { UserProfile } from '@/lib/models/user'

export class UserModel {
  // Get user profile by ID
  static async getById(id: string) {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { id }
      })

      if (!profile) {
        return { data: null, error: { message: 'User profile not found' } }
      }

      // Transform the data to match UserProfile interface
      const userProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        user_type: profile.user_type as 'employer' | 'applicant',
        created_at: profile.created_at.toISOString(),
        updated_at: profile.updated_at.toISOString()
      }

      return { data: userProfile, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Get user profile by email
  static async getByEmail(email: string) {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { email }
      })

      if (!profile) {
        return { data: null, error: { message: 'User profile not found' } }
      }

      // Transform the data to match UserProfile interface
      const userProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        user_type: profile.user_type as 'employer' | 'applicant',
        created_at: profile.created_at.toISOString(),
        updated_at: profile.updated_at.toISOString()
      }

      return { data: userProfile, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Create user profile
  static async create(data: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    user_type: 'employer' | 'applicant'
  }) {
    try {
      const profile = await prisma.profiles.create({
        data
      })

      return { data: profile, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Update user profile
  static async update(id: string, data: Partial<UserProfile>) {
    try {
      const profile = await prisma.profiles.update({
        where: { id },
        data
      })

      return { data: profile, error: null }
    } catch (error) {
      return { data: null, error: handlePrismaError(error) }
    }
  }

  // Check if user is employer
  static async isEmployer(userId: string) {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { id: userId },
        select: { user_type: true }
      })

      return profile?.user_type === 'employer'
    } catch (error) {
      return false
    }
  }

  // Check if user is applicant
  static async isApplicant(userId: string) {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { id: userId },
        select: { user_type: true }
      })

      return profile?.user_type === 'applicant'
    } catch (error) {
      return false
    }
  }
}

'use server'

import { prisma } from '@/utils/database'
import { ServerResponse } from '@/lib/models/server'
import type { UserProfile } from '@/lib/models/user'

export async function getUserByIdAction(
  id: string
): Promise<ServerResponse<UserProfile>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('User ID is required');
    }
    
    // 2. Business logic
    const profile = await prisma.profiles.findUnique({
      where: { id }
    })

    if (!profile) {
      throw new Error('User profile not found');
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
    
    // 3. Return successful response
    return {
      success: true,
      data: userProfile,
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
          error: 'User profile not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch user profile',
      status: 500
    };
  }
}

export async function getUserByEmailAction(
  email: string
): Promise<ServerResponse<UserProfile>> {
  try {
    // 1. Input validation
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }
    
    // 2. Business logic
    const profile = await prisma.profiles.findUnique({
      where: { email }
    })

    if (!profile) {
      throw new Error('User profile not found');
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
    
    // 3. Return successful response
    return {
      success: true,
      data: userProfile,
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
          error: 'User profile not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to fetch user profile',
      status: 500
    };
  }
}

export async function createUserAction(
  data: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    user_type: 'employer' | 'applicant'
  }
): Promise<ServerResponse<any>> {
  try {
    // 1. Input validation
    if (!data || !data.id || !data.email || !data.user_type) {
      throw new Error('User ID, email, and user type are required');
    }
    
    if (!['employer', 'applicant'].includes(data.user_type)) {
      throw new Error('Invalid user type');
    }
    
    // 2. Business logic
    const profile = await prisma.profiles.create({
      data
    })
    
    // 3. Return successful response
    return {
      success: true,
      data: profile,
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
          error: 'User profile already exists',
          status: 409
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to create user profile',
      status: 500
    };
  }
}

export async function updateUserAction(
  id: string, 
  data: Partial<UserProfile>
): Promise<ServerResponse<any>> {
  try {
    // 1. Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('User ID is required');
    }
    
    if (!data) {
      throw new Error('Update data is required');
    }
    
    // 2. Business logic
    const profile = await prisma.profiles.update({
      where: { id },
      data
    })
    
    // 3. Return successful response
    return {
      success: true,
      data: profile,
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
          error: 'User profile not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to update user profile',
      status: 500
    };
  }
}

export async function isEmployerAction(
  userId: string
): Promise<ServerResponse<boolean>> {
  try {
    // 1. Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required');
    }
    
    // 2. Business logic
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { user_type: true }
    })

    const result = profile?.user_type === 'employer'
    
    // 3. Return successful response
    return {
      success: true,
      data: result,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to check employer status',
      status: 500
    };
  }
}

export async function isApplicantAction(
  userId: string
): Promise<ServerResponse<boolean>> {
  try {
    // 1. Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required');
    }
    
    // 2. Business logic
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { user_type: true }
    })

    const result = profile?.user_type === 'applicant'
    
    // 3. Return successful response
    return {
      success: true,
      data: result,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Failed to check applicant status',
      status: 500
    };
  }
}

// src/app/api/auth/profile/route.ts (Debug Version)
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/utils/database';
import type { UserProfile } from '@/lib/models/user';

export async function GET() {
  
  try {
    const supabase = await createClient();
    
    // Get current user from Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔍 API Profile: Auth user result:', {
      user: user ? { id: user.id, email: user.email } : null,
      error: userError
    });
    
    if (userError || !user) {
      return NextResponse.json(
        { data: null, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile from Prisma
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id }
    });
    
    if (!profile) {
      return NextResponse.json(
        { data: null, error: { message: 'User profile not found' } },
        { status: 404 }
      );
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
    };

    console.log('🔍 API Profile: Database result:', {
      data: { id: userProfile.id, user_type: userProfile.user_type },
      error: null
    });
    
    return NextResponse.json({ data: userProfile, error: null });
  } catch (error) {
    console.error('❌ API Profile: Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// src/app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { UserModel } from '@/models/user';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user from Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { data: null, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile from Prisma
    const result = await UserModel.getById(user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// src/app/api/auth/profile/route.ts (Debug Version)
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { UserModel } from '@/lib/actions/user';

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
    const result = await UserModel.getById(user.id);
    console.log('🔍 API Profile: Database result:', {
      data: result.data ? { id: result.data.id, user_type: result.data.user_type } : null,
      error: result.error
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ API Profile: Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
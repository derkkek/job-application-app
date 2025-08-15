import { NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/utils/auth';

export async function GET() {
  try {
    const result = await getCurrentUserProfile();
    
    if (result.error) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

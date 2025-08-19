import { NextRequest, NextResponse } from 'next/server';
import { getApplicationsAction } from '@/lib/actions/applications-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') as "employer" | "applicant";
    const userId = searchParams.get('userId');

    if (!userType || !userId) {
      return NextResponse.json(
        { error: { message: 'Missing required parameters' } },
        { status: 400 }
      );
    }

    const result = await getApplicationsAction(userType, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: { message: result.error } }, 
        { status: result.status }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

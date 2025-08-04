import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  // Update user's auth session
  const response = await updateSession(request)
  
  // Get the pathname
  const pathname = request.nextUrl.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/test-supabase', '/test-application', '/test-role']
  
  // Check if the current path is a public route
  if (publicRoutes.includes(pathname)) {
    return response
  }
  
  // Protected routes - check authentication
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // If no user, redirect to login
    if (error || !user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Get user profile to check user type
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    // Role-based access control
    if (pathname.startsWith('/employer/')) {
      if (!profile || profile.user_type !== 'employer') {
        // Redirect to appropriate dashboard based on user type
        const redirectUrl = profile?.user_type === 'applicant' ? '/applicant/jobs' : '/login'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    
    if (pathname.startsWith('/applicant/')) {
      if (!profile || profile.user_type !== 'applicant') {
        // Redirect to appropriate dashboard based on user type
        const redirectUrl = profile?.user_type === 'employer' ? '/employer/jobs' : '/login'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
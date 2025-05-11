import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server' // For reading cookies server-side

export async function middleware(request: NextRequest) {
  // Update user's session
  const response = await updateSession(request)

  const supabase = createServerClient() // This uses the server client correctly
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define public and auth routes
  const publicRoutes = ['/', '/login', '/pricing', '/auth/callback']
  const authRoutes = ['/dashboard'] // Add other routes that require auth

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
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

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for static files (images, CSS, JS, etc.)
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/favicon.ico') ||
    req.nextUrl.pathname.startsWith('/logo.png') ||
    req.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/)
  ) {
    return res
  }
  
  // Temporarily bypass Supabase for landing page and login
  if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login') {
    return res
  }
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Allow these routes without any checks (public routes)
  const allowedRoutes = [
    '/', // Landing page is now public
    '/auth/success',
    '/questionnaire',
    '/login', 
    '/join',
    '/_next',
    '/favicon.ico'
  ]
  
  const isAllowedRoute = allowedRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route)
  )

  if (isAllowedRoute) {
    return res
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/app', '/contact', '/admin', '/group', '/payment', '/rsvp', '/feedback']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  )

  // If user is not signed in and trying to access a protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 
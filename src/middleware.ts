import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Allow these routes without any checks
  const allowedRoutes = [
    '/auth/success',
    '/questionnaire',
    '/login', 
    '/join',
    '/_next',
    '/favicon.ico'
  ]
  
  const isAllowedRoute = allowedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isAllowedRoute) {
    return res
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/', '/contact', '/admin', '/group', '/payment', '/rsvp', '/feedback']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  )

  // If user is not signed in and trying to access a protected route
  if (!session && isProtectedRoute) {
    // Special handling for root path on app subdomain
    if (req.nextUrl.pathname === '/') {
      const hostname = req.headers.get('host') || ''
      if (hostname.includes('app.')) {
        // Redirect to main marketing site instead of login
        return NextResponse.redirect('https://myglobalink.co')
      }
    }
    
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 
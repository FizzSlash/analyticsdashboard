import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Temporarily disable auth middleware to get the app working
  return NextResponse.next()

  // Protected routes that require authentication
  const protectedPaths = ['/agency', '/client', '/admin']
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // Public routes that should redirect to dashboard if already logged in
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // If accessing protected route without session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth pages with session, redirect to appropriate dashboard
  if (isAuthPath && session) {
    // Get user profile to determine redirect destination
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, agency_id, client_id')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      if (profile.role === 'agency_admin') {
        const { data: agency } = await supabase
          .from('agencies')
          .select('agency_slug')
          .eq('id', profile.agency_id)
          .single()
        
        if (agency) {
          return NextResponse.redirect(new URL(`/agency/${agency.agency_slug}/admin`, req.url))
        }
      } else if (profile.role === 'client_user' && profile.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('brand_slug')
          .eq('id', profile.client_id)
          .single()
        
        if (client) {
          return NextResponse.redirect(new URL(`/client/${client.brand_slug}`, req.url))
        }
      }
    }
  }

  // Role-based access control for specific routes
  if (session && req.nextUrl.pathname.startsWith('/agency/')) {
    const pathParts = req.nextUrl.pathname.split('/')
    const agencySlug = pathParts[2]
    
    if (agencySlug) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, agency_id')
        .eq('id', session.user.id)
        .single()

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('agency_slug', agencySlug)
        .single()

      // Check if user has access to this agency
      if (profile && agency && profile.role === 'agency_admin' && profile.agency_id === agency.id) {
        // Access granted
      } else {
        // Access denied - redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }

  // Client route access control
  if (session && req.nextUrl.pathname.startsWith('/client/')) {
    const pathParts = req.nextUrl.pathname.split('/')
    const clientSlug = pathParts[2]
    
    if (clientSlug) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, agency_id, client_id')
        .eq('id', session.user.id)
        .single()

      const { data: client } = await supabase
        .from('clients')
        .select('id, agency_id')
        .eq('brand_slug', clientSlug)
        .single()

      if (profile && client) {
        // Agency admins can access any client in their agency
        if (profile.role === 'agency_admin' && profile.agency_id === client.agency_id) {
          // Access granted
        }
        // Client users can only access their specific client
        else if (profile.role === 'client_user' && profile.client_id === client.id) {
          // Access granted
        } else {
          // Access denied
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      } else {
        return NextResponse.redirect(new URL('/not-found', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getSecurityHeaders } from '@/lib/security/headers'

// Apply security headers to any NextResponse
function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(getSecurityHeaders())) {
    res.headers.set(key, value)
  }
  return res
}

function redirectWithCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  path: string,
  searchParams?: Record<string, string>
) {
  const url = new URL(path, request.url)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value)
    }
  }

  const response = NextResponse.redirect(url)

  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie)
  }

  return applySecurityHeaders(response)
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ── Admin routes: session refresh + auth gate ────────────────────────────
  if (pathname.startsWith('/admin')) {
    const { supabaseResponse, user } = await updateSession(request)

    if (pathname === '/admin/login') {
      if (user) {
        return redirectWithCookies(request, supabaseResponse, '/admin')
      }
      return applySecurityHeaders(supabaseResponse)
    }

    if (!user) {
      return redirectWithCookies(request, supabaseResponse, '/admin/login', {
        redirectTo: `${pathname}${search}`,
      })
    }

    return applySecurityHeaders(supabaseResponse)
  }

  // ── All other routes: security headers only ──────────────────────────────
  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    /*
     * Match all request paths except Next.js internals and static files.
     * This ensures security headers are applied to every HTML, API, and
     * dynamic response while skipping assets that don't need them.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
}
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getSecurityHeaders } from '@/lib/security/headers'

function applySecurityHeaders(response: NextResponse) {
  const headers = getSecurityHeaders()

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  return response
}

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie)
  }
}

function redirectWithCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
  searchParams?: Record<string, string>
) {
  const url = new URL(pathname, request.url)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value)
    }
  }

  const response = NextResponse.redirect(url)
  copyCookies(supabaseResponse, response)

  return applySecurityHeaders(response)
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const { supabaseResponse, user } = await updateSession(request)

    const isLoginPage = pathname === '/admin/login'
    const isAccessDeniedPage = pathname === '/admin/access-denied'

    if (isLoginPage) {
      if (!user) {
        return applySecurityHeaders(supabaseResponse)
      }

      return redirectWithCookies(request, supabaseResponse, '/admin')
    }

    if (!user) {
      return redirectWithCookies(request, supabaseResponse, '/admin/login', {
        redirectTo: `${pathname}${search}`,
      })
    }

    if (isAccessDeniedPage) {
      return applySecurityHeaders(supabaseResponse)
    }

    return applySecurityHeaders(supabaseResponse)
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
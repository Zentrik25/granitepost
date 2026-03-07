import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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

  return response
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  // Allow the admin login page for logged-out users
  if (pathname === '/admin/login') {
    if (user) {
      return redirectWithCookies(request, supabaseResponse, '/admin')
    }
    return supabaseResponse
  }

  // Any other admin route requires authentication
  if (!user) {
    return redirectWithCookies(request, supabaseResponse, '/admin/login', {
      redirectTo: `${pathname}${search}`,
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
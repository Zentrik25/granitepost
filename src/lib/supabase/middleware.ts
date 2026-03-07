import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Creates a Supabase client for use inside Next.js middleware.
// Refreshes the session cookie on admin requests only.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: {
            name: string
            value: string
            options?: Record<string, unknown>
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options as never)
          })
        },
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Invalid or stale session, clear Supabase cookies
  if (authError && authError.status === 400) {
    const clearResponse = NextResponse.next({ request })

    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        clearResponse.cookies.delete(name)
      }
    })

    return { supabaseResponse: clearResponse, user: null }
  }

  return { supabaseResponse, user }
}
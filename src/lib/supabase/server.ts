import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { serverEnv } from '@/lib/env.server'

// ── Anon / session-aware client ───────────────────────────────────────────────
// Reads the user's auth cookies so RLS policies apply correctly.
// Use for Server Components, Server Actions, and Route Handlers.

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any)
            )
          } catch {
            // Thrown when called from a Server Component render — safe to ignore.
            // The middleware will refresh the session on the next request.
          }
        },
      },
    }
  )
}

// Named alias used by new code that wants a more descriptive import.
export const createServerSupabaseClient = createClient

// ── Service-role client ───────────────────────────────────────────────────────
// Bypasses RLS entirely. Use ONLY in trusted server-side paths.
// The 'server-only' import at the top of this file prevents this module from
// being included in any browser bundle.

export function createServiceRoleSupabaseClient() {
  return createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  )
}

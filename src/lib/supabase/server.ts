import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { serverEnv } from '@/lib/env.server'

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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as never)
            })
          } catch {
            // Safe in Server Component render paths.
          }
        },
      },
    }
  )
}

export const createServerSupabaseClient = createClient

/**
 * Stateless anon client — no cookies, no session.
 * Use this for ALL public ISR/SSG queries (article pages, homepage, category pages).
 *
 * Why: calling cookies() anywhere in a render tree opts the entire route segment
 * into dynamic rendering, silently breaking revalidate and generateStaticParams.
 * This client avoids that entirely. RLS still enforces PUBLISHED-only reads via
 * the anon key — no security regression.
 *
 * Rule: use createClient() only for admin/auth routes that need session context.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export function createServiceRoleSupabaseClient() {
  return createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
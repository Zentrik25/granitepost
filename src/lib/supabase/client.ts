import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { clientEnv } from '@/lib/env'

// Browser/client-side Supabase client — uses only the anon key.
// Safe to import in Client Components ('use client').
// Typed with the full Database schema for autocomplete and type safety.
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

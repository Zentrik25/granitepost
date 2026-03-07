import { z } from 'zod'

// Public variables only — safe to import in browser bundles and client components.
// For server-only env (includes SUPABASE_SERVICE_ROLE_KEY) import from '@/lib/env.server'.

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

const result = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

if (!result.success) {
  const messages = result.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  throw new Error(`\n[env] Missing or invalid public environment variables:\n${messages}`)
}

export const clientEnv = result.data
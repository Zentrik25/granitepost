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
  // Optional — fall back to hardcoded defaults in page components if not set
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .refine((v) => /^https?:\/\/.+/.test(v), 'Must be a valid URL')
    .optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_EMAIL: z
    .string()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Must be a valid email')
    .optional(),
})

const result = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL:          process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_NAME:         process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_EMAIL:        process.env.NEXT_PUBLIC_SITE_EMAIL,
})

if (!result.success) {
  const messages = result.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  throw new Error(`\n[env] Missing or invalid public environment variables:\n${messages}`)
}

export const clientEnv = result.data
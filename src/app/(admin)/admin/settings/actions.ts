'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'

// Keys the server action will accept — prevents arbitrary key injection.
const ALLOWED_KEYS = [
  'site_name',
  'site_description',
  'contact_email',
  'twitter_handle',
  'facebook_url',
  'whatsapp_url',
  'comments_enabled',
  'newsletter_enabled',
] as const

type AllowedKey = (typeof ALLOWED_KEYS)[number]

export async function saveSettings(
  fields: Partial<Record<AllowedKey, string>>
): Promise<{ error: string | null }> {
  // Must be an authenticated admin — RLS on site_settings requires is_admin().
  const { role } = await requireAuth()
  if (role !== 'ADMIN') return { error: 'Unauthorized: admin role required.' }

  const upserts = ALLOWED_KEYS
    .filter((k) => k in fields)
    .map((k) => ({ key: k, value: fields[k] ?? '' }))

  if (upserts.length === 0) return { error: null }

  const supabase = await createClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return { error: error.message }

  // Bust the cached settings so getSiteSettings() re-fetches on next request.
  revalidateTag('site-settings')

  // Revalidate all public pages that embed settings (layout wraps everything).
  revalidatePath('/', 'layout')

  return { error: null }
}

import 'server-only'
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  site_name: string
  site_description: string
  contact_email: string
  twitter_handle: string
  facebook_url: string
  whatsapp_url: string
  comments_enabled: string
  newsletter_enabled: string
}

const DEFAULTS: SiteSettings = {
  site_name: 'Zimbabwe News Online',
  site_description: 'Breaking news and in-depth coverage from Zimbabwe and across Africa.',
  contact_email: '',
  twitter_handle: '',
  facebook_url: '',
  whatsapp_url: '',
  comments_enabled: 'true',
  newsletter_enabled: 'true',
}

// ── Query ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all site settings using the service-role client, bypassing RLS.
 *
 * WHY admin client: site_settings RLS restricts SELECT to is_staff().
 * The public layout renders with no user session (anon role), so a regular
 * client returns zero rows.  The admin client (service-role) is safe here
 * because this function is server-only and the result is cached.
 *
 * Cached with tag 'site-settings' so saveSettings() can call
 * revalidateTag('site-settings') to bust the cache on every admin save.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createAdminClient()
    const { data } = await supabase.from('site_settings').select('key, value')

    const map: Record<string, string> = {}
    for (const row of data ?? []) {
      map[row.key] = row.value
    }

    return { ...DEFAULTS, ...map } as SiteSettings
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 3600 }
)

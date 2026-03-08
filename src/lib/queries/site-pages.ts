import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SitePage } from '@/types'

export type { SitePage }

/**
 * Fetch a single site page by slug for public rendering.
 * Cached per request via React.cache.
 */
export const getSitePage = cache(async (slug: string): Promise<SitePage | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_pages')
    .select('id, slug, title, meta_description, content_html, updated_at')
    .eq('slug', slug)
    .single()
  return data ?? null
})

/**
 * Fetch all site pages for the admin list view.
 */
export async function getAllSitePages(): Promise<SitePage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_pages')
    .select('id, slug, title, meta_description, content_html, updated_at')
    .order('slug')
  return data ?? []
}

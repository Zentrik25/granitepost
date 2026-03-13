import 'server-only'
import { cache } from 'react'
import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { SitePage } from '@/types'

export type { SitePage }

export const getSitePage = cache(async (slug: string): Promise<SitePage | null> => {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('site_pages')
    .select('id, slug, title, meta_description, content_html, updated_at')
    .eq('slug', slug)
    .single()
  return data ?? null
})

export async function getAllSitePages(): Promise<SitePage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_pages')
    .select('id, slug, title, meta_description, content_html, updated_at')
    .order('slug')
  return data ?? []
}

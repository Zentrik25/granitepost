import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}

// Wrapped with React.cache so multiple callers within the same request
// (public layout + getCategoryBlocks on the homepage) share one DB hit.
export const getTopLevelCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('display_order', { ascending: true })

  return data ?? []
})
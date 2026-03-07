import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/types'

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  return data ?? []
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}

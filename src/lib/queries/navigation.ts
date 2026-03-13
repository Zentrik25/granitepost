import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/server'

export interface NavChild {
  id: string
  name: string
  slug: string
}

export interface NavCategory {
  id: string
  name: string
  slug: string
  children: NavChild[]
}

export const getNavigationCategories = cache(async (): Promise<NavCategory[]> => {
  const supabase = createPublicClient()

  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, display_order, is_active')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const all = data ?? []
  const topLevel = all.filter((c) => c.parent_id === null)

  return topLevel.map((parent) => ({
    id: parent.id,
    name: parent.name,
    slug: parent.slug,
    children: all
      .filter((c) => c.parent_id === parent.id)
      .map((child) => ({ id: child.id, name: child.name, slug: child.slug })),
  }))
})

import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

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

/**
 * Returns top-level active categories, each with nested subcategories.
 * Wrapped with React.cache — one DB round-trip per request regardless
 * of how many components call this function.
 *
 * Shape:
 * [
 *   { id, name: "Politics", slug: "politics", children: [
 *       { id, name: "Elections", slug: "elections" },
 *       ...
 *   ]},
 *   ...
 * ]
 */
export const getNavigationCategories = cache(async (): Promise<NavCategory[]> => {
  const supabase = await createClient()

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

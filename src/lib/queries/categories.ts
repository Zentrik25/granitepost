import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Category, CategoryWithChildren } from '@/types'

// ── Single-category lookups ───────────────────────────────────────────────────

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Category
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Category
}

// ── Flat lists ────────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (data ?? []) as Category[]
}

/**
 * Top-level categories only (parent_id IS NULL), ordered by display_order.
 * Wrapped with React.cache — one DB hit per request regardless of how
 * many components call this (homepage + layout share the result).
 */
export const getTopLevelCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (data ?? []) as Category[]
})

// ── Tree / hierarchy ──────────────────────────────────────────────────────────

/**
 * Returns all active categories structured as a tree of CategoryWithChildren.
 * One DB query, assembled in-memory. Suitable for admin UIs and sitemaps.
 * Cached per request via React.cache.
 */
export const getCategoriesTree = cache(async (): Promise<CategoryWithChildren[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const all = (data ?? []) as Category[]
  const topLevel = all.filter((c) => !c.parent_id)

  return topLevel.map((parent) => ({
    ...parent,
    children: all.filter((c) => c.parent_id === parent.id),
  }))
})

/**
 * Fetch direct children of a given parent category by parent slug.
 * Returns an empty array if the slug doesn't exist or has no children.
 */
export async function getSubcategoriesByParent(
  parentSlug: string
): Promise<Category[]> {
  const supabase = await createClient()

  const { data: parent } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', parentSlug)
    .single()

  if (!parent) return []

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parent.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (data ?? []) as Category[]
}

/**
 * Fetch direct children by parent UUID.
 * Use when you already have the parent's id to avoid an extra slug lookup.
 */
export async function getSubcategoriesByParentId(
  parentId: string
): Promise<Category[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (data ?? []) as Category[]
}

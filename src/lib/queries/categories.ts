import 'server-only'
import { cache } from 'react'
import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { Category, CategoryWithChildren } from '@/types'

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (error || !data) return null
  return data as Category
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Category
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true })
  return (data ?? []) as Category[]
}

export const getTopLevelCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient()
  const { data } = await supabase.from('categories').select('*').is('parent_id', null).eq('is_active', true).order('display_order', { ascending: true })
  return (data ?? []) as Category[]
})

export const getCategoriesTree = cache(async (): Promise<CategoryWithChildren[]> => {
  const supabase = createPublicClient()
  const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true })
  const all = (data ?? []) as Category[]
  const topLevel = all.filter((c) => !c.parent_id)
  return topLevel.map((parent) => ({
    ...parent,
    children: all.filter((c) => c.parent_id === parent.id),
  }))
})

export async function getSubcategoriesByParent(parentSlug: string): Promise<Category[]> {
  const supabase = createPublicClient()
  const { data: parent } = await supabase.from('categories').select('id').eq('slug', parentSlug).single()
  if (!parent) return []
  const { data } = await supabase.from('categories').select('*').eq('parent_id', parent.id).eq('is_active', true).order('display_order', { ascending: true })
  return (data ?? []) as Category[]
}

export async function getSubcategoriesByParentId(parentId: string): Promise<Category[]> {
  const supabase = createPublicClient()
  const { data } = await supabase.from('categories').select('*').eq('parent_id', parentId).eq('is_active', true).order('display_order', { ascending: true })
  return (data ?? []) as Category[]
}

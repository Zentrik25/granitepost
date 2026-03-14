import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Article } from '@/types'
import type { PaginatedResult } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminArticleListRow {
  id: string
  title: string
  slug: string
  status: string
  featured_rank: number | null
  published_at: string | null
  updated_at: string
  category: { id: string; name: string } | null
}

export interface CategoryOption {
  id: string
  name: string
  parent_id: string | null
}

export interface TagOption {
  id: string
  name: string
}

export interface AuthorOption {
  id: string
  full_name: string | null
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Fetch a single article by id for admin editing. No published filter. */
export async function getArticleForEdit(id: string): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Article
}

/** Fetch tag IDs currently associated with an article. */
export async function getArticleTagIds(articleId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('article_tags')
    .select('tag_id')
    .eq('article_id', articleId)
  return (data ?? []).map((r) => r.tag_id)
}

/** All categories, ordered by display_order then name, for form dropdowns. */
export async function getCategoriesForForm(): Promise<CategoryOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  return (data ?? []) as CategoryOption[]
}

/** All profiles ordered by name, for author assignment dropdown. */
export async function getAuthorsForForm(): Promise<AuthorOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')
  return (data ?? []) as AuthorOption[]
}

/** All tags, ordered by name, for form selection. */
export async function getTagsForForm(): Promise<TagOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tags')
    .select('id, name')
    .order('name')
  return (data ?? []) as TagOption[]
}

/** Paginated article list for admin index. */
export async function getArticlesForAdmin(
  page = 1,
  limit = 20
): Promise<PaginatedResult<AdminArticleListRow>> {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('articles')
    .select(
      'id, title, slug, status, featured_rank, published_at, updated_at, category:categories(id, name)',
      { count: 'exact' }
    )
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], total: 0, page, limit, hasMore: false }

  const total = count ?? 0
  return {
    data: (data ?? []) as unknown as AdminArticleListRow[],
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

/** Sync article_tags for an article — delete existing, insert fresh. */
export async function syncArticleTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleId: string,
  tagIds: string[]
): Promise<void> {
  await supabase.from('article_tags').delete().eq('article_id', articleId)
  if (tagIds.length > 0) {
    await supabase
      .from('article_tags')
      .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })))
  }
}

function slugifyTag(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Find-or-create tags by name, then sync article_tags. */
export async function syncArticleTagsByNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleId: string,
  tagNamesRaw: string
): Promise<void> {
  const names = tagNamesRaw
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)

  if (names.length === 0) {
    await supabase.from('article_tags').delete().eq('article_id', articleId)
    return
  }

  const tagIds: string[] = []

  for (const name of names) {
    const slug = slugifyTag(name)
    if (!slug) continue

    // Try to find existing tag
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      tagIds.push(existing.id)
    } else {
      // Create new tag
      const { data: created } = await supabase
        .from('tags')
        .insert({ name, slug })
        .select('id')
        .single()
      if (created) tagIds.push(created.id)
    }
  }

  await supabase.from('article_tags').delete().eq('article_id', articleId)
  if (tagIds.length > 0) {
    await supabase
      .from('article_tags')
      .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })))
  }
}

/** Fetch tag names for an article as a comma-separated string. */
export async function getArticleTagNames(articleId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('article_tags')
    .select('tag:tags(name)')
    .eq('article_id', articleId)
  const names = (data ?? [])
    .map((r) => (r.tag as unknown as { name: string } | null)?.name)
    .filter(Boolean) as string[]
  return names.join(', ')
}

export interface TopStorySlot {
  rank: number
  articleId: string | null
  title: string | null
}

/** Returns all 6 top story slots with current occupancy. */
export async function getTopStorySlots(excludeArticleId?: string): Promise<TopStorySlot[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, top_story_rank')
    .not('top_story_rank', 'is', null)
    .eq('status', 'PUBLISHED')

  const occupied = new Map<number, { id: string; title: string }>()
  for (const row of data ?? []) {
    if (row.top_story_rank != null) {
      occupied.set(row.top_story_rank, { id: row.id, title: row.title })
    }
  }

  return [1, 2, 3, 4, 5, 6].map((rank) => {
    const occupant = occupied.get(rank)
    // treat as empty if occupied by the article currently being edited
    if (occupant && occupant.id === excludeArticleId) {
      return { rank, articleId: null, title: null }
    }
    return {
      rank,
      articleId: occupant?.id ?? null,
      title: occupant?.title ?? null,
    }
  })
}

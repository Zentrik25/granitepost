import 'server-only'
import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { ArticleWithRelations, MostReadArticle, PaginatedResult } from '@/types'

export const ARTICLE_SELECT = `
  id, title, slug, excerpt, body_html, status,
  hero_image_url, hero_image_alt, hero_image_caption, hero_image_credit,
  og_title, og_description, og_image_url, canonical_url,
  is_breaking, breaking_expires_at, featured_rank, is_featured, top_story_rank, view_count,
  published_at, created_at, updated_at,
  category:categories(id, name, slug),
  author:profiles(id, full_name, avatar_url, slug, title),
  tags:article_tags(tag:tags(id, name, slug, created_at))
`

function normaliseArticle(raw: Record<string, unknown>): ArticleWithRelations {
  const tags = (raw.tags as Array<{ tag: { id: string; name: string; slug: string; created_at: string } }> | null) ?? []
  return {
    ...(raw as unknown as ArticleWithRelations),
    tags: tags.map((t) => t.tag),
  }
}

// ── Public queries ────────────────────────────────────────────────────────────

export async function getPublishedArticleBySlug(
  slug: string
): Promise<ArticleWithRelations | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .single()

  if (error || !data) return null
  return normaliseArticle(data as unknown as Record<string, unknown>)
}

export async function getHeroArticle(): Promise<ArticleWithRelations | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .not('featured_rank', 'is', null)
    .order('featured_rank', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null
  return normaliseArticle(data as unknown as Record<string, unknown>)
}

/**
 * Returns up to `limit` PUBLISHED articles where is_featured = true,
 * ordered by published_at DESC. Returns empty array if none are featured —
 * never auto-fills with latest articles.
 */
export async function getFeaturedArticles(
  limit = 4
): Promise<ArticleWithRelations[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!data || data.length === 0) return []
  return data.map((d) => normaliseArticle(d as unknown as Record<string, unknown>))
}

export async function getBreakingNews(): Promise<ArticleWithRelations[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('is_breaking', true)
    .order('published_at', { ascending: false })
    .limit(5)

  return (data ?? []).map((d) =>
    normaliseArticle(d as unknown as Record<string, unknown>)
  )
}

export async function getTrendingArticles(limit = 6): Promise<ArticleWithRelations[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .order('view_count', { ascending: false })
    .limit(limit)

  return (data ?? []).map((d) => normaliseArticle(d as unknown as Record<string, unknown>))
}

export async function getTopStories(limit = 6): Promise<ArticleWithRelations[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .not('top_story_rank', 'is', null)
    .order('top_story_rank', { ascending: true })
    .limit(limit)

  return (data ?? []).map((d) => normaliseArticle(d as unknown as Record<string, unknown>))
}

export async function getLatestArticles(
  page = 1,
  limit = 12
): Promise<PaginatedResult<ArticleWithRelations>> {
  const supabase = createPublicClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], total: 0, page, limit, hasMore: false }

  const total = count ?? 0
  return {
    data: (data ?? []).map((d) =>
      normaliseArticle(d as unknown as Record<string, unknown>)
    ),
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

export async function getArticlesByCategory(
  categorySlug: string,
  page = 1,
  limit = 12
): Promise<PaginatedResult<ArticleWithRelations>> {
  const supabase = createPublicClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Resolve category
  const { data: cat } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('slug', categorySlug)
    .single()

  if (!cat) return { data: [], total: 0, page, limit, hasMore: false }

  // For a top-level (parent) category, include articles from all its children
  // so the page shows a unified feed without editors having to re-categorise.
  let categoryIds: string[] = [cat.id]
  if (!cat.parent_id) {
    const { data: children } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', cat.id)
    if (children?.length) {
      categoryIds = [cat.id, ...children.map((c) => c.id)]
    }
  }

  const { data, count, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .in('category_id', categoryIds)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], total: 0, page, limit, hasMore: false }

  const total = count ?? 0
  return {
    data: (data ?? []).map((d) =>
      normaliseArticle(d as unknown as Record<string, unknown>)
    ),
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

/**
 * Like getArticlesByCategory but takes the category UUID directly.
 * Used by getCategoryBlocks which already has category objects from
 * getTopLevelCategories — avoids a redundant slug-to-id resolve query.
 */
export async function getArticlesByCategoryId(
  categoryId: string,
  page = 1,
  limit = 12
): Promise<PaginatedResult<ArticleWithRelations>> {
  const supabase = createPublicClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], total: 0, page, limit, hasMore: false }

  const total = count ?? 0
  return {
    data: (data ?? []).map((d) =>
      normaliseArticle(d as unknown as Record<string, unknown>)
    ),
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

export async function getArticlesByTag(
  tagSlug: string,
  page = 1,
  limit = 12
): Promise<PaginatedResult<ArticleWithRelations>> {
  const supabase = createPublicClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: tag } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', tagSlug)
    .single()

  if (!tag) return { data: [], total: 0, page, limit, hasMore: false }

  const { data: articleTags, count } = await supabase
    .from('article_tags')
    .select('article_id', { count: 'exact' })
    .eq('tag_id', tag.id)
    .range(from, to)

  if (!articleTags?.length) return { data: [], total: 0, page, limit, hasMore: false }

  const ids = articleTags.map((at) => at.article_id)
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .in('id', ids)
    .order('published_at', { ascending: false })

  const total = count ?? 0
  return {
    data: (data ?? []).map((d) =>
      normaliseArticle(d as unknown as Record<string, unknown>)
    ),
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string | null,
  limit = 4
): Promise<ArticleWithRelations[]> {
  const supabase = createPublicClient()

  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .neq('id', articleId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data } = await query
  return (data ?? []).map((d) =>
    normaliseArticle(d as unknown as Record<string, unknown>)
  )
}

export async function searchArticles(
  q: string,
  page = 1,
  limit = 12
): Promise<PaginatedResult<ArticleWithRelations>> {
  const supabase = createPublicClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], total: 0, page, limit, hasMore: false }

  const total = count ?? 0
  return {
    data: (data ?? []).map((d) =>
      normaliseArticle(d as unknown as Record<string, unknown>)
    ),
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function getAllArticlesAdmin(
  page = 1,
  limit = 20
): Promise<PaginatedResult<ArticleWithRelations>> {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], total: 0, page, limit, hasMore: false }

  const total = count ?? 0
  return {
    data: (data ?? []).map((d) =>
      normaliseArticle(d as unknown as Record<string, unknown>)
    ),
    total,
    page,
    limit,
    hasMore: from + limit < total,
  }
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getMostRead24h(limit = 5): Promise<MostReadArticle[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.rpc('most_read_24h', { p_limit: limit })
  if (error) return []
  return data as MostReadArticle[]
}

export async function getMostRead7d(limit = 10): Promise<MostReadArticle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('most_read_7d', { p_limit: limit })
  if (error) return []
  return data as MostReadArticle[]
}
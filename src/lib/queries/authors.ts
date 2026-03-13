import 'server-only'
import { createPublicClient } from '@/lib/supabase/server'
import type { ArticleWithRelations, PaginatedResult } from '@/types'
import { ARTICLE_SELECT } from './articles'

export interface AuthorProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  twitter_handle: string | null
  slug: string | null
  title: string | null
}

function normaliseArticle(raw: Record<string, unknown>): ArticleWithRelations {
  const tags =
    (raw.tags as Array<{
      tag: { id: string; name: string; slug: string; created_at: string }
    }> | null) ?? []
  return {
    ...(raw as unknown as ArticleWithRelations),
    tags: tags.map((t) => t.tag),
  }
}

export async function getAuthorBySlug(
  slug: string
): Promise<AuthorProfile | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio, twitter_handle, slug, title')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as AuthorProfile
}

export async function getArticlesByAuthor(
  authorId: string,
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
    .eq('author_id', authorId)
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

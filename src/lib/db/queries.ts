/**
 * src/lib/db/queries.ts
 *
 * Unified public query layer. Re-exports canonical implementations from
 * src/lib/queries/ and adds composite homepage queries that span
 * multiple tables (getCategoryBlocks, getLatestFeed).
 */

import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ArticleWithRelations, Category } from '@/types'
import { getTopLevelCategories } from '@/lib/queries/categories'
import { getArticlesByCategoryId, ARTICLE_SELECT } from '@/lib/queries/articles'

// ── Re-exports with conventional names ───────────────────────────────────────

export {
  getPublishedArticleBySlug as getArticleBySlug,
  getRelatedArticles        as getRelatedStories,
  getMostRead24h            as getMostReadArticles,
  getTopStories,
  getLatestArticles,
  getBreakingNews,
  getHeroArticle,
  getFeaturedArticles,
  getArticlesByCategory,
  getArticlesByTag,
  searchArticles,
  getAllArticlesAdmin,
  getMostRead7d,
  getTrendingArticles,
} from '@/lib/queries/articles'

export { getApprovedComments } from '@/lib/queries/comments'

export { getTopLevelCategories, getCategoryBySlug, getAllCategories } from '@/lib/queries/categories'

// ── Shared types ──────────────────────────────────────────────────────────────

export type HomepageArticle = ArticleWithRelations

export interface CategoryBlockData {
  category: Category
  articles: ArticleWithRelations[]
}

// ── Composite homepage queries ────────────────────────────────────────────────

/**
 * Returns the first `categoryLimit` active top-level categories, each populated
 * with up to `limitPerCategory` published articles, ordered by recency.
 *
 * Uses getArticlesByCategoryId (no slug-to-id round-trip) because we already
 * have the category object from getTopLevelCategories.
 * getTopLevelCategories is wrapped with React.cache so calling it here costs
 * nothing when the public layout already called it in the same render.
 * Categories with zero published articles are omitted.
 *
 * @param excludeSlugs - category slugs to skip (e.g. those with dedicated homepage sections)
 */
export async function getCategoryBlocks(
  limitPerCategory = 4,
  categoryLimit = 3,
  excludeSlugs: string[] = []
): Promise<CategoryBlockData[]> {
  const categories = await getTopLevelCategories()

  const blocks = await Promise.all(
    categories
      .filter((c) => c.is_active && !excludeSlugs.includes(c.slug))
      .slice(0, categoryLimit)
      .map(async (category): Promise<CategoryBlockData> => {
        // Pass category.id directly — avoids one slug-to-id query per category.
        const result = await getArticlesByCategoryId(category.id, 1, limitPerCategory)
        return { category, articles: result.data }
      })
  )

  return blocks.filter((b) => b.articles.length > 0)
}

/**
 * Returns the latest published articles, excluding any IDs already shown
 * elsewhere on the page. Sorted by published_at descending.
 */
export async function getLatestFeed(
  excludeIds: string[] = [],
  limit = 12
): Promise<ArticleWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data } = await query

  return (data ?? []).map((raw) => {
    const r = raw as unknown as Record<string, unknown>
    const tags =
      (r.tags as Array<{ tag: { id: string; name: string; slug: string; created_at: string } }> | null) ?? []
    return {
      ...(r as unknown as ArticleWithRelations),
      tags: tags.map((t) => t.tag),
    }
  })
}
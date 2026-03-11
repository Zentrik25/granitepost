export * from './database'
import type { Database } from './database'

export type Article = Database['public']['Tables']['articles']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']
export type SitePage = Database['public']['Tables']['site_pages']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']

// ── Shared article types ───────────────────────────────────────────────────────
export interface ArticleWithRelations {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  body_html?: string | null
  status?: string | null
  hero_image_url?: string | null
  hero_image_alt?: string | null
  hero_image_caption?: string | null
  hero_image_credit?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image_url?: string | null
  canonical_url?: string | null
  is_live?: boolean | null
  is_breaking?: boolean | null
  breaking_expires_at?: string | null
  featured_rank?: number | null
  is_featured?: boolean | null
  top_story_rank?: number | null
  view_count?: number | null
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  category?: { id: string; name: string; slug: string } | null
  author?: { id: string; full_name?: string | null; avatar_url?: string | null } | null
  tags?: { id: string; name: string; slug: string; created_at: string }[]
}

// ── Category ───────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  display_order?: number | null
  seo_title?: string | null
  seo_description?: string | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

/** A top-level category with its immediate children populated. */
export interface CategoryWithChildren extends Category {
  children: Category[]
}

export interface MostReadArticle {
  article_id: string
  slug: string
  title: string
}


// ── Page / component props ────────────────────────────────────────────────────
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ── Search ────────────────────────────────────────────────────────────────────
export interface SearchParams {
  query: string
  category?: string
  tag?: string
  page?: number
  limit?: number
}

// ── Navigation ────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export type CommentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SPAM'
  | 'DELETED'

export type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'MODERATOR'
// ── Supabase Database type ─────────────────────────────────────────────────
// Compatible with createServerClient<Database>() / createBrowserClient<Database>().
// Row types are re-exported as convenience aliases at the bottom of this file
// so the rest of the codebase does not need to change any imports.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          twitter_handle: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          twitter_handle?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: never[]
      }

      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database['public']['Enums']['user_role']
          granted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Database['public']['Enums']['user_role']
          granted_by?: string | null
          created_at?: string
        }
        Update: {
          role?: Database['public']['Enums']['user_role']
          granted_by?: string | null
        }
        Relationships: never[]
      }

      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          seo_title: string | null
          seo_description: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          seo_title?: string | null
          seo_description?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          seo_title?: string | null
          seo_description?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: never[]
      }

      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
        }
        Relationships: never[]
      }

      articles: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          body_html: string
          status: Database['public']['Enums']['article_status']
          category_id: string | null
          author_id: string
          hero_image_url: string | null
          hero_image_alt: string | null
          hero_image_caption: string | null
          hero_image_credit: string | null
          og_title: string | null
          og_description: string | null
          og_image_url: string | null
          canonical_url: string | null
          is_breaking: boolean
          breaking_expires_at: string | null
          featured_rank: number | null
          is_featured: boolean
          is_live: boolean
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          body_html?: string
          status?: Database['public']['Enums']['article_status']
          category_id?: string | null
          author_id: string
          hero_image_url?: string | null
          hero_image_alt?: string | null
          hero_image_caption?: string | null
          hero_image_credit?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          is_breaking?: boolean
          breaking_expires_at?: string | null
          featured_rank?: number | null
          is_featured?: boolean
          is_live?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          excerpt?: string | null
          body_html?: string
          status?: Database['public']['Enums']['article_status']
          category_id?: string | null
          hero_image_url?: string | null
          hero_image_alt?: string | null
          hero_image_caption?: string | null
          hero_image_credit?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          is_breaking?: boolean
          breaking_expires_at?: string | null
          featured_rank?: number | null
          is_featured?: boolean
          is_live?: boolean
          published_at?: string | null
          updated_at?: string
        }
        Relationships: never[]
      }

      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: never[]
      }

      media: {
        Row: {
          id: string
          filename: string
          storage_path: string
          url: string
          alt_text: string | null
          credit: string | null
          caption: string | null
          mime_type: string
          media_type: Database['public']['Enums']['media_type']
          width: number | null
          height: number | null
          size_bytes: number
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          storage_path: string
          url: string
          alt_text?: string | null
          credit?: string | null
          caption?: string | null
          mime_type: string
          media_type?: Database['public']['Enums']['media_type']
          width?: number | null
          height?: number | null
          size_bytes?: number
          uploaded_by: string
          created_at?: string
        }
        Update: {
          filename?: string
          alt_text?: string | null
          credit?: string | null
          caption?: string | null
          width?: number | null
          height?: number | null
        }
        Relationships: never[]
      }

      article_media: {
        Row: {
          id: string
          article_id: string
          media_id: string
          position: number
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          media_id: string
          position?: number
          role?: string
          created_at?: string
        }
        Update: {
          position?: number
          role?: string
        }
        Relationships: never[]
      }

      article_views_daily: {
        Row: {
          id: string
          article_id: string
          day: string
          view_count: number
        }
        Insert: {
          id?: string
          article_id: string
          day?: string
          view_count?: number
        }
        Update: {
          view_count?: number
        }
        Relationships: never[]
      }

      comments: {
        Row: {
          id: string
          article_id: string
          parent_id: string | null
          author_name: string
          author_email: string
          author_url: string | null
          body: string
          status: Database['public']['Enums']['comment_status']
          ip_hash: string | null
          user_agent_hash: string | null
          moderated_by: string | null
          moderated_at: string | null
          moderation_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          parent_id?: string | null
          author_name: string
          author_email: string
          author_url?: string | null
          body: string
          status?: Database['public']['Enums']['comment_status']
          ip_hash?: string | null
          user_agent_hash?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: Database['public']['Enums']['comment_status']
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          updated_at?: string
        }
        Relationships: never[]
      }

      comment_moderation_log: {
        Row: {
          id: string
          comment_id: string
          moderator_id: string | null
          action: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          moderator_id?: string | null
          action: string
          note?: string | null
          created_at?: string
        }
        Update: never
        Relationships: never[]
      }

      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          confirmed: boolean
          confirmation_token: string | null
          confirmed_at: string | null
          unsubscribe_token: string
          source: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          confirmed?: boolean
          confirmation_token?: string | null
          confirmed_at?: string | null
          unsubscribe_token?: string
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed?: boolean
          confirmation_token?: string | null
          confirmed_at?: string | null
          unsubscribe_token?: string
          source?: string
          unsubscribed_at?: string | null
        }
        Relationships: never[]
      }

      site_settings: {
        Row: {
          key: string
          value: string
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          value?: string
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: never[]
      }

      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          target_table: string | null
          target_id: string | null
          old_values: Record<string, unknown> | null
          new_values: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          target_table?: string | null
          target_id?: string | null
          old_values?: Record<string, unknown> | null
          new_values?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: never
        Relationships: never[]
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      record_article_view: {
        Args: { p_article_id: string }
        Returns: void
      }
      most_read_24h: {
        // p_limit has a SQL default — pass a value or omit the second rpc() arg entirely
        Args: { p_limit: number }
        Returns: {
          article_id: string
          title: string
          slug: string
          hero_image_url: string | null
          total_views: number
        }[]
      }
      most_read_7d: {
        Args: { p_limit: number }
        Returns: {
          article_id: string
          title: string
          slug: string
          hero_image_url: string | null
          total_views: number
        }[]
      }
      views_series: {
        // Both params have SQL defaults — when passing any arg, all must be provided
        Args: { p_article_id: string; p_days: number }
        Returns: { day: string; view_count: number }[]
      }
      top_articles: {
        // SQL defaults: p_days=7, p_limit=20
        // To use defaults: supabase.rpc('top_articles') — no second arg
        // To override:    supabase.rpc('top_articles', { p_days: 30, p_limit: 10 })
        Args: { p_days: number; p_limit: number }
        Returns: {
          article_id: string
          title: string
          slug: string
          category_name: string | null
          hero_image_url: string | null
          total_views: number
          published_at: string | null
        }[]
      }
      insert_audit_log: {
        Args: {
          p_action: string
          p_target_table?: string
          p_target_id?: string
          p_old_values?: Record<string, unknown>
          p_new_values?: Record<string, unknown>
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: void
      }
      is_admin: { Args: Record<never, never>; Returns: boolean }
      is_editor: { Args: Record<never, never>; Returns: boolean }
      is_author: { Args: Record<never, never>; Returns: boolean }
      is_moderator: { Args: Record<never, never>; Returns: boolean }
      is_staff: { Args: Record<never, never>; Returns: boolean }
    }

    Enums: {
      user_role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'MODERATOR'
      article_status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'
      comment_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM' | 'DELETED'
      media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ── Convenience helpers ───────────────────────────────────────────────────────
type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

// ── Enum aliases ──────────────────────────────────────────────────────────────
export type UserRole = Enums['user_role']
export type ArticleStatus = Enums['article_status']
export type CommentStatus = Enums['comment_status']
export type MediaType = Enums['media_type']

// ── Row type aliases (drop-in replacements for the old interfaces) ─────────────
export type Profile = Tables['profiles']['Row']
export type UserRoleRecord = Tables['user_roles']['Row']
export type Category = Tables['categories']['Row']
export type Tag = Tables['tags']['Row']
export type Article = Tables['articles']['Row']
export type ArticleTag = Tables['article_tags']['Row']
export type Media = Tables['media']['Row']
export type ArticleMedia = Tables['article_media']['Row']
export type ArticleViewsDaily = Tables['article_views_daily']['Row']
export type Comment = Tables['comments']['Row']
export type CommentModerationLog = Tables['comment_moderation_log']['Row']
export type NewsletterSubscriber = Tables['newsletter_subscribers']['Row']
export type SiteSetting = Tables['site_settings']['Row']
export type AuditLog = Tables['audit_logs']['Row']

// ── Insert / Update aliases (for server actions and route handlers) ────────────
export type ArticleInsert = Tables['articles']['Insert']
export type ArticleUpdate = Tables['articles']['Update']
export type CategoryInsert = Tables['categories']['Insert']
export type CategoryUpdate = Tables['categories']['Update']
export type CommentInsert = Tables['comments']['Insert']
export type CommentUpdate = Tables['comments']['Update']
export type MediaInsert = Tables['media']['Insert']
export type NewsletterSubscriberInsert = Tables['newsletter_subscribers']['Insert']
export type SiteSettingInsert = Tables['site_settings']['Insert']

// ── Relational type ───────────────────────────────────────────────────────────
export interface ArticleWithRelations extends Article {
  category: Category | null
  author: Profile | null
  tags: Tag[]
}

// ── Analytics RPC return types ────────────────────────────────────────────────
export type MostReadArticle = Database['public']['Functions']['most_read_24h']['Returns'][number]
export type ViewsSeries = Database['public']['Functions']['views_series']['Returns'][number]
export type TopArticle = Database['public']['Functions']['top_articles']['Returns'][number]

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

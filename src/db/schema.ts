// TypeScript constants that mirror the Postgres schema.
// Use these for type-safe references to table/column names.
// Do NOT import this in client components.

export const TABLES = {
  PROFILES: 'profiles',
  USER_ROLES: 'user_roles',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  ARTICLES: 'articles',
  ARTICLE_TAGS: 'article_tags',
  MEDIA: 'media',
  ARTICLE_VIEWS_DAILY: 'article_views_daily',
  COMMENTS: 'comments',
  NEWSLETTER_SUBSCRIBERS: 'newsletter_subscribers',
  SITE_SETTINGS: 'site_settings',
  SITE_PAGES: 'site_pages',
  AUDIT_LOGS: 'audit_logs',
} as const

export const ARTICLE_STATUSES = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  AUTHOR: 'AUTHOR',
  MODERATOR: 'MODERATOR',
} as const

export const COMMENT_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SPAM: 'SPAM',
  DELETED: 'DELETED',
} as const

export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
} as const

export const RPC = {
  RECORD_ARTICLE_VIEW: 'record_article_view',
  MOST_READ_24H: 'most_read_24h',
  MOST_READ_7D: 'most_read_7d',
  VIEWS_SERIES: 'views_series',
  TOP_ARTICLES: 'top_articles',
  INSERT_AUDIT_LOG: 'insert_audit_log',
} as const

// Storage bucket names
export const STORAGE = {
  MEDIA: 'media',
} as const

// OG image constraints (for validation)
export const OG_IMAGE = {
  MIN_WIDTH: 1200,
  MIN_HEIGHT: 630,
  ASPECT_RATIO: '1.91:1',
} as const

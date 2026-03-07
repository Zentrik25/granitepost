// Shared validation rules for article data at system boundaries.
// Used by both API routes and admin form validation.

export const ARTICLE_VALIDATION = {
  title: { maxLength: 300, minLength: 5 },
  slug: { maxLength: 200, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  excerpt: { maxLength: 500 },
  body: { maxLength: 200_000 },
  ogTitle: { maxLength: 90 },
  ogDescription: { maxLength: 200 },
} as const

export function validateSlug(slug: string): string | null {
  if (!slug) return 'Slug is required.'
  if (slug.length > ARTICLE_VALIDATION.slug.maxLength) return 'Slug is too long.'
  if (!ARTICLE_VALIDATION.slug.pattern.test(slug)) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens.'
  }
  return null
}

export function validateArticleTitle(title: string): string | null {
  if (!title.trim()) return 'Title is required.'
  if (title.length < ARTICLE_VALIDATION.title.minLength) return 'Title is too short.'
  if (title.length > ARTICLE_VALIDATION.title.maxLength) return 'Title is too long.'
  return null
}

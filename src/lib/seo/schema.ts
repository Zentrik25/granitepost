/**
 * Schema.org JSON-LD builders.
 * Pure functions — no server-only imports, safe to call from any Server Component.
 */

import { SITE_URL, SITE_NAME } from '@/lib/constants'

// ── WebSite ───────────────────────────────────────────────────────────────────

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Breaking Zimbabwe news and in-depth coverage from The Granite Post',
    inLanguage: 'en-ZW',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  url: string
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ── NewsArticle ───────────────────────────────────────────────────────────────

export interface NewsArticleSchemaInput {
  headline: string
  description?: string | null
  url: string
  imageUrl?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authorName?: string | null
  sectionName?: string | null
  keywords?: string[]
  siteUrl: string
  siteName: string
}

export function buildNewsArticleSchema(input: NewsArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    description: input.description ?? undefined,
    // Google requires ImageObject array with width >= 1200px for rich results
    image: input.imageUrl
      ? [
          {
            '@type': 'ImageObject',
            url: input.imageUrl,
            width: 1200,
            height: 630,
          },
        ]
      : undefined,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? undefined,
    author: input.authorName
      ? [{ '@type': 'Person', name: input.authorName }]
      : undefined,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: input.siteName,
      url: input.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${input.siteUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.url,
    },
    articleSection: input.sectionName ?? undefined,
    keywords:
      input.keywords?.length ? input.keywords.join(', ') : undefined,
    inLanguage: 'en-ZW',
  }
}

// ── Person (for author pages) ─────────────────────────────────────────────────

export interface PersonSchemaInput {
  name: string
  url: string
  description?: string | null
  image?: string | null
  sameAs?: string[]
}

export function buildPersonSchema(input: PersonSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: input.url,
    description: input.description ?? undefined,
    image: input.image ?? undefined,
    sameAs: input.sameAs?.length ? input.sameAs : undefined,
  }
}

// ── WebPage (for listing pages) ───────────────────────────────────────────────

export function buildWebPageSchema(opts: {
  name: string
  url: string
  description?: string | null
  siteUrl: string
  siteName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    url: opts.url,
    description: opts.description ?? undefined,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: opts.siteName,
      url: opts.siteUrl,
    },
    inLanguage: 'en-ZW',
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Serialise a schema object to the string used in dangerouslySetInnerHTML. */
export function toJsonLd(schema: object): string {
  return JSON.stringify(schema)
}
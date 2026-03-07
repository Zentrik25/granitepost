import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // Regenerate every hour

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [articles, categories, tags] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(1000),
    supabase.from('categories').select('slug, updated_at'),
    supabase.from('tags').select('slug, created_at'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ]

  const articleRoutes: MetadataRoute.Sitemap = (articles.data ?? []).map((a) => ({
    url: `${siteUrl}/article/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = (categories.data ?? []).map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }))

  const tagRoutes: MetadataRoute.Sitemap = (tags.data ?? []).map((t) => ({
    url: `${siteUrl}/tag/${t.slug}`,
    lastModified: new Date(t.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }))

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...tagRoutes]
}

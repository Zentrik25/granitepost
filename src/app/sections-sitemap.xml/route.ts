import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

// Categories + tags — revalidate every 24 hours
export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.thegranite.co.zw'

export async function GET() {
  const supabase = createPublicClient()

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('tags')
      .select('slug')
      .order('name', { ascending: true }),
  ])

  const categoryUrls = (categories ?? [])
    .map(
      (c) => `
  <url>
    <loc>${siteUrl}/category/${c.slug}</loc>
    <lastmod>${c.updated_at}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n')

  const tagUrls = (tags ?? [])
    .map(
      (t) => `
  <url>
    <loc>${siteUrl}/tag/${t.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categoryUrls}
${tagUrls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  })
}

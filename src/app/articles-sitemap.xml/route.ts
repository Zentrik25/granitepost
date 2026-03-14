import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

// All published articles — revalidate every hour
export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.thegranite.co.zw'

export async function GET() {
  const supabase = createPublicClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, updated_at')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(50000)

  const urls = (articles ?? [])
    .map((a) => {
      const lastmod = a.updated_at ?? a.published_at
      return `
  <url>
    <loc>${siteUrl}/article/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

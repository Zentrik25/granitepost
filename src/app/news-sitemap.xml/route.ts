import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Google News sitemap — last 48 hours only
export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

export async function GET() {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, published_at')
    .eq('status', 'PUBLISHED')
    .gte('published_at', cutoff)
    .order('published_at', { ascending: false })
    .limit(1000)

  const urls = (articles ?? [])
    .map(
      (a) => `
  <url>
    <loc>${siteUrl}/article/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.published_at}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
    </news:news>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

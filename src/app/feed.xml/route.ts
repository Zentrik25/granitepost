import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, excerpt, published_at, hero_image_url, category:categories(name)')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (articles ?? [])
    .map((a) => {
      const category = (a.category as unknown as { name: string } | null)?.name ?? ''
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${siteUrl}/article/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/article/${a.slug}</guid>
      <pubDate>${new Date(a.published_at ?? '').toUTCString()}</pubDate>
      ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
      ${category ? `<category>${escapeXml(category)}</category>` : ''}
      ${a.hero_image_url ? `<enclosure url="${a.hero_image_url}" type="image/jpeg" length="0"/>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>Breaking news and in-depth coverage from Zimbabwe and across Africa.</description>
    <language>en-zw</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

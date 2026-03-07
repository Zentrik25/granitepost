import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'
const siteEmail = process.env.NEXT_PUBLIC_SITE_EMAIL ?? `editor@${new URL(siteUrl).hostname}`

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
    .select(`
      title, slug, excerpt, published_at, hero_image_url,
      category:categories(name),
      author:profiles(full_name)
    `)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (articles ?? [])
    .map((a) => {
      const category = (a.category as unknown as { name: string } | null)?.name ?? ''
      const authorName = (a.author as unknown as { full_name: string } | null)?.full_name ?? ''
      const pubDate = new Date(a.published_at ?? '').toUTCString()
      const link = `${siteUrl}/article/${a.slug}`
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
      ${category ? `<category>${escapeXml(category)}</category>` : ''}
      ${authorName ? `<dc:creator>${escapeXml(authorName)}</dc:creator>` : ''}
      ${a.hero_image_url ? `<media:content url="${a.hero_image_url}" medium="image" width="1200" height="675"/>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>Breaking news and in-depth coverage from Zimbabwe and across Africa.</description>
    <language>en-zw</language>
    <managingEditor>${siteEmail} (${siteName})</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>${escapeXml(siteName)}</title>
      <link>${siteUrl}</link>
    </image>
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

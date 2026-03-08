import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSitePage } from '@/lib/queries/site-pages'

// Only serve slugs that are managed in site_pages
const KNOWN_SLUGS = new Set([
  'about',
  'contact',
  'editorial-policy',
  'corrections',
  'ownership',
  'privacy-policy',
  'terms-of-use',
])

interface Props {
  params: Promise<{ page: string }>
}

export const revalidate = 3600 // 1 hour ISR

export async function generateStaticParams() {
  return [...KNOWN_SLUGS].map((slug) => ({ page: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: slug } = await params
  if (!KNOWN_SLUGS.has(slug)) return {}

  const sitePageData = await getSitePage(slug)
  if (!sitePageData) return {}

  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${slug}`

  return {
    title: sitePageData.title,
    description: sitePageData.meta_description ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: sitePageData.title,
      description: sitePageData.meta_description ?? undefined,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function SiteStaticPage({ params }: Props) {
  const { page: slug } = await params

  // Reject unknown slugs before hitting the DB
  if (!KNOWN_SLUGS.has(slug)) notFound()

  const sitePageData = await getSitePage(slug)
  if (!sitePageData) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8 pb-4 border-b-2 border-brand-ink">
        <h1 className="text-3xl md:text-4xl font-black text-brand-primary leading-tight">
          {sitePageData.title}
        </h1>
        {sitePageData.meta_description && (
          <p className="text-brand-muted mt-2 text-base leading-relaxed">
            {sitePageData.meta_description}
          </p>
        )}
      </header>

      <article
        className="
          prose prose-sm md:prose-base max-w-none
          prose-headings:font-bold prose-headings:text-brand-primary prose-headings:leading-tight
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-brand-secondary prose-p:leading-relaxed prose-p:my-4
          prose-a:text-amber-700 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-amber-900
          prose-strong:text-brand-primary
          prose-ul:my-4 prose-ul:pl-6 prose-ul:list-disc
          prose-ol:my-4 prose-ol:pl-6 prose-ol:list-decimal
          prose-li:my-1 prose-li:text-brand-secondary
          prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-brand-muted
          prose-hr:border-brand-border prose-hr:my-8
        "
        dangerouslySetInnerHTML={{ __html: sitePageData.content_html }}
      />

      <footer className="mt-10 pt-6 border-t border-brand-border text-xs text-brand-muted">
        Last updated:{' '}
        <time dateTime={sitePageData.updated_at}>
          {new Date(sitePageData.updated_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </footer>
    </div>
  )
}

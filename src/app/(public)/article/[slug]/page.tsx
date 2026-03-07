import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
  getMostRead24h,
} from '@/lib/queries/articles'
import { getApprovedComments } from '@/lib/queries/comments'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { MostReadList } from '@/components/home/MostReadList'
import { CommentList } from '@/components/article/CommentList'
import { CommentForm } from '@/components/article/CommentForm'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { formatDatetime, formatDate } from '@/lib/utils/slug'
import { ViewTracker } from '@/components/article/ViewTracker'

export const revalidate = 300 // 5 min ISR

interface Props {
  params: Promise<{ slug: string }>
}

// React.cache memoises per render-pass so generateMetadata and the page
// component share a single DB hit instead of two identical queries.
const getArticle = cache(getPublishedArticleBySlug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

  const title = article.og_title ?? article.title
  const description = article.og_description ?? article.excerpt ?? ''
  const ogImage = article.og_image_url ?? article.hero_image_url ?? undefined
  const url = `${siteUrl}/article/${article.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : [],
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      authors: article.author?.full_name ? [article.author.full_name] : [],
      section: article.category?.name,
      tags: article.tags.map((t) => t.name),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  // getArticle is memoised — reuses the result already fetched by generateMetadata.
  const [article, mostRead] = await Promise.all([
    getArticle(slug),
    getMostRead24h(5),
  ])

  if (!article) notFound()

  const [related, comments] = await Promise.all([
    getRelatedArticles(article.id, article.category_id, 4),
    getApprovedComments(article.id),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
  const articleUrl = `${siteUrl}/article/${article.slug}`

  // JSON-LD NewsArticle structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.hero_image_url
      ? [article.hero_image_url]
      : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author?.full_name
      ? [{ '@type': 'Person', name: article.author.full_name }]
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online',
      url: siteUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    articleSection: article.category?.name,
    keywords: article.tags.map((t) => t.name).join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Track view (client component, fires once) */}
      <ViewTracker articleId={article.id} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── Article ─────────────────────────────────────────────────── */}
          <article className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs text-brand-muted mb-4">
              <Link href="/" className="hover:underline">Home</Link>
              {article.category && (
                <>
                  <span className="mx-1">/</span>
                  <Link
                    href={`/category/${article.category.slug}`}
                    className="hover:underline"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
            </nav>

            {/* Category label */}
            {article.category && (
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-block text-xs font-bold bg-granite-primary text-white px-2 py-0.5 uppercase tracking-wide mb-3 hover:bg-granite-dark"
              >
                {article.category.name}
              </Link>
            )}

            <h1 className="text-2xl md:text-4xl font-black leading-tight mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-brand-muted font-serif leading-relaxed mb-4 border-l-4 border-granite-accent pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-muted mb-6 pb-4 border-b border-brand-border">
              {article.author?.full_name && (
                <span>By <strong className="text-brand-dark">{article.author.full_name}</strong></span>
              )}
              {article.published_at && (
                <time dateTime={article.published_at}>
                  Published {formatDatetime(article.published_at)}
                </time>
              )}
              {article.updated_at !== article.published_at && (
                <time dateTime={article.updated_at} className="italic">
                  Updated {formatDate(article.updated_at)}
                </time>
              )}
            </div>

            {/* Hero image */}
            {article.hero_image_url && (
              <figure className="mb-6">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={article.hero_image_url}
                    alt={article.hero_image_alt ?? article.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 75vw"
                  />
                </div>
                {article.hero_image_caption && (
                  <figcaption className="text-xs text-brand-muted mt-2 italic">
                    {article.hero_image_caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Article body */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.body_html }}
            />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-brand-border">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-muted mr-2">Tags:</span>
                <div className="inline-flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="text-xs px-3 py-1 rounded-full bg-granite-muted hover:bg-granite-primary hover:text-white transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <section aria-label="Related articles" className="mt-10">
                <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-granite-primary pb-2 mb-4">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {related.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <CommentList comments={comments} />
            <CommentForm articleId={article.id} />
          </article>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <MostReadList articles={mostRead} />
              <NewsletterForm />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
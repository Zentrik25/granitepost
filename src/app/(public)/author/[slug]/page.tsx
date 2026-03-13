import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAuthorBySlug, getArticlesByAuthor } from '@/lib/queries/authors'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { buildPersonSchema, buildBreadcrumbSchema, toJsonLd } from '@/lib/seo/schema'
import { createPublicClient } from '@/lib/supabase/server'

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * Pre-build author pages for all profiles that have a slug set.
 */
export async function generateStaticParams() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('profiles')
    .select('slug')
    .not('slug', 'is', null)

  if (!data) return []
  return data
    .filter((p): p is { slug: string } => typeof p.slug === 'string')
    .map((p) => ({ slug: p.slug }))
}

const getAuthor = cache(getAuthorBySlug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) return {}

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

  const name = author.full_name ?? slug
  const title = `${name} — ${siteName}`
  const description = author.bio ?? `Read articles by ${name} on ${siteName}.`
  const url = `${siteUrl}/author/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      title,
      description,
      siteName,
      images: author.avatar_url
        ? [{ url: author.avatar_url, width: 400, height: 400, alt: name }]
        : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: author.avatar_url ? [author.avatar_url] : [],
    },
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()

  const { data: articles } = await getArticlesByAuthor(author.id, 1, 18)

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

  const authorUrl = `${siteUrl}/author/${slug}`
  const name = author.full_name ?? slug

  const personSchema = buildPersonSchema({
    name,
    url: authorUrl,
    description: author.bio,
    image: author.avatar_url,
    sameAs: author.twitter_handle
      ? [`https://twitter.com/${author.twitter_handle.replace(/^@/, '')}`]
      : [],
  })

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: name, url: authorUrl },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Author profile header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-8 border-b border-brand-border">
          {author.avatar_url && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={author.avatar_url}
                alt={name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black leading-tight mb-1">
              {name}
            </h1>

            {author.title && (
              <p className="text-sm font-semibold text-brand-muted mb-2">
                {author.title}
              </p>
            )}

            {author.bio && (
              <p className="text-sm leading-relaxed text-gray-700 max-w-2xl mb-3">
                {author.bio}
              </p>
            )}

            {author.twitter_handle && (
              <Link
                href={`https://twitter.com/${author.twitter_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-500"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @{author.twitter_handle.replace(/^@/, '')}
              </Link>
            )}
          </div>
        </div>

        {/* Articles grid */}
        {articles.length > 0 ? (
          <section aria-label={`Articles by ${name}`}>
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
              Articles by {name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-sm text-brand-muted">No published articles yet.</p>
        )}
      </div>
    </>
  )
}

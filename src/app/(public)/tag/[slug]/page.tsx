import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { getTagBySlug } from '@/lib/queries/tags'
import { getArticlesByTag } from '@/lib/queries/articles'
import { buildBreadcrumbSchema, buildWebPageSchema, toJsonLd } from '@/lib/seo/schema'

export const revalidate = 120

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return {}

  const url = `${siteUrl}/tag/${slug}`
  const title = `#${tag.name}`
  const description = `Articles tagged with ${tag.name} on Zimbabwe News Online.`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))

  const [tag, result] = await Promise.all([
    getTagBySlug(slug),
    getArticlesByTag(slug, page, 12),
  ])

  if (!tag) notFound()

  const tagUrl = `${siteUrl}/tag/${slug}`
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: `#${tag.name}`, url: tagUrl },
  ])
  const webPageSchema = buildWebPageSchema({
    name: `#${tag.name}`,
    url: tagUrl,
    description: `Articles tagged with ${tag.name}.`,
    siteUrl,
    siteName,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(webPageSchema) }} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="border-b-2 border-granite-primary mb-6 pb-3">
          <h1 className="text-2xl md:text-3xl font-black">#{tag.name}</h1>
          <p className="text-brand-muted text-sm mt-1">{result.total} articles</p>
        </div>

        {result.data.length === 0 ? (
          <EmptyState
            title="No articles with this tag yet"
            description="Check back soon or browse other topics."
            action={{ label: 'Back to home', href: '/' }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          hasMore={result.hasMore}
          buildHref={(p) => `/tag/${slug}?page=${p}`}
        />
      </div>
    </>
  )
}

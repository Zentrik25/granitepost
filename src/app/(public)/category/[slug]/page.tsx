import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getArticlesByCategory } from '@/lib/queries/articles'
import type { ArticleWithRelations } from '@/types'
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
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  const url = `${siteUrl}/category/${slug}`
  const title = category.name
  const description = category.description ?? `Latest ${category.name} news from Zimbabwe.`

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

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))

  const [category, result] = await Promise.all([
    getCategoryBySlug(slug),
    getArticlesByCategory(slug, page, 12),
  ])

  if (!category) notFound()

  const categoryUrl = `${siteUrl}/category/${slug}`
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: category.name, url: categoryUrl },
  ])
  const webPageSchema = buildWebPageSchema({
    name: category.name,
    url: categoryUrl,
    description: category.description,
    siteUrl,
    siteName,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(webPageSchema) }} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="border-b-2 border-granite-primary mb-6 pb-3">
          <h1 className="text-2xl md:text-3xl font-black">{category.name}</h1>
          {category.description && (
            <p className="text-brand-muted text-sm mt-1">{category.description}</p>
          )}
        </div>

        {result.data.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description={`There are no published articles in ${category.name} yet. Check back soon.`}
            action={{ label: 'Back to home', href: '/' }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(result.data as ArticleWithRelations[]).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}

          </div>

        )}

        <Pagination
          page={page}
          hasMore={result.hasMore}
          buildHref={(p) => `/category/${slug}?page=${p}`}
        />
      </div>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { getTagBySlug } from '@/lib/queries/tags'
import { getArticlesByTag } from '@/lib/queries/articles'

export const revalidate = 120

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return {}
  return {
    title: `#${tag.name}`,
    description: `Articles tagged with ${tag.name} on Zimbabwe News Online.`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="border-b-2 border-brand-red mb-6 pb-3">
        <h1 className="text-2xl md:text-3xl font-black">#{tag.name}</h1>
        <p className="text-brand-muted text-sm mt-1">{result.total} articles</p>
      </div>

      {result.data.length === 0 ? (
        <p className="text-brand-muted">No articles with this tag yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.data.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {(result.hasMore || page > 1) && (
        <div className="flex gap-3 justify-center mt-8">
          {page > 1 && (
            <a
              href={`/tag/${slug}?page=${page - 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              &larr; Previous
            </a>
          )}
          {result.hasMore && (
            <a
              href={`/tag/${slug}?page=${page + 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              Next &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getArticlesByCategory } from '@/lib/queries/articles'

export const revalidate = 120

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description ?? `Latest ${category.name} news from Zimbabwe.`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="border-b-2 border-brand-red mb-6 pb-3">
        <h1 className="text-2xl md:text-3xl font-black">{category.name}</h1>
        {category.description && (
          <p className="text-brand-muted text-sm mt-1">{category.description}</p>
        )}
      </div>

      {result.data.length === 0 ? (
        <p className="text-brand-muted">No articles in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.data.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(result.hasMore || page > 1) && (
        <div className="flex gap-3 justify-center mt-8">
          {page > 1 && (
            <a
              href={`/category/${slug}?page=${page - 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              &larr; Previous
            </a>
          )}
          {result.hasMore && (
            <a
              href={`/category/${slug}?page=${page + 1}`}
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

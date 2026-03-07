import type { Metadata } from 'next'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { searchArticles } from '@/lib/queries/articles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))

  const result = q.trim().length >= 2
    ? await searchArticles(q.trim(), page, 12)
    : { data: [], total: 0, page: 1, limit: 12, hasMore: false }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black mb-4 border-b-2 border-brand-red pb-3">
        Search
      </h1>

      {/* Search form */}
      <form method="GET" action="/search" className="mb-6">
        <div className="flex gap-2 max-w-lg">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search articles..."
            className="flex-1 border border-brand-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            minLength={2}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-brand-red text-white text-sm font-bold hover:bg-red-700"
          >
            Search
          </button>
        </div>
      </form>

      {q.trim().length >= 2 && (
        <p className="text-sm text-brand-muted mb-4">
          {result.total} result{result.total !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
        </p>
      )}

      {result.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.data.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : q.trim().length >= 2 ? (
        <p className="text-brand-muted">No results found. Try different keywords.</p>
      ) : null}

      {(result.hasMore || page > 1) && (
        <div className="flex gap-3 justify-center mt-8">
          {page > 1 && (
            <a
              href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              &larr; Previous
            </a>
          )}
          {result.hasMore && (
            <a
              href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
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

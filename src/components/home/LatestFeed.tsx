import Link from 'next/link'
import { ArticleCard } from '@/components/ui/ArticleCard'
import type { ArticleWithRelations } from '@/types'

interface LatestFeedProps {
  articles: ArticleWithRelations[]
  hasMore?: boolean
  currentPage?: number
}

// Horizontal scrollable grid of latest articles — the "Latest News" footer block.
export function LatestFeed({ articles, hasMore = false, currentPage = 1 }: LatestFeedProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Latest news">
      <div className="flex items-center justify-between border-b-2 border-brand-red pb-2 mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest">Latest News</h2>
        <Link
          href="/search"
          className="text-xs font-semibold text-brand-red hover:underline"
        >
          All articles &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <Link
            href={`/?page=${currentPage + 1}`}
            className="inline-block px-6 py-2.5 border-2 border-brand-dark text-sm font-bold hover:bg-brand-dark hover:text-white transition-colors"
          >
            Load more
          </Link>
        </div>
      )}
    </section>
  )
}

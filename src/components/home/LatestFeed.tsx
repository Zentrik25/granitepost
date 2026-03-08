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
      <div className="flex items-center justify-between border-b-2 border-granite-primary pb-2 mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest">Latest Updates</h2>
        <Link
          href="/search"
          className="text-xs font-semibold text-granite-primary hover:underline"
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
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-granite-gradient text-white text-sm font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all"
          >
            Load more
          </Link>
        </div>
      )}
    </section>
  )
}

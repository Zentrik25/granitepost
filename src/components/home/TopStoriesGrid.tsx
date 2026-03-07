import { ArticleCard } from '@/components/ui/ArticleCard'
import type { ArticleWithRelations } from '@/types'

interface TopStoriesGridProps {
  articles: ArticleWithRelations[]
  // Articles to show as compact list on the side (desktop)
  sideArticles?: ArticleWithRelations[]
}

// BBC-style: 2-column grid of default cards.
// When sideArticles is provided, renders as a 3-col layout with a compact sidebar.
export function TopStoriesGrid({ articles, sideArticles }: TopStoriesGridProps) {
  if (!articles.length) return null

  if (sideArticles?.length) {
    return (
      <section aria-label="Top stories" className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
        {/* Main 2-col grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.slice(0, 4).map((article, i) => (
            <ArticleCard key={article.id} article={article} priority={i === 0} />
          ))}
        </div>

        {/* Compact side list */}
        <div className="border-t lg:border-t-0 lg:border-l border-brand-border pt-4 lg:pt-0 lg:pl-6 mt-4 lg:mt-0">
          <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted border-b border-brand-border pb-2 mb-0">
            More stories
          </h2>
          {sideArticles.slice(0, 5).map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Top stories">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} priority={i === 0} />
        ))}
      </div>
    </section>
  )
}

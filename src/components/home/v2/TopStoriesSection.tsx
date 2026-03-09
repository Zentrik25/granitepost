import { ArticleCard } from '@/components/ui/ArticleCard'
import type { ArticleWithRelations } from '@/types'

interface TopStoriesSectionProps {
  articles: ArticleWithRelations[]
}

export function TopStoriesSection({ articles }: TopStoriesSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Top stories">
      <div className="mb-5 flex items-center gap-3 border-b-2 border-gray-900 pb-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
          Top Stories
        </h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
import type { ArticleWithRelations } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'

interface TopStoriesSectionProps {
  articles: ArticleWithRelations[]
}

export function TopStoriesSection({ articles }: TopStoriesSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Top stories">
      <div className="flex items-center gap-3 mb-5 pb-2 border-b-2 border-gray-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
          Top Stories
        </h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}

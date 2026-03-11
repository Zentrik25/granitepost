import { ArticleCard } from '@/components/ui/ArticleCard'
import { SectionDivider } from '@/components/ui/SectionDivider'
import type { ArticleWithRelations } from '@/types'

interface TopStoriesSectionProps {
  articles: ArticleWithRelations[]
}

export function TopStoriesSection({ articles }: TopStoriesSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Top stories">
      <SectionDivider
        label="Top Stories"
        gradient="from-red-900 via-red-800 to-red-700"
        className="mb-5"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
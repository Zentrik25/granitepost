import { LatestUpdateCard } from '@/components/home/LatestUpdateCard'
import { SectionDivider } from '@/components/ui/SectionDivider'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

export function LatestUpdatesSection({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section aria-label="Latest updates">
      <SectionDivider
        label="Latest Updates"
        gradient="from-sky-900 via-sky-800 to-blue-700"
        className="mb-5"
      />

      <div className="space-y-3">
        {articles.map((article) => (
          <LatestUpdateCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
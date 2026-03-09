import { LatestUpdateCard } from '@/components/home/LatestUpdateCard'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

export function LatestUpdatesSection({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section aria-label="Latest updates">

      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-brand-primary whitespace-nowrap">
          Latest Updates
        </h2>
        <div className="flex-1 border-b-2 border-brand-primary" />
      </div>

      {/* Single-column compact feed */}
      <div className="space-y-3">
        {articles.map((article) => (
          <LatestUpdateCard key={article.id} article={article} />
        ))}
      </div>

    </section>
  )
}

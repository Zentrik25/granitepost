import Link from 'next/link'
import { ArticleCard } from '@/components/ui/ArticleCard'
import type { ArticleWithRelations, Category } from '@/types'

interface CategoryBlockProps {
  category: Category
  articles: ArticleWithRelations[]
  // Max articles to show (default 4)
  limit?: number
}

// BBC-style category block.
// First article shows as a default card, the rest as compact list.
export function CategoryBlock({ category, articles, limit = 4 }: CategoryBlockProps) {
  if (!articles.length) return null

  const [lead, ...rest] = articles.slice(0, limit)

  return (
    <section aria-label={`${category.name} stories`}>
      <div className="flex items-center justify-between border-b-2 border-brand-red pb-2 mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest">{category.name}</h2>
        <Link
          href={`/category/${category.slug}`}
          className="text-xs font-semibold text-brand-red hover:underline"
          aria-label={`See all ${category.name} articles`}
        >
          See all &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Lead article — larger card on the left */}
        {lead && (
          <div>
            <ArticleCard article={lead} />
          </div>
        )}

        {/* Compact list on the right */}
        {rest.length > 0 && (
          <div className="space-y-0">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

import Link from 'next/link'
import type { MostReadArticle } from '@/types'

interface MostReadListProps {
  articles: MostReadArticle[]
  title?: string
}

export function MostReadList({ articles, title = 'Most Read' }: MostReadListProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Most read articles">
      <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-granite-primary pb-2 mb-4">
        {title}
      </h2>
      <ol className="space-y-0 divide-y divide-gray-100">
        {articles.map((article, i) => (
          <li key={article.article_id} className="flex gap-3 items-start py-3 group">
            <span className="text-xl font-black text-granite-primary/20 leading-none w-6 flex-shrink-0 select-none group-hover:text-granite-primary/40 transition-colors">
              {i + 1}
            </span>
            <Link
              href={`/article/${article.slug}`}
              className="text-sm font-semibold leading-snug hover:text-granite-primary transition-colors line-clamp-2"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

// Keep legacy export name for backwards compat
export { MostReadList as MostRead }

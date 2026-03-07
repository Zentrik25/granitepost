import Link from 'next/link'
import { getMostReadArticles } from '@/lib/db/queries'

interface Props {
  limit?: number
  title?: string
}

export async function MostRead({ limit = 5, title = 'Most Read' }: Props) {
  const articles = await getMostReadArticles(limit)
  if (!articles.length) return null

  return (
    <section aria-label={title}>
      <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-brand-red pb-2 mb-4">
        {title}
      </h2>
      <ol className="space-y-3">
        {articles.map((article, i) => (
          <li key={article.article_id} className="flex gap-3 items-start">
            <span
              aria-hidden="true"
              className="text-2xl font-black text-brand-border leading-none w-6 flex-shrink-0 select-none"
            >
              {i + 1}
            </span>
            <Link
              href={`/article/${article.slug}`}
              className="text-sm font-semibold leading-snug hover:text-brand-red transition-colors line-clamp-3"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

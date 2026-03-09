import Link from 'next/link'
import type { MostReadArticle } from '@/types'

interface Props {
  articles: MostReadArticle[]
}

function MostReadItem({
  article,
  rank,
}: {
  article: MostReadArticle
  rank: number
}) {
  return (
    <li className="flex items-start gap-3 py-3 border-b border-brand-border last:border-0 group">
      <span
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
        style={{ background: rank === 1 ? '#B8282A' : '#1C2B3A' }}
        aria-hidden="true"
      >
        {rank}
      </span>
      <h3 className="text-sm font-semibold leading-snug line-clamp-3 text-brand-primary group-hover:text-brand-secondary transition-colors duration-150">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h3>
    </li>
  )
}

export function MostReadSection({ articles }: Props) {
  if (!articles.length) return null

  const left = articles.slice(0, 3)
  const right = articles.slice(3)

  return (
    <section aria-label="Most read">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-brand-primary whitespace-nowrap">
          Most Read
        </h2>
        <div className="flex-1 border-b-2 border-brand-primary" />
      </div>

      {/* Two-column numbered list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
        <ol>
          {left.map((a, i) => (
            <MostReadItem key={a.article_id} article={a} rank={i + 1} />
          ))}
        </ol>
        {right.length > 0 && (
          <ol>
            {right.map((a, i) => (
              <MostReadItem key={a.article_id} article={a} rank={left.length + i + 1} />
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

import Link from 'next/link'
import { SectionDivider } from '@/components/ui/SectionDivider'

type MostReadArticle = {
  article_id: string
  slug: string
  title: string
}

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
    <li className="group flex items-start gap-3 border-b border-brand-border py-3 last:border-0">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
        style={{ background: rank === 1 ? '#B8282A' : '#1C2B3A' }}
        aria-hidden="true"
      >
        {rank}
      </span>

      <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-brand-primary transition-colors duration-150 group-hover:text-brand-secondary">
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
      <SectionDivider
        label="Most Read"
        gradient="from-violet-900 via-purple-800 to-purple-700"
        className="mb-5"
      />

      <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        <ol>
          {left.map((a, i) => (
            <MostReadItem key={a.article_id} article={a} rank={i + 1} />
          ))}
        </ol>

        {right.length > 0 && (
          <ol>
            {right.map((a, i) => (
              <MostReadItem
                key={a.article_id}
                article={a}
                rank={left.length + i + 1}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
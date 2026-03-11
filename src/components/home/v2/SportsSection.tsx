import Image from 'next/image'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

function SportsLeadCard({ article }: { article: ArticleWithRelations }) {
  return (
    <article className="group relative overflow-hidden rounded-lg">
      <Link
        href={`/article/${article.slug}`}
        className="absolute inset-0 z-0"
        aria-label={article.title}
        tabIndex={-1}
      />

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-white">
            <Link
              href={`/article/${article.slug}`}
              className="hover:underline underline-offset-2 decoration-white/40"
            >
              {article.title}
            </Link>
          </h3>
          {article.published_at && (
            <time
              dateTime={article.published_at}
              className="mt-1 block text-[11px] text-white/60"
            >
              {relativeTime(article.published_at ?? null)}
            </time>
          )}
        </div>
      </div>
    </article>
  )
}

function SportsListItem({
  article,
  rank,
}: {
  article: ArticleWithRelations
  rank: number
}) {
  return (
    <li className="group flex items-start gap-3 border-b border-gray-100 py-2.5 last:border-0">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black text-white"
        style={{ background: '#16a34a' }}
        aria-hidden="true"
      >
        {rank}
      </span>
      <h4 className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors duration-150 group-hover:text-green-700">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h4>
    </li>
  )
}

export function SportsSection({ articles }: Props) {
  if (!articles.length) return null

  const [lead, ...rest] = articles

  return (
    <section aria-label="Sport">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="whitespace-nowrap text-xs font-black uppercase tracking-widest text-gray-900">
          Sport
        </h2>
        <div className="flex-1 border-b-2 border-green-600" />
        <Link
          href="/category/sport"
          className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-green-600 transition-colors hover:text-green-500"
        >
          See all →
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {lead && <SportsLeadCard article={lead} />}

        {rest.length > 0 && (
          <ol className="mt-1">
            {rest.slice(0, 4).map((article, i) => (
              <SportsListItem key={article.id} article={article} rank={i + 1} />
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'bg-red-600'
  if (rank === 2) return 'bg-amber-500'
  return 'bg-slate-500'
}

function TrendCard({
  article,
  rank,
}: {
  article: ArticleWithRelations
  rank: number
}) {
  const href = `/article/${article.slug}`
  const category = article.category
  const author = article.author?.full_name

  return (
    <article className="group relative flex gap-4 overflow-hidden rounded-xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <Link
        href={href}
        className="absolute inset-0 z-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-canvas to-brand-border">
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-brand-muted"
              aria-hidden="true"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${getRankStyle(
              rank
            )}`}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>

          <span className="flex-shrink-0 rounded bg-accent-amber px-2 py-px text-[10px] font-bold uppercase tracking-wide text-white">
            Trending
          </span>

          {category && (
            <CategoryBadge
              name={category.name}
              href={`/category/${category.slug}`}
              size="sm"
            />
          )}
        </div>

        <Link
          href={href}
          className="line-clamp-2 text-sm font-semibold leading-snug text-brand-primary transition-colors duration-150 group-hover:text-accent-amber"
        >
          {article.title}
        </Link>

        <p className="truncate text-xs text-brand-muted">
          By {author ?? 'Admin'}
          {article.published_at && (
            <>
              {' · '}
              <time dateTime={article.published_at}>
                {relativeTime(article.published_at ?? null)}
              </time>
            </>
          )}
        </p>
      </div>
    </article>
  )
}

export function TrendingSection({ articles }: Props) {
  if (!articles.length) return null

  return (
    <section aria-label="Trending now">
      <div className="mb-5">
        <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-brand-primary">
          Trending Now
        </h2>
        <div className="w-full border-b-2 border-accent-amber" />
      </div>

      <div className="space-y-3">
        {articles.slice(0, 3).map((article, i) => (
          <TrendCard key={article.id} article={article} rank={i + 1} />
        ))}
      </div>
    </section>
  )
}
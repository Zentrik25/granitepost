import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { relativeTime } from '@/lib/utils/slug'

interface Props {
  articles: ArticleWithRelations[]
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'bg-red-600'
  if (rank === 2) return 'bg-amber-500'
  return 'bg-slate-500'
}

function TrendCard({ article, rank }: { article: ArticleWithRelations; rank: number }) {
  const href = `/article/${article.slug}`
  const category = article.category
  const author = article.author?.full_name

  return (
    <article className="relative flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Cover link */}
      <Link href={href} className="absolute inset-0 z-0" aria-hidden="true" tabIndex={-1} />

      {/* Thumbnail */}
      <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-brand-canvas to-brand-border">
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
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-brand-muted" aria-hidden="true">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-1.5 min-w-0 flex-1">

        {/* Rank + Trending badge + Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0 ${getRankStyle(rank)}`}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-px rounded bg-accent-amber text-white flex-shrink-0">
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

        {/* Headline */}
        <Link
          href={href}
          className="text-sm font-semibold leading-snug line-clamp-2 text-brand-primary group-hover:text-accent-amber transition-colors duration-150"
        >
          {article.title}
        </Link>

        {/* Author · time */}
        <p className="text-xs text-brand-muted truncate">
          By {author ?? 'Admin'}
          {article.published_at && (
            <>
              {' · '}
              <time dateTime={article.published_at}>{relativeTime(article.published_at)}</time>
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

      {/* Header: text above a full-width horizontal line */}
      <div className="mb-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-2">
          Trending Now
        </h2>
        <div className="border-b-2 border-accent-amber w-full" />
      </div>

      <div className="space-y-3">
        {articles.slice(0, 3).map((article, i) => (
          <TrendCard key={article.id} article={article} rank={i + 1} />
        ))}
      </div>

    </section>
  )
}

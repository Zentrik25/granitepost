import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

const OpinionCard = memo(function OpinionCard({
  article,
}: {
  article: ArticleWithRelations
}) {
  const href = `/article/${article.slug}`
  const author = article.author

  return (
    <article className="group flex flex-col gap-4">
      {/* Author */}
      <div className="flex items-center gap-2.5">
        {author?.avatar_url ? (
          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-white/20">
            <Image
              src={author.avatar_url}
              alt={author.full_name || 'Author'}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-white/50"
              aria-hidden="true"
            >
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
            </svg>
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white/90">
            {author?.full_name || 'Staff Writer'}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-white/50">
            Opinion
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="border-l-2 border-accent-amber pl-3">
        <h3 className="line-clamp-3 text-sm font-bold leading-snug text-white transition-colors duration-150 group-hover:text-accent-amber-lt">
          <Link href={href} prefetch={false}>
            {article.title}
          </Link>
        </h3>
      </div>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
          {article.excerpt}
        </p>
      )}

      {/* Time */}
      {article.published_at && (
        <time
          dateTime={article.published_at}
          className="text-[11px] text-white/40"
        >
          {relativeTime(article.published_at ?? null)}
        </time>
      )}
    </article>
  )
})

export function OpinionSection({ articles }: Props) {
  if (!articles.length) return null

  return (
    <section
      aria-label="Opinion and analysis"
      className="rounded-2xl bg-gradient-to-br from-[#0D1117] via-[#1C2B3A] to-[#2E4A62] px-6 py-7 sm:px-8"
    >
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <h2 className="whitespace-nowrap text-xs font-black uppercase tracking-widest text-white">
          Opinion &amp; Analysis
        </h2>
        <div className="flex-1 border-b border-white/20" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {articles.map((article) => (
          <OpinionCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
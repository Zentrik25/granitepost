import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'

interface Props {
  articles: ArticleWithRelations[]
}

function OpinionCard({ article }: { article: ArticleWithRelations }) {
  const href = `/article/${article.slug}`
  const author = article.author

  return (
    <article className="flex flex-col gap-4 group">
      {/* Author */}
      <div className="flex items-center gap-2.5">
        {author?.avatar_url ? (
          <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
            <Image
              src={author.avatar_url}
              alt={author.full_name ?? 'Author'}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full flex-shrink-0 bg-white/10 border border-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/50" aria-hidden="true">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/90 truncate">
            {author?.full_name ?? 'Staff Writer'}
          </p>
          <p className="text-[11px] text-white/50 uppercase tracking-wide">Opinion</p>
        </div>
      </div>

      {/* Headline */}
      <div className="border-l-2 border-accent-amber pl-3">
        <h3 className="text-sm font-bold leading-snug text-white group-hover:text-accent-amber-lt transition-colors duration-150 line-clamp-3">
          <Link href={href}>{article.title}</Link>
        </h3>
      </div>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{article.excerpt}</p>
      )}

      {/* Time */}
      {article.published_at && (
        <time dateTime={article.published_at} className="text-[11px] text-white/40">
          {relativeTime(article.published_at)}
        </time>
      )}
    </article>
  )
}

export function OpinionSection({ articles }: Props) {
  if (!articles.length) return null

  return (
    <section
      aria-label="Opinion and analysis"
      className="rounded-2xl px-6 py-7 sm:px-8"
      style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1C2B3A 60%, #2E4A62 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <h2 className="text-xs font-black uppercase tracking-widest text-white whitespace-nowrap">
          Opinion &amp; Analysis
        </h2>
        <div className="flex-1 border-b border-white/20" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {articles.map((article) => (
          <OpinionCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}

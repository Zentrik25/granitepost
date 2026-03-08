import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'
import { CategoryBadge } from '@/components/ui/CategoryBadge'

interface LatestNewsSectionProps {
  articles: ArticleWithRelations[]
}

export function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Latest news">
      <div className="flex items-center justify-between border-b-2 border-granite-primary pb-2 mb-5">
        <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
          Latest News
        </h2>
        <Link
          href="/search"
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--text-link)' }}
        >
          All articles →
        </Link>
      </div>

      {/* 2-col on md+, 1-col on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {articles.map((article) => (
          <article
            key={article.id}
            className="group flex gap-3 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            {/* Square thumbnail */}
            {article.hero_image_url && (
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                <Image
                  src={article.hero_image_url}
                  alt={article.hero_image_alt ?? article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  sizes="96px"
                />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0 py-3 pr-3">
              {article.category && (
                <CategoryBadge
                  name={article.category.name}
                  href={`/category/${article.category.slug}`}
                  className="mb-1.5"
                />
              )}
              <h3 className="text-sm font-semibold leading-snug line-clamp-3">
                <Link
                  href={`/article/${article.slug}`}
                  className="transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  {article.title}
                </Link>
              </h3>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                {article.author?.full_name && (
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {article.author.full_name} ·{' '}
                  </span>
                )}
                <time dateTime={article.published_at ?? undefined}>
                  {relativeTime(article.published_at)}
                </time>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
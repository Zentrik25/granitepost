import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'

interface LatestFeedSectionProps {
  articles: ArticleWithRelations[]
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide text-white bg-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
      Live
    </span>
  )
}

export function LatestFeedSection({ articles }: LatestFeedSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Latest updates">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
          Latest Updates
        </h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {articles.map((article) => (
          <article
            key={article.id}
            className="relative group flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden"
          >
            {/* Cover link */}
            <Link
              href={`/article/${article.slug}`}
              className="absolute inset-0 z-0"
              aria-label={article.title}
              tabIndex={-1}
            />

            <div className="relative aspect-[16/9] w-full overflow-hidden flex-shrink-0">
              {article.hero_image_url ? (
                <Image
                  src={article.hero_image_url}
                  alt={article.hero_image_alt ?? article.title}
                  fill
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
              )}

              {'is_live' in article && article.is_live && (
                <div className="absolute top-2 left-2 z-10">
                  <LiveBadge />
                </div>
              )}
            </div>

            <div className="relative z-10 p-3.5 flex flex-col gap-1.5 flex-1">
              {article.category && (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="text-[10px] font-bold uppercase tracking-wide text-amber-600 hover:text-amber-500 transition-colors self-start"
                >
                  {article.category.name}
                </Link>
              )}
              <h3 className="text-[13px] font-bold leading-snug line-clamp-3">
                <Link
                  href={`/article/${article.slug}`}
                  className="text-gray-900 hover:text-amber-800 transition-colors duration-150"
                >
                  {article.title}
                </Link>
              </h3>
              <p className="text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-100">
                <time dateTime={article.updated_at ?? article.published_at ?? undefined}>
                  {relativeTime(article.updated_at ?? article.published_at)}
                </time>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

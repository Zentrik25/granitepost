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
          <article key={article.id} className="group flex flex-col gap-2">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-gray-100">
              {article.hero_image_url ? (
                <Image
                  src={article.hero_image_url}
                  alt={article.hero_image_alt ?? article.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
              )}

              {/* Live badge — top-left */}
              {'is_live' in article && article.is_live && (
                <div className="absolute top-2 left-2">
                  <LiveBadge />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {article.category && (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="text-[10px] font-bold uppercase tracking-wide text-amber-600 hover:text-amber-500 transition-colors"
                >
                  {article.category.name}
                </Link>
              )}
              <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-amber-700 transition-colors">
                <Link href={`/article/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="text-[11px] text-gray-400">
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

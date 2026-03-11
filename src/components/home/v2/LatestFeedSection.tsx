import Image from 'next/image'
import Link from 'next/link'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface LatestFeedSectionProps {
  articles: ArticleWithRelations[]
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
        aria-hidden="true"
      />
      Live
    </span>
  )
}

export function LatestFeedSection({ articles }: LatestFeedSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Latest news">
      <SectionDivider
        label="Latest News"
        gradient="from-slate-700 via-slate-600 to-slate-500"
        className="mb-4"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <article
            key={article.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
          >
            <Link
              href={`/article/${article.slug}`}
              className="absolute inset-0 z-0"
              aria-label={article.title}
              tabIndex={-1}
            />

            <div className="relative aspect-[16/9] w-full flex-shrink-0 overflow-hidden">
              {article.hero_image_url ? (
                <Image
                  src={article.hero_image_url}
                  alt={article.hero_image_alt ?? article.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
              )}

              {article.is_live && (
                <div className="absolute left-2 top-2 z-10">
                  <LiveBadge />
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-1 flex-col gap-1.5 p-3.5">
              {article.category && (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="self-start text-[10px] font-bold uppercase tracking-wide text-amber-600 transition-colors hover:text-amber-500"
                >
                  {article.category.name}
                </Link>
              )}

              <h3 className="line-clamp-3 text-[13px] font-bold leading-snug">
                <Link
                  href={`/article/${article.slug}`}
                  className="text-gray-900 transition-colors duration-150 hover:text-amber-800"
                >
                  {article.title}
                </Link>
              </h3>

              <p className="mt-auto border-t border-gray-100 pt-2 text-[11px] text-gray-400">
                <time dateTime={article.updated_at ?? article.published_at ?? undefined}>
                  {relativeTime((article.updated_at ?? article.published_at) ?? null)}
                </time>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
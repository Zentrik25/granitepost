import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'

interface TopStoriesSectionProps {
  articles: ArticleWithRelations[]
}

export function TopStoriesSection({ articles }: TopStoriesSectionProps) {
  if (!articles.length) return null

  return (
    <section aria-label="Top stories">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
          Top Stories
        </h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <article key={article.id} className="group flex flex-col gap-2">
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-gray-100">
              {article.hero_image_url ? (
                <Image
                  src={article.hero_image_url}
                  alt={article.hero_image_alt ?? article.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
              )}

              {article.category && (
                <div className="absolute top-2 left-2">
                  <Link
                    href={`/category/${article.category.slug}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white bg-amber-500 hover:bg-amber-400 transition-colors"
                  >
                    {article.category.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-amber-700 transition-colors">
                <Link href={`/article/${article.slug}`}>
                  {article.title}
                </Link>
              </h3>
              {article.excerpt && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 hidden sm:block">
                  {article.excerpt}
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5">
                {article.author?.full_name && (
                  <span className="text-gray-500 font-medium">{article.author.full_name} · </span>
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

import Image from 'next/image'
import Link from 'next/link'
import { getRelatedStories } from '@/lib/db/queries'
import { relativeTime } from '@/lib/utils/slug'
import { CategoryBadge } from '@/components/ui/CategoryBadge'

interface Props {
  articleId: string
  categoryId?: string | null
  limit?: number
  title?: string
}

/**
 * Fetches up to `limit` published articles in the same category,
 * ordered by published_at desc, excluding the current article.
 * Displays as a 4-col card grid below the article body.
 */
export async function RelatedStories({
  articleId,
  categoryId,
  limit = 4,
  title = 'Related Stories',
}: Props) {
  const articles = await getRelatedStories(articleId, categoryId ?? null, limit)
  if (!articles.length) return null

  return (
    <section aria-label={title} className="mt-10">
      <h2
        className="text-sm font-black uppercase tracking-widest border-b-2 pb-2 mb-5"
        style={{ borderColor: 'var(--brand-primary)', color: 'var(--text-primary)' }}
      >
        {title}
      </h2>

      {/* 4-col on lg+, 2-col on sm+, 1-col on mobile */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map((article) => (
          <li key={article.id}>
            <article className="group bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col h-full">
              {article.hero_image_url && (
                <div className="relative aspect-[16/9] w-full overflow-hidden flex-shrink-0">
                  <Image
                    src={article.hero_image_url}
                    alt={article.hero_image_alt ?? article.title}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                </div>
              )}
              <div className="p-3.5 flex flex-col flex-1">
                {article.category && (
                  <CategoryBadge
                    name={article.category.name}
                    href={`/category/${article.category.slug}`}
                    className="mb-1.5 self-start"
                  />
                )}
                <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-1 flex-1 transition-colors duration-200 group-hover:text-granite-primary">
                  <Link href={`/article/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                {article.published_at && (
                  <p className="text-[11px] mt-2 pt-1 border-t border-gray-50" style={{ color: 'var(--text-muted)' }}>
                    <time dateTime={article.published_at}>
                      {relativeTime(article.published_at)}
                    </time>
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
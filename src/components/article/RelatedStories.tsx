import Link from 'next/link'
import Image from 'next/image'
import { getRelatedStories } from '@/lib/db/queries'
import { formatDate } from '@/lib/utils/slug'

interface Props {
  articleId: string
  categoryId?: string | null
  limit?: number
  title?: string
}

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
      <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-brand-red pb-2 mb-4">
        {title}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/article/${article.slug}`} className="group block">
              {article.hero_image_url && (
                <div className="relative aspect-[16/9] mb-3 overflow-hidden bg-brand-gray">
                  <Image
                    src={article.hero_image_url}
                    alt={article.hero_image_alt ?? article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              )}
              {article.category && (
                <span className="text-xs font-bold text-brand-red uppercase tracking-wide">
                  {article.category.name}
                </span>
              )}
              <h3 className="font-bold text-sm leading-snug mt-1 group-hover:text-brand-red transition-colors line-clamp-3">
                {article.title}
              </h3>
              {article.published_at && (
                <time
                  dateTime={article.published_at}
                  className="text-xs text-brand-muted mt-1 block"
                >
                  {formatDate(article.published_at)}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

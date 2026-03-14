import Image from 'next/image'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils/slug'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { SectionDivider } from '@/components/ui/SectionDivider'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

/** Lead card — same shell as EditorialSection LeadCard, green accent */
function SportsLeadCard({ article }: { article: ArticleWithRelations }) {
  return (
    <article className="relative group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]">
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
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-green-700" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col gap-2 p-4">
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug">
          <Link
            href={`/article/${article.slug}`}
            className="text-gray-900 transition-colors duration-150 hover:text-green-800"
          >
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="hidden line-clamp-2 text-sm leading-relaxed text-gray-500 md:block">
            {article.excerpt}
          </p>
        )}

        <p className="mt-auto border-t border-gray-100 pt-2 text-[11px] text-gray-400">
          {article.author?.full_name && (
            <span className="font-medium text-gray-500">
              By {article.author.full_name} ·{' '}
            </span>
          )}
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at ?? null)}
          </time>
        </p>
      </div>
    </article>
  )
}

export function SportsSection({ articles }: Props) {
  if (!articles?.length) return null

  const [lead, ...rest] = articles.slice(0, 5)

  return (
    <section aria-label="Sport">
      <SectionDivider
        label="Sport"
        gradient="from-emerald-800 via-green-700 to-green-600"
        className="mb-4"
        endSlot={
          <Link
            href="/category/sport"
            className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-green-600 transition-colors hover:text-green-500"
          >
            See all →
          </Link>
        }
      />

      <div className="flex flex-col gap-4">
        {lead && <SportsLeadCard article={lead} />}

        {rest.length > 0 && (
          <div className="space-y-3">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

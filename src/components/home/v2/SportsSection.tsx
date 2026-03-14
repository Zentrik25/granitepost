import Image from 'next/image'
import Link from 'next/link'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface Props {
  articles: ArticleWithRelations[]
}

/* Lead story */

function SportsLeadCard({ article }: { article: ArticleWithRelations }) {
  return (
    <article className="group relative overflow-hidden rounded-lg">
      <Link
        href={`/article/${article.slug}`}
        className="absolute inset-0 z-10"
        aria-label={article.title}
        tabIndex={-1}
      />

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-white">
            {article.title}
          </h3>

          {article.published_at && (
            <time
              dateTime={article.published_at}
              className="mt-1 block text-[11px] text-white/70"
            >
              {relativeTime(article.published_at)}
            </time>
          )}
        </div>
      </div>
    </article>
  )
}

/* Small stories */

function SportsStoryCard({ article }: { article: ArticleWithRelations }) {
  return (
    <article className="group relative flex items-start gap-3 border-b border-gray-100 py-3 last:border-0">
      <Link
        href={`/article/${article.slug}`}
        className="absolute inset-0 z-0"
        aria-label={article.title}
        tabIndex={-1}
      />

      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors duration-150 group-hover:text-green-700">
          {article.title}
        </h4>

        {article.published_at && (
          <time
            dateTime={article.published_at}
            className="mt-1 block text-[11px] text-gray-500"
          >
            {relativeTime(article.published_at)}
          </time>
        )}
      </div>
    </article>
  )
}

/* Main section */

export function SportsSection({ articles }: Props) {
  if (!articles?.length) return null

  const limited = articles.slice(0, 5)
  const [lead, ...rest] = limited

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
          <div>
            {rest.slice(0, 4).map((article) => (
              <SportsStoryCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
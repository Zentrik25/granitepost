import Image from 'next/image'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils/slug'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { SectionDivider } from '@/components/ui/SectionDivider'
import type { Category, ArticleWithRelations } from '@/types'

export interface EditorialBlock {
  category: Category
  articles: ArticleWithRelations[]
}

interface EditorialSectionProps {
  blocks: EditorialBlock[]
}

/** Lead card — full-width image on top, text below, card shell */
function LeadCard({ article }: { article: ArticleWithRelations }) {
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
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-2 p-4">
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug">
          <Link
            href={`/article/${article.slug}`}
            className="text-gray-900 transition-colors duration-150 hover:text-amber-800"
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
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at ?? null)}
          </time>
        </p>
      </div>
    </article>
  )
}

function CategoryBlock({ block }: { block: EditorialBlock }) {
  const [lead, ...rest] = block.articles
  if (!lead) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-2">
        <Link
          href={`/category/${block.category.slug}`}
          className="text-xs font-black uppercase tracking-widest text-gray-900 transition-colors hover:text-amber-700"
        >
          {block.category.name}
        </Link>

        <Link
          href={`/category/${block.category.slug}`}
          className="ml-auto text-[10px] font-bold uppercase tracking-wide text-amber-600 transition-colors hover:text-amber-500"
        >
          See all →
        </Link>
      </div>

      <LeadCard article={lead} />

      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>
      )}
    </div>
  )
}

export function EditorialSection({ blocks }: EditorialSectionProps) {
  if (!blocks.length) return null

  return (
    <section aria-label="News by category">
      <SectionDivider
        label="News by Category"
        gradient="from-stone-700 via-stone-600 to-stone-500"
        className="mb-8"
      />
      <div
        className={`grid grid-cols-1 gap-8 ${blocks.length === 1
          ? 'md:grid-cols-1'
          : blocks.length === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-3'
          }`}
      >
        {blocks.map((block) => (
          <CategoryBlock key={block.category.id} block={block} />
        ))}
      </div>
    </section>
  )
}
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

/** Lead card — full-width image on top, text below, card shell.
 *  h-full so it fills its CSS subgrid row and stays equal across columns. */
function LeadCard({ article }: { article: ArticleWithRelations }) {
  return (
    <article className="relative group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]">
      <Link
        href={`/article/${article.slug}`}
        className="absolute inset-0 z-0"
        aria-label={article.title}
        tabIndex={-1}
      />

      <div className="relative aspect-[16/10] w-full flex-shrink-0 overflow-hidden">
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

      <div className="relative z-10 flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug">
          <Link
            href={`/article/${article.slug}`}
            className="text-gray-900 transition-colors duration-150 hover:text-amber-800"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-auto border-t border-gray-100 pt-1.5 text-[11px] text-gray-400">
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at ?? null)}
          </time>
        </p>
      </div>
    </article>
  )
}

/**
 * Each block renders exactly 5 direct children:
 *   [0] category header
 *   [1] lead card
 *   [2] compact card 1
 *   [3] compact card 2
 *   [4] compact card 3
 *
 * On desktop the wrapper becomes a subgrid spanning those 5 rows, so every
 * child aligns row-for-row with its counterpart in other columns.
 * CSS grid auto-sizes each row to the tallest item → all cards equal height.
 * Mobile: flex-col with gap-3, subgrid has no effect.
 */
function CategoryBlock({ block }: { block: EditorialBlock }) {
  const [lead, ...rest] = block.articles
  if (!lead) return null

  // Pad to exactly 3 compact slots so every column spans the same row count
  const compact = rest.slice(0, 3)
  while (compact.length < 3) compact.push(null as unknown as ArticleWithRelations)

  return (
    <div className="flex flex-col gap-3 md:row-span-5 md:[display:subgrid] md:gap-y-0">
      {/* Row 1 — category header */}
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

      {/* Row 2 — lead card (h-full fills its equal-height subgrid row) */}
      <LeadCard article={lead} />

      {/* Rows 3-5 — one compact card per row so CSS grid equalises them */}
      {compact.map((article, i) =>
        article ? (
          <ArticleCard key={article.id} article={article} variant="compact" />
        ) : (
          <div key={`empty-${i}`} />
        )
      )}
    </div>
  )
}

export function EditorialSection({ blocks }: EditorialSectionProps) {
  if (!blocks.length) return null

  const colClass =
    blocks.length === 1
      ? 'md:grid-cols-1'
      : blocks.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-3'

  return (
    <section aria-label="News by category">
      <SectionDivider
        label="News by Category"
        gradient="from-stone-700 via-stone-600 to-stone-500"
        className="mb-8"
      />
      {/*
       * Desktop: 3-column grid. Each CategoryBlock uses display:subgrid +
       * row-span-5, placing its 5 children (header / lead / compact×3) into
       * shared grid rows. CSS grid makes every row the height of the tallest
       * item across all columns → pixel-perfect alignment.
       * gap-y-3 flows into the subgrid rows for consistent spacing.
       * Mobile: single column, blocks stack naturally.
       */}
      <div className={`grid grid-cols-1 gap-x-8 gap-y-3 ${colClass}`}>
        {blocks.map((block) => (
          <CategoryBlock key={block.category.id} block={block} />
        ))}
      </div>
    </section>
  )
}
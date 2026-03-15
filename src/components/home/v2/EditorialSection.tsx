import Link from 'next/link'
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

      {/* Row 2 — lead card: same design as Top Stories, title capped at 2 lines */}
      <div className="[&_h3]:line-clamp-2">
        <ArticleCard article={lead} />
      </div>

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
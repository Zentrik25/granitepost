import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import type { Category } from '@/types'
import { relativeTime } from '@/lib/utils/slug'
import { ArticleCard } from '@/components/ui/ArticleCard'

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
    <article className="relative group flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden">
      <Link
        href={`/article/${article.slug}`}
        className="absolute inset-0 z-0"
        aria-label={article.title}
        tabIndex={-1}
      />

      <div className="relative aspect-[16/9] w-full overflow-hidden flex-shrink-0">
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
      </div>

      <div className="relative z-10 p-4 flex flex-col gap-2">
        <h3 className="text-[15px] font-bold leading-snug line-clamp-3">
          <Link
            href={`/article/${article.slug}`}
            className="text-gray-900 hover:text-amber-800 transition-colors duration-150"
          >
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 hidden md:block">
            {article.excerpt}
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-100">
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at)}
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
      {/* Section header */}
      <div className="flex items-center gap-2 pb-2 border-b-2 border-amber-500">
        <Link
          href={`/category/${block.category.slug}`}
          className="text-xs font-black uppercase tracking-widest text-gray-900 hover:text-amber-700 transition-colors"
        >
          {block.category.name}
        </Link>
        <Link
          href={`/category/${block.category.slug}`}
          className="ml-auto text-[10px] font-bold uppercase tracking-wide text-amber-600 hover:text-amber-500 transition-colors"
        >
          See all →
        </Link>
      </div>

      {/* Lead article */}
      <LeadCard article={lead} />

      {/* Secondary articles */}
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
      <div
        className={`grid grid-cols-1 gap-8 ${
          blocks.length === 1
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

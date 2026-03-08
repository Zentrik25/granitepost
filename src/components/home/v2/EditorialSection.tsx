import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import type { Category } from '@/types'
import { relativeTime } from '@/lib/utils/slug'

export interface EditorialBlock {
  category: Category
  articles: ArticleWithRelations[]
}

interface EditorialSectionProps {
  blocks: EditorialBlock[]
}

function BlockCard({ article, large = false }: { article: ArticleWithRelations; large?: boolean }) {
  return (
    <article className={`group flex gap-3 ${large ? 'flex-col' : 'flex-row items-start'}`}>
      <div
        className={`relative shrink-0 overflow-hidden rounded bg-gray-100 ${
          large ? 'w-full aspect-[16/9]' : 'w-24 h-[62px]'
        }`}
      >
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes={large ? '(max-width: 768px) 100vw, 50vw' : '96px'}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <h3
          className={`font-bold text-gray-900 leading-snug group-hover:text-amber-700 transition-colors ${
            large ? 'text-[16px] line-clamp-3' : 'text-[13px] line-clamp-2'
          }`}
        >
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        {large && article.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 hidden md:block">
            {article.excerpt}
          </p>
        )}
        <p className="text-[11px] text-gray-400">
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
      <BlockCard article={lead} large />

      {/* Secondary articles */}
      {rest.length > 0 && (
        <div className="space-y-3 pt-1 border-t border-gray-100">
          {rest.map((article) => (
            <BlockCard key={article.id} article={article} />
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

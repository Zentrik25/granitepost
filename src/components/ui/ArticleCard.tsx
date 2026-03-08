import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'
import { CategoryBadge } from '@/components/ui/CategoryBadge'

interface ArticleCardProps {
  article: ArticleWithRelations
  variant?: 'default' | 'compact' | 'hero'
  priority?: boolean
}

export function ArticleCard({
  article,
  variant = 'default',
  priority = false,
}: ArticleCardProps) {
  // ── Compact — horizontal layout (sidebar / related) ──────────────────────────
  if (variant === 'compact') {
    return (
      <article className="relative group flex gap-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 p-3 overflow-hidden">
        {/* Cover link — makes the entire card a tap target */}
        <Link
          href={`/article/${article.slug}`}
          className="absolute inset-0 z-0"
          aria-label={article.title}
          tabIndex={-1}
        />

        {article.hero_image_url && (
          <div className="relative w-[76px] h-[52px] flex-shrink-0 overflow-hidden rounded">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt ?? article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-400 ease-out"
              sizes="76px"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 relative z-10">
          {article.category && (
            <div className="mb-1">
              <CategoryBadge
                name={article.category.name}
                href={`/category/${article.category.slug}`}
              />
            </div>
          )}
          <h3 className="text-[13px] font-semibold leading-snug line-clamp-2">
            <Link
              href={`/article/${article.slug}`}
              className="text-gray-900 hover:text-amber-800 transition-colors duration-150"
            >
              {article.title}
            </Link>
          </h3>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {article.author?.full_name && (
              <span className="text-gray-500 font-medium">By {article.author.full_name} · </span>
            )}
            <time dateTime={article.published_at ?? undefined}>
              {relativeTime(article.published_at)}
            </time>
          </p>
        </div>
      </article>
    )
  }

  // ── Hero — full-bleed image with text overlay ─────────────────────────────────
  if (variant === 'hero') {
    return (
      <article className="relative bg-gray-950 overflow-hidden group rounded-lg">
        {article.hero_image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt ?? article.title}
              fill
              className="object-cover opacity-75 group-hover:scale-[1.03] group-hover:opacity-80 transition-all duration-500 ease-out"
              priority={priority}
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          {article.category && (
            <div className="mb-2 relative z-10">
              <CategoryBadge
                name={article.category.name}
                href={`/category/${article.category.slug}`}
                variant="overlay"
              />
            </div>
          )}
          <h2 className="text-xl md:text-3xl font-bold leading-tight mb-2 text-white">
            <Link
              href={`/article/${article.slug}`}
              className="hover:underline underline-offset-2 decoration-white/40"
            >
              {article.title}
            </Link>
          </h2>
          {article.excerpt && (
            <p className="text-sm text-gray-300 line-clamp-2 hidden md:block mb-2">
              {article.excerpt}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {article.author?.full_name && (
              <span className="text-gray-300 font-medium">By {article.author.full_name} · </span>
            )}
            <time dateTime={article.published_at ?? undefined}>
              {relativeTime(article.published_at)}
            </time>
          </p>
        </div>
      </article>
    )
  }

  // ── Default — editorial card ──────────────────────────────────────────────────
  return (
    <article className="relative group flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden">
      {/* Cover link — makes the entire card a tap target */}
      <Link
        href={`/article/${article.slug}`}
        className="absolute inset-0 z-0"
        aria-label={article.title}
        tabIndex={-1}
      />

      {/* Thumbnail */}
      {article.hero_image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden flex-shrink-0">
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
        </div>
      )}

      {/* Content — z-10 so category badge link sits above cover link */}
      <div className="relative z-10 p-4 flex flex-col flex-1 gap-2">
        {article.category && (
          <div>
            <CategoryBadge
              name={article.category.name}
              href={`/category/${article.category.slug}`}
            />
          </div>
        )}

        <h3 className="text-[15px] font-bold leading-snug line-clamp-3">
          <Link
            href={`/article/${article.slug}`}
            className="text-gray-900 hover:text-amber-800 transition-colors duration-150"
          >
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}

        <p className="text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-100">
          {article.author?.full_name && (
            <span className="font-medium text-gray-500">By {article.author.full_name} · </span>
          )}
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at)}
          </time>
        </p>
      </div>
    </article>
  )
}

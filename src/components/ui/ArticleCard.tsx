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
  if (variant === 'compact') {
    return (
      <article className="group flex gap-3 py-3 border-b border-granite-muted last:border-0">
        {article.hero_image_url && (
          <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt ?? article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.category && (
            <CategoryBadge
              name={article.category.name}
              href={`/category/${article.category.slug}`}
              className="mb-1"
            />
          )}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mt-0.5">
            <Link
              href={`/article/${article.slug}`}
              className="hover:text-granite-primary transition-colors"
            >
              {article.title}
            </Link>
          </h3>
          <p className="text-[11px] text-brand-muted mt-1">
            {article.author?.full_name && (
              <span className="font-medium text-gray-500">{article.author.full_name} · </span>
            )}
            {relativeTime(article.published_at)}
          </p>
        </div>
      </article>
    )
  }

  if (variant === 'hero') {
    return (
      <article className="relative bg-brand-dark text-white overflow-hidden group">
        {article.hero_image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt ?? article.title}
              fill
              className="object-cover opacity-70 group-hover:scale-[1.03] group-hover:opacity-80 transition-all duration-500 ease-out"
              priority={priority}
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {article.category && (
            <CategoryBadge
              name={article.category.name}
              href={`/category/${article.category.slug}`}
              variant="overlay"
              className="mb-2"
            />
          )}
          <h2 className="text-xl md:text-3xl font-bold leading-tight mb-2">
            <Link href={`/article/${article.slug}`} className="hover:underline underline-offset-2">
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
              <span className="text-gray-300 font-medium">{article.author.full_name} · </span>
            )}
            <time dateTime={article.published_at ?? undefined}>
              {relativeTime(article.published_at)}
            </time>
          </p>
        </div>
      </article>
    )
  }

  // Default card
  return (
    <article className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
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
          {/* Subtle hover overlay */}
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
        <h3 className="text-base font-bold leading-snug mb-1 group-hover:text-granite-primary transition-colors duration-200 line-clamp-2">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        {article.excerpt && (
          <p className="text-sm text-brand-muted line-clamp-2 mb-2 flex-1">{article.excerpt}</p>
        )}
        <p className="text-[11px] text-brand-muted mt-auto pt-1">
          {article.author?.full_name && (
            <span className="font-medium text-gray-500">{article.author.full_name} · </span>
          )}
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at)}
          </time>
        </p>
      </div>
    </article>
  )
}
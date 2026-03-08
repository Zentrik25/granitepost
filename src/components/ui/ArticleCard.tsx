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
      <article className="flex gap-3 py-3 border-b border-granite-muted last:border-0">
        {article.hero_image_url && (
          <div className="relative w-20 h-16 flex-shrink-0">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt ?? article.title}
              fill
              className="object-cover"
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
          <h3 className="text-sm font-semibold leading-snug line-clamp-3 mt-0.5">
            <Link href={`/article/${article.slug}`} className="hover:text-granite-primary">
              {article.title}
            </Link>
          </h3>
        </div>
      </article>
    )
  }

  if (variant === 'hero') {
    return (
      <article className="relative bg-brand-dark text-white overflow-hidden">
        {article.hero_image_url && (
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt ?? article.title}
              fill
              className="object-cover opacity-70"
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
            <Link href={`/article/${article.slug}`} className="hover:underline">
              {article.title}
            </Link>
          </h2>
          {article.excerpt && (
            <p className="text-sm text-gray-300 line-clamp-2 hidden md:block">
              {article.excerpt}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {relativeTime(article.published_at)}
          </p>
        </div>
      </article>
    )
  }

  // Default card
  return (
    <article className="group">
      {article.hero_image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden mb-3">
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      {article.category && (
        <CategoryBadge
          name={article.category.name}
          href={`/category/${article.category.slug}`}
          className="mb-1"
        />
      )}
      <h3 className="text-base md:text-lg font-bold leading-snug mt-1 mb-1 group-hover:text-granite-primary transition-colors line-clamp-3">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h3>
      {article.excerpt && (
        <p className="text-sm text-brand-muted line-clamp-2">{article.excerpt}</p>
      )}
      <p className="text-xs text-brand-muted mt-2">{relativeTime(article.published_at)}</p>
    </article>
  )
}

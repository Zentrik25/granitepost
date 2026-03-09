import Image from 'next/image'
import Link from 'next/link'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface Props {
  article: ArticleWithRelations
}

export function LatestUpdateCard({ article }: Props) {
  const href = `/article/${article.slug}`
  const category = article.category
  const author = article.author?.full_name

  return (
    <article className="relative flex gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

      {/* Cover link — makes entire card clickable */}
      <Link
        href={href}
        className="absolute inset-0 z-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Thumbnail */}
      <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-brand-canvas to-brand-border">
        {article.hero_image_url ? (
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-muted">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between min-w-0 flex-1">

        {/* Category badge */}
        {category && (
          <div className="mb-1.5">
            <CategoryBadge
              name={category.name}
              href={`/category/${category.slug}`}
              variant="default"
              size="sm"
            />
          </div>
        )}

        {/* Headline */}
        <Link
          href={href}
          className="font-semibold text-sm leading-snug line-clamp-2 text-brand-primary hover:text-brand-secondary transition-colors duration-150"
        >
          {article.title}
        </Link>

        {/* Meta */}
        <p className="mt-1.5 text-xs text-brand-muted truncate">
          {author && <span>By {author}</span>}
          {author && article.published_at && <span className="mx-1">·</span>}
          {article.published_at && (
            <time dateTime={article.published_at}>
              {relativeTime(article.published_at ?? null)}
            </time>
          )}
        </p>

      </div>
    </article>
  )
}

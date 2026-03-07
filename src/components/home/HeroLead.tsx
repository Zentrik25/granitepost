import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'

interface HeroLeadProps {
  article: ArticleWithRelations
}

// Full-bleed hero lead story — occupies the top-left of the homepage grid.
// Image is 16:9, headline is overlaid on a gradient.
export function HeroLead({ article }: HeroLeadProps) {
  return (
    <article className="relative bg-brand-dark text-white overflow-hidden group">
      {article.hero_image_url ? (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover opacity-75 group-hover:opacity-85 transition-opacity duration-300"
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-brand-dark" />
      )}

      {/* Gradient overlay + content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            className="inline-block self-start text-xs font-black bg-brand-red text-white px-2 py-0.5 uppercase tracking-widest mb-2 hover:bg-red-600"
          >
            {article.category.name}
          </Link>
        )}

        <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-2">
          <Link
            href={`/article/${article.slug}`}
            className="hover:underline underline-offset-2"
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt && (
          <p className="text-sm text-gray-300 line-clamp-2 mb-2 hidden md:block leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          {article.author?.full_name && (
            <span className="font-medium text-gray-300">{article.author.full_name}</span>
          )}
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at)}
          </time>
        </div>
      </div>
    </article>
  )
}

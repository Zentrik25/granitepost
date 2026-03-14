import Image from 'next/image'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils/slug'
import { HeroCarouselClient } from '@/components/home/v2/HeroCarouselClient'
import type { ArticleWithRelations } from '@/types'

interface HeroSectionProps {
  articles: ArticleWithRelations[]
}

function HeroPlaceholder() {
  return (
    <section aria-label="Featured stories" className="bg-gray-900">
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/30">
        <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 002-2V8a2 2 0 00-2-2h-5M9 10h6M9 14h4" />
        </svg>
        <p className="text-sm font-medium">No featured stories</p>
        <p className="text-xs text-white/20">Mark articles as Featured in the admin CMS</p>
      </div>
    </section>
  )
}

/** Desktop sidebar card — compact article row */
function SidebarCard({ article, index }: { article: ArticleWithRelations; index: number }) {
  return (
    <article className="group relative flex gap-3 border-b border-gray-800 p-3 last:border-0 hover:bg-gray-900/60 transition-colors duration-150">
      <Link href={`/article/${article.slug}`} className="absolute inset-0 z-0" aria-label={article.title} tabIndex={-1} />

      {/* Thumbnail */}
      {article.hero_image_url ? (
        <div className="relative w-[72px] h-[50px] flex-shrink-0 overflow-hidden rounded">
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="72px"
          />
        </div>
      ) : (
        <div className="w-[72px] h-[50px] flex-shrink-0 rounded bg-gray-800 flex items-center justify-center text-gray-600 text-lg font-bold">
          {index + 1}
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0 relative z-10">
        {article.category && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-0.5 block">
            {article.category.name}
          </span>
        )}
        <h3 className="text-[12px] font-bold leading-snug line-clamp-2 text-white group-hover:text-amber-300 transition-colors duration-150">
          <Link href={`/article/${article.slug}`} className="relative z-10">
            {article.title}
          </Link>
        </h3>
        <p className="text-[10px] text-white/40 mt-1">
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at ?? null)}
          </time>
        </p>
      </div>
    </article>
  )
}

export function HeroSection({ articles }: HeroSectionProps) {
  if (!articles.length) return <HeroPlaceholder />

  const sidebarArticles = articles.slice(1, 6)

  return (
    <section aria-label="Featured stories">
      {/* Mobile: full-width carousel (unchanged) */}
      <div className="md:hidden">
        <HeroCarouselClient articles={articles} />
      </div>

      {/* Desktop: auto-sliding carousel left + sidebar right */}
      <div className="hidden md:grid md:grid-cols-3 bg-gray-950">

        {/* Left — carousel takes up 2/3 */}
        <div className="md:col-span-2">
          <HeroCarouselClient articles={articles} desktop />
        </div>

        {/* Right — sidebar */}
        <div className="md:col-span-1 flex flex-col divide-y divide-gray-800 bg-gray-950 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
              More Top Stories
            </span>
          </div>
          {sidebarArticles.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-xs text-gray-600 p-4">
              No additional stories
            </div>
          ) : (
            sidebarArticles.map((article, i) => (
              <SidebarCard key={article.id} article={article} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

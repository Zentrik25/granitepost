import { HeroCarouselClient } from '@/components/home/v2/HeroCarouselClient'
import type { ArticleWithRelations } from '@/types'

interface HeroSectionProps {
  articles: ArticleWithRelations[]
}

function HeroPlaceholder() {
  return (
    <section aria-label="Featured stories" className="bg-gray-900">
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/30">
        <svg
          className="h-14 w-14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={0.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 002-2V8a2 2 0 00-2-2h-5M9 10h6M9 14h4"
          />
        </svg>
        <p className="text-sm font-medium">No featured stories</p>
        <p className="text-xs text-white/20">
          Mark articles as Featured in the admin CMS
        </p>
      </div>
    </section>
  )
}

export function HeroSection({ articles }: HeroSectionProps) {
  if (!articles.length) return <HeroPlaceholder />

  return (
    <section aria-label="Featured stories">
      <HeroCarouselClient articles={articles} />
    </section>
  )
}

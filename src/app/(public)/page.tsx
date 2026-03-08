import type { Metadata } from 'next'
import type { ArticleWithRelations } from '@/types'
import { BreakingBar } from '@/components/home/BreakingBar'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { TopStoriesGrid } from '@/components/home/TopStoriesGrid'
import { CategoryBlocks } from '@/components/home/CategoryBlocks'
import { LatestFeed } from '@/components/home/LatestFeed'
import { MostReadList } from '@/components/home/MostReadList'
import { NewsletterBanner } from '@/components/home/NewsletterBanner'
import { ArticleCard } from '@/components/ui/ArticleCard'
import {
  getBreakingNews,
  getHeroArticle,
  getTopStories,
  getMostReadArticles,
  getCategoryBlocks,
  getLatestFeed,
} from '@/lib/db/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Zimbabwe News Online — Breaking News & In-depth Coverage',
  description:
    'The latest breaking news from Zimbabwe and across Africa. Politics, business, sport, entertainment and more.',
}

export default async function HomePage() {
  const [breaking, hero, topStories, mostRead, categoryBlocks] = await Promise.all([
    getBreakingNews(),
    getHeroArticle(),
    getTopStories(12),
    getMostReadArticles(5),
    getCategoryBlocks(4, 3),
  ])

  // Build hero carousel slides: hero article + image-bearing top stories (max 4 total)
  const heroSlides: ArticleWithRelations[] = [
    ...(hero ? [hero] : []),
    ...topStories.filter((a) => a.hero_image_url && a.id !== hero?.id),
  ].slice(0, 4)

  // IDs already shown in hero carousel — exclude from top stories sidebar
  const heroSlideIds = new Set(heroSlides.map((a) => a.id))
  const filteredTopStories = topStories.filter((a) => !heroSlideIds.has(a.id))

  // Collect all displayed IDs to deduplicate latest feed
  const usedIds = new Set<string>()
  for (const a of heroSlides) usedIds.add(a.id)
  for (const a of breaking) usedIds.add(a.id)
  for (const a of topStories) usedIds.add(a.id)
  for (const b of categoryBlocks) for (const a of b.articles) usedIds.add(a.id)

  const latestFeed = await getLatestFeed(Array.from(usedIds), 12)

  return (
    <>
      {/* 1. Breaking news bar */}
      <BreakingBar articles={breaking} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {/* 2. Hero carousel + compact top-stories sidebar */}
        {(heroSlides.length > 0 || filteredTopStories.length > 0) && (
          <section aria-label="Lead story" className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
            {heroSlides.length > 0 && (
              <div className="lg:col-span-2">
                <HeroCarousel articles={heroSlides} />
              </div>
            )}
            <div className="border-t lg:border-t-0 lg:border-l border-brand-border pt-4 lg:pt-0 lg:pl-6 mt-4 lg:mt-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted border-b border-brand-border pb-2 mb-3">
                Top Stories
              </h2>
              <div className="space-y-2">
                {filteredTopStories.slice(0, 5).map((article: ArticleWithRelations) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. Top stories grid (remaining, deduplicated) */}
        {filteredTopStories.length > 5 && (
          <TopStoriesGrid articles={filteredTopStories.slice(5, 11)} />
        )}

        {/* 4. Newsletter banner */}
        <NewsletterBanner />

        {/* 5. Most read + 6. Category blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CategoryBlocks blocks={categoryBlocks} limitPerBlock={4} />
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-32">
              <MostReadList articles={mostRead} />
            </div>
          </aside>
        </div>

        {/* 7. Latest news feed — deduplicated */}
        <LatestFeed articles={latestFeed} hasMore={false} />
      </div>
    </>
  )
}
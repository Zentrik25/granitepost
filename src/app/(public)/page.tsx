import type { Metadata } from 'next'
import type { ArticleWithRelations } from '@/types'
import { BreakingBar } from '@/components/home/BreakingBar'
import { HeroLead } from '@/components/home/HeroLead'
import { TopStoriesGrid } from '@/components/home/TopStoriesGrid'
import { CategoryBlocks } from '@/components/home/CategoryBlocks'
import { LatestFeed } from '@/components/home/LatestFeed'
import { MostReadList } from '@/components/home/MostReadList'
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
  // All independent queries run in one parallel wave.
  // getCategoryBlocks previously awaited after this block — it has no dependency
  // on breaking/hero/topStories/mostRead so it now runs at the same time.
  const [breaking, hero, topStories, mostRead, categoryBlocks] = await Promise.all([
    getBreakingNews(),
    getHeroArticle(),
    getTopStories(9),
    getMostReadArticles(5),
    getCategoryBlocks(4, 3),
  ])

  // Collect all IDs already shown to avoid duplication in the latest feed.
  const usedIds = new Set<string>()
  if (hero) usedIds.add(hero.id)
  for (const a of breaking) usedIds.add(a.id)
  for (const a of topStories) usedIds.add(a.id)
  for (const b of categoryBlocks) for (const a of b.articles) usedIds.add(a.id)

  const latestFeed = await getLatestFeed(Array.from(usedIds), 12)

  return (
    <>
      {/* 1. Breaking news bar */}
      <BreakingBar articles={breaking} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {/* 2. Hero lead + compact top-stories sidebar */}
        {(hero || topStories.length > 0) && (
          <section aria-label="Lead story" className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
            {hero && (
              <div className="lg:col-span-2">
                <HeroLead article={hero} />
              </div>
            )}
            <div className="border-t lg:border-t-0 lg:border-l border-brand-border pt-4 lg:pt-0 lg:pl-6 mt-4 lg:mt-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted border-b border-brand-border pb-2 mb-0">
                Top Stories
              </h2>
              {topStories.slice(0, 5).map((article: ArticleWithRelations) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* 3. Top stories grid */}
        {topStories.length > 0 && (
          <TopStoriesGrid articles={topStories.slice(0, 6)} />
        )}

        {/* 4. Most read + 5. Category blocks */}
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

        {/* 6. Latest news feed — deduplicated */}
        <LatestFeed articles={latestFeed} hasMore={false} />
      </div>
    </>
  )
}
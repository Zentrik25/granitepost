import type { Metadata } from 'next'
import { BreakingTicker } from '@/components/home/v2/BreakingTicker'
import { HeroSection } from '@/components/home/v2/HeroSection'
import { TopStoriesSection } from '@/components/home/v2/TopStoriesSection'
import { MostReadSidebar } from '@/components/home/v2/MostReadSidebar'
import { EditorialSection } from '@/components/home/v2/EditorialSection'
import { LatestFeedSection } from '@/components/home/v2/LatestFeedSection'
import { NewsletterSection } from '@/components/home/v2/NewsletterSection'
import { ArticleCard } from '@/components/ui/ArticleCard'
import {
  getBreakingNews,
  getFeaturedArticles,
  getTopStories,
  getMostReadArticles,
  getCategoryBlocks,
  getLatestFeed,
} from '@/lib/db/queries'
import { getSiteSettings } from '@/lib/settings/queries'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = `${settings.site_name} — Breaking News & In-depth Coverage`
  const description = settings.site_description

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_ZW',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

const jsonLd = (siteName: string, siteDescription: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': '/#webpage',
      url: '/',
      name: `${siteName} — Breaking News`,
      description: siteDescription,
      inLanguage: 'en',
    },
    {
      '@type': 'Organization',
      '@id': '/#organization',
      name: siteName,
      url: '/',
      sameAs: [],
    },
  ],
})

export default async function HomePage() {
  // ── Wave 1: all independent ──────────────────────────────────────────────────
  const [breaking, heroSlides, topStories, mostRead, categoryBlocks, settings] =
    await Promise.all([
      getBreakingNews(),
      getFeaturedArticles(4),
      getTopStories(18),
      getMostReadArticles(5),
      getCategoryBlocks(4, 3),
      getSiteSettings(),
    ])

  // IDs in hero — exclude from top stories
  const heroIds = new Set(heroSlides.map((a) => a.id))
  const topStoriesFiltered = topStories.filter((a) => !heroIds.has(a.id))

  // ── Wave 2: Latest News (excludes hero + top stories) ───────────────────────
  const latestExclude = [
    ...heroSlides.map((a) => a.id),
    ...topStories.map((a) => a.id),
  ]
  const latestNews = await getLatestFeed(latestExclude, 8)

  // ── Wave 3: Bottom feed (excludes everything above) ─────────────────────────
  const allUsed = [
    ...latestExclude,
    ...latestNews.map((a) => a.id),
    ...breaking.map((a) => a.id),
    ...categoryBlocks.flatMap((b) => b.articles.map((a) => a.id)),
  ]
  const latestFeed = await getLatestFeed(allUsed, 8)

  const ld = jsonLd(settings.site_name, settings.site_description)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* 1. Breaking ticker */}
      <BreakingTicker articles={breaking} />

      {/* 2. Hero */}
      <HeroSection articles={heroSlides} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* 3. Top Stories grid */}
        {topStoriesFiltered.length > 0 && (
          <TopStoriesSection articles={topStoriesFiltered.slice(0, 6)} />
        )}

        {/* 4. Most Read sidebar + Category editorial (2-col on lg) */}
        {(mostRead.length > 0 || categoryBlocks.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category editorial blocks — 3 cols */}
            {categoryBlocks.length > 0 && (
              <div className="lg:col-span-3 min-w-0">
                <EditorialSection blocks={categoryBlocks} />
              </div>
            )}

            {/* Most Read sidebar — 1 col */}
            {mostRead.length > 0 && (
              <aside className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <MostReadSidebar articles={mostRead} />
                </div>
              </aside>
            )}
          </div>
        )}

        {/* 5. Newsletter */}
        <NewsletterSection />

        {/* 6. Latest News 4-col grid */}
        {latestNews.length > 0 && (
          <LatestFeedSection articles={latestNews} />
        )}

        {/* 7. Bottom feed */}
        {latestFeed.length > 0 && (
          <section aria-label="More stories">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-900">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                More Stories
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestFeed.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

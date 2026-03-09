import type { Metadata } from 'next'

import { BreakingTicker } from '@/components/home/v2/BreakingTicker'
import { HeroSection } from '@/components/home/v2/HeroSection'
import { TopStoriesSection } from '@/components/home/v2/TopStoriesSection'
import { MostReadSidebar } from '@/components/home/v2/MostReadSidebar'
import { EditorialSection } from '@/components/home/v2/EditorialSection'
import { LatestFeedSection } from '@/components/home/v2/LatestFeedSection'
import { LatestUpdatesSection } from '@/components/home/v2/LatestUpdatesSection'
import { NewsletterSection } from '@/components/home/v2/NewsletterSection'
import { ArticleCard } from '@/components/ui/ArticleCard'

import {
  getBreakingNews,
  getFeaturedArticles,
  getTopStories,
  getMostReadArticles,
  getCategoryBlocks,
  getLatestFeed
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
      locale: 'en_ZW'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
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
      inLanguage: 'en'
    },
    {
      '@type': 'Organization',
      '@id': '/#organization',
      name: siteName,
      url: '/'
    }
  ]
})

export default async function HomePage() {

  const [
    breaking,
    heroSlides,
    topStories,
    mostRead,
    categoryBlocks,
    settings
  ] = await Promise.all([
    getBreakingNews(),
    getFeaturedArticles(4),
    getTopStories(18),
    getMostReadArticles(6),
    getCategoryBlocks(4, 5),
    getSiteSettings()
  ])

  /* ───────────────────────────── */
  /* GLOBAL EXCLUSION SET          */
  /* ───────────────────────────── */

  const usedIds = new Set<string>()

  /* HERO */

  heroSlides.forEach(a => usedIds.add(a.id))

  /* TOP STORIES */

  const filteredTopStories = topStories.filter(a => !usedIds.has(a.id)).slice(0,6)
  filteredTopStories.forEach(a => usedIds.add(a.id))

  /* CATEGORY BLOCKS */

  const cleanedCategoryBlocks = categoryBlocks.map(block => {

    const filtered = block.articles.filter(a => !usedIds.has(a.id)).slice(0,5)

    filtered.forEach(a => usedIds.add(a.id))

    return {
      ...block,
      articles: filtered
    }

  })

  /* MOST READ */

  mostRead.forEach(a => usedIds.add(a.article_id))

  /* ───────────────────────────── */
  /* LATEST UPDATES SECTION        */
  /* ───────────────────────────── */

  const latestUpdates = await getLatestFeed(
    Array.from(usedIds),
    7
  )

  latestUpdates.forEach(a => usedIds.add(a.id))

  /* ───────────────────────────── */
  /* LATEST NEWS FEED              */
  /* ───────────────────────────── */

  const latestNews = await getLatestFeed(
    Array.from(usedIds),
    12
  )

  latestNews.forEach(a => usedIds.add(a.id))

  /* ───────────────────────────── */
  /* MORE STORIES                  */
  /* ───────────────────────────── */

  const moreStories = await getLatestFeed(
    Array.from(usedIds),
    12
  )

  const ld = jsonLd(settings.site_name, settings.site_description)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <BreakingTicker articles={breaking} />

      <HeroSection articles={heroSlides} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">

        {filteredTopStories.length > 0 && (
          <TopStoriesSection articles={filteredTopStories} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          <div className="lg:col-span-3 min-w-0">
            <EditorialSection blocks={cleanedCategoryBlocks} />
          </div>

          <aside className="lg:col-span-1">

            <div className="lg:sticky lg:top-24 space-y-8">

              <MostReadSidebar articles={mostRead} />

            </div>

          </aside>

        </div>

        {/* Latest Updates — compact horizontal card feed */}
        <LatestUpdatesSection articles={latestUpdates} />

        <NewsletterSection />

        {latestNews.length > 0 && (
          <LatestFeedSection articles={latestNews} />
        )}

        {moreStories.length > 0 && (

          <section aria-label="More stories">

            <div className="flex items-center gap-3 mb-5 pb-2 border-b-2 border-brand-primary">

              <h2 className="text-xs font-black uppercase tracking-widest text-brand-dark">
                More Stories
              </h2>

              <div className="flex-1 h-px bg-brand-border" />

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {moreStories.map(article => (

                <ArticleCard
                  key={article.id}
                  article={article}
                />

              ))}

            </div>

          </section>

        )}

      </div>
    </>
  )
}
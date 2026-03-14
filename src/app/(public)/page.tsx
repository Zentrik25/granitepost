import type { Metadata } from 'next'

import { BreakingTicker } from '@/components/home/v2/BreakingTicker'
import { HeroSection } from '@/components/home/v2/HeroSection'
import { TopStoriesSection } from '@/components/home/v2/TopStoriesSection'
import { LatestUpdatesSection } from '@/components/home/v2/LatestUpdatesSection'
import { EditorialSection } from '@/components/home/v2/EditorialSection'
import { TrendingSection } from '@/components/home/v2/TrendingSection'
import { MostReadSection } from '@/components/home/v2/MostReadSection'
import { SportsSection } from '@/components/home/v2/SportsSection'
import { BusinessSection } from '@/components/home/v2/BusinessSection'
import { OpinionSection } from '@/components/home/v2/OpinionSection'
import { LatestFeedSection } from '@/components/home/v2/LatestFeedSection'
import { NewsletterSection } from '@/components/home/v2/NewsletterSection'

import {
  getBreakingNews,
  getFeaturedArticles,
  getTopStories,
  getMostReadArticles,
  getTrendingArticles,
  getCategoryBlocks,
  getLatestFeed,
  getArticlesByCategory,
} from '@/lib/db/queries'

import { SITE_URL, SITE_NAME } from '@/lib/constants'
import { buildWebSiteSchema, toJsonLd } from '@/lib/seo/schema'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const title = `${SITE_NAME} — Breaking Zimbabwe News & In-Depth Coverage`
  const description =
    'The Granite Post delivers breaking Zimbabwe news, in-depth political reporting, business, sport and technology coverage — trusted by readers at home and across the diaspora.'

  return {
    title,
    description,
    alternates: { canonical: SITE_URL },
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
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: `${siteName} — Breaking News`,
      description: siteDescription,
      inLanguage: 'en-ZW',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: siteName,
      url: SITE_URL,
    },
  ],
})

export default async function HomePage() {
  const [
    breaking,
    heroSlides,
    topStories,
    mostRead24h,
    trendingArticles,
    categoryBlocks,
    opinionResult,
    sportsResult,
    businessResult,
  ] = await Promise.all([
    getBreakingNews(),
    getFeaturedArticles(4),
    getTopStories(18),
    getMostReadArticles(6),
    getTrendingArticles(6),
    getCategoryBlocks(4, 5, ['sport', 'business', 'opinion']),
    getArticlesByCategory('opinion', 1, 3),
    getArticlesByCategory('sport', 1, 5),
    getArticlesByCategory('business', 1, 5),
  ])

  const usedIds = new Set<string>()

  heroSlides.forEach((a) => usedIds.add(a.id))

  const filteredTopStories = topStories
    .filter((a) => !usedIds.has(a.id))
    .slice(0, 6)

  filteredTopStories.forEach((a) => usedIds.add(a.id))

  const cleanedCategoryBlocks = categoryBlocks.map((block) => {
    const filtered = block.articles
      .filter((a) => !usedIds.has(a.id))
      .slice(0, 5)

    filtered.forEach((a) => usedIds.add(a.id))

    return {
      ...block,
      articles: filtered,
    }
  })

  mostRead24h.forEach((a) => usedIds.add(a.article_id))
  trendingArticles.forEach((a) => usedIds.add(a.id))

  const sportsArticles = (sportsResult.data ?? []).filter(
    (a) => !usedIds.has(a.id)
  )
  sportsArticles.forEach((a) => usedIds.add(a.id))

  const businessArticles = (businessResult.data ?? []).filter(
    (a) => !usedIds.has(a.id)
  )
  businessArticles.forEach((a) => usedIds.add(a.id))

  const opinionArticles = (opinionResult.data ?? []).filter(
    (a) => !usedIds.has(a.id)
  )
  opinionArticles.forEach((a) => usedIds.add(a.id))

  // Single combined latest feed — slice in JS to avoid 2 sequential DB calls
  const latestFeedRaw = await getLatestFeed(Array.from(usedIds), 19)
  const latestUpdates = latestFeedRaw.slice(0, 7)
  const latestNews = latestFeedRaw.slice(7)

  const description =
    'The Granite Post delivers breaking Zimbabwe news, in-depth political reporting, business, sport and technology coverage — trusted by readers at home and across the diaspora.'
  const ld = jsonLd(SITE_NAME, description)
  const websiteSchema = buildWebSiteSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(websiteSchema) }}
      />

      <BreakingTicker articles={breaking} />

      <HeroSection articles={heroSlides} />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10">
        {filteredTopStories.length > 0 && (
          <TopStoriesSection articles={filteredTopStories} />
        )}

        <LatestUpdatesSection articles={latestUpdates} />

        {cleanedCategoryBlocks.some((b) => b.articles.length > 0) && (
          <EditorialSection blocks={cleanedCategoryBlocks} />
        )}

        {(trendingArticles.length > 0 || mostRead24h.length > 0) && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <TrendingSection articles={trendingArticles} />
            <MostReadSection articles={mostRead24h} />
          </div>
        )}

        {(sportsArticles.length > 0 || businessArticles.length > 0) && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <SportsSection articles={sportsArticles} />
            <BusinessSection articles={businessArticles} />
          </div>
        )}

        <OpinionSection articles={opinionArticles} />

        {latestNews.length > 0 && (
          <LatestFeedSection articles={latestNews} />
        )}

        <NewsletterSection />
      </div>
    </>
  )
}

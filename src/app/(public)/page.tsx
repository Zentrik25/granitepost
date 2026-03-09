import type { Metadata } from 'next'

import { BreakingTicker }      from '@/components/home/v2/BreakingTicker'
import { HeroSection }         from '@/components/home/v2/HeroSection'
import { TopStoriesSection }   from '@/components/home/v2/TopStoriesSection'
import { LatestUpdatesSection } from '@/components/home/v2/LatestUpdatesSection'
import { EditorialSection }    from '@/components/home/v2/EditorialSection'
import { TrendingSection }     from '@/components/home/v2/TrendingSection'
import { MostReadSection }     from '@/components/home/v2/MostReadSection'
import { OpinionSection }      from '@/components/home/v2/OpinionSection'
import { LatestFeedSection }   from '@/components/home/v2/LatestFeedSection'
import { NewsletterSection }   from '@/components/home/v2/NewsletterSection'
import { ArticleCard }         from '@/components/ui/ArticleCard'

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
    openGraph: { title, description, type: 'website', locale: 'en_ZW' },
    twitter: { card: 'summary_large_image', title, description },
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
    },
  ],
})

export default async function HomePage() {

  // ── Wave 1: Parallel fetch — all above-the-fold data ──────────────────────
  const [
    breaking,
    heroSlides,
    topStories,
    mostRead24h,
    trendingArticles,
    categoryBlocks,
    opinionResult,
    settings,
  ] = await Promise.all([
    getBreakingNews(),
    getFeaturedArticles(4),
    getTopStories(18),
    getMostReadArticles(6),          // 24-hour most read
    getTrendingArticles(6),          // top by view count
    getCategoryBlocks(4, 5),
    getArticlesByCategory('opinion', 1, 3),
    getSiteSettings(),
  ])

  // ── Global deduplication set ───────────────────────────────────────────────
  const usedIds = new Set<string>()

  // 1. Hero
  heroSlides.forEach(a => usedIds.add(a.id))

  // 2. Top Stories (filtered to 6, heroes excluded)
  const filteredTopStories = topStories.filter(a => !usedIds.has(a.id)).slice(0, 6)
  filteredTopStories.forEach(a => usedIds.add(a.id))

  // 3. Category blocks (each filtered against prior sections)
  const cleanedCategoryBlocks = categoryBlocks.map(block => {
    const filtered = block.articles.filter(a => !usedIds.has(a.id)).slice(0, 5)
    filtered.forEach(a => usedIds.add(a.id))
    return { ...block, articles: filtered }
  })

  // 4. Opinion articles
  const opinionArticles = (opinionResult.data ?? []).filter(a => !usedIds.has(a.id))
  opinionArticles.forEach(a => usedIds.add(a.id))

  // 5. Most read / trending
  mostRead24h.forEach(a => usedIds.add(a.article_id))
  trendingArticles.forEach(a => usedIds.add(a.id))

  // ── Wave 2: Sequential — below-the-fold feeds ──────────────────────────────

  // Latest Updates (7 compact cards)
  const latestUpdates = await getLatestFeed(Array.from(usedIds), 7)
  latestUpdates.forEach(a => usedIds.add(a.id))

  // Latest News grid
  const latestNews = await getLatestFeed(Array.from(usedIds), 12)
  latestNews.forEach(a => usedIds.add(a.id))

  // More Stories
  const moreStories = await getLatestFeed(Array.from(usedIds), 12)

  const ld = jsonLd(settings.site_name, settings.site_description)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* ── 1. Breaking News Ticker ──────────────────────────────────────── */}
      <BreakingTicker articles={breaking} />

      {/* ── 2. Hero Section ──────────────────────────────────────────────── */}
      <HeroSection articles={heroSlides} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">

        {/* ── 3. Top Stories ───────────────────────────────────────────── */}
        {filteredTopStories.length > 0 && (
          <TopStoriesSection articles={filteredTopStories} />
        )}

        {/* ── 4. Latest Updates (compact horizontal feed) ──────────────── */}
        <LatestUpdatesSection articles={latestUpdates} />

        {/* ── 5. Category Editorial Blocks ─────────────────────────────── */}
        {cleanedCategoryBlocks.some(b => b.articles.length > 0) && (
          <EditorialSection blocks={cleanedCategoryBlocks} />
        )}

        {/* ── 6 & 7. Trending Now + Most Read (side by side) ───────────── */}
        {(trendingArticles.length > 0 || mostRead24h.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <TrendingSection articles={trendingArticles} />
            <MostReadSection articles={mostRead24h} />
          </div>
        )}

        {/* ── 8. Opinion & Analysis ────────────────────────────────────── */}
        <OpinionSection articles={opinionArticles} />

        {/* ── 9. Latest News ───────────────────────────────────────────── */}
        {latestNews.length > 0 && (
          <LatestFeedSection articles={latestNews} />
        )}

        {/* ── 10. More Stories ─────────────────────────────────────────── */}
        {moreStories.length > 0 && (
          <section aria-label="More stories">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-primary whitespace-nowrap">
                More Stories
              </h2>
              <div className="flex-1 border-b-2 border-brand-primary" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moreStories.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* ── 11. Newsletter ───────────────────────────────────────────── */}
        <NewsletterSection />

      </div>
    </>
  )
}

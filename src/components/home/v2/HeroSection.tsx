import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'
import { HeroCarouselClient } from '@/components/home/v2/HeroCarouselClient'

interface HeroSectionProps {
  articles: ArticleWithRelations[]
}

function CategoryPill({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/category/${slug}`}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white bg-amber-500 hover:bg-amber-400 transition-colors shadow-sm"
    >
      {name}
    </Link>
  )
}

/** Placeholder when no featured articles are marked */
function HeroPlaceholder() {
  return (
    <section aria-label="Featured stories" className="bg-gray-900 rounded-none">
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/30">
        <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 002-2V8a2 2 0 00-2-2h-5M9 10h6M9 14h4" />
        </svg>
        <p className="text-sm font-medium">No featured stories</p>
        <p className="text-xs text-white/20">Mark articles as Featured in the admin CMS</p>
      </div>
    </section>
  )
}

/**
 * Hero section — up to 4 featured articles.
 *
 * Desktop (md+): large main card on the left (2/3) + 3 stacked secondary on the right (1/3).
 * Mobile: client carousel with swipe gestures + auto-slide (hidden on md+).
 */
export function HeroSection({ articles }: HeroSectionProps) {
  if (!articles.length) return <HeroPlaceholder />

  const [main, ...rest] = articles
  const secondary = rest.slice(0, 3)

  return (
    <section aria-label="Featured stories">
      {/* ── Mobile carousel (hidden md+) ── */}
      <div className="md:hidden">
        <HeroCarouselClient articles={articles} />
      </div>

      {/* ── Desktop grid (hidden below md) ── */}
      <div className="hidden md:grid md:grid-cols-3 gap-0 bg-gray-950">
        {/* Main card — 2 cols */}
        <div className="md:col-span-2 relative overflow-hidden group">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {main.hero_image_url ? (
              <Image
                src={main.hero_image_url}
                alt={main.hero_image_alt ?? main.title}
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                sizes="(max-width: 1280px) 66vw, 853px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" aria-hidden="true" />
            )}

            {/* Strong gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.05) 100%)' }}
              aria-hidden="true"
            />

            {/* Category badge — top-left */}
            {main.category && (
              <div className="absolute top-4 left-4 z-10">
                <CategoryPill name={main.category.name} slug={main.category.slug} />
              </div>
            )}

            {/* Content overlay — bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight mb-3">
                <Link
                  href={`/article/${main.slug}`}
                  className="hover:underline underline-offset-2 decoration-white/40"
                >
                  {main.title}
                </Link>
              </h2>
              {main.excerpt && (
                <p className="text-sm text-white/70 leading-relaxed line-clamp-2 mb-3 hidden lg:block">
                  {main.excerpt}
                </p>
              )}
              <p className="text-xs text-white/50">
                {main.author?.full_name && (
                  <span className="text-white/70 font-medium">{main.author.full_name} · </span>
                )}
                <time dateTime={main.published_at ?? undefined}>{relativeTime(main.published_at)}</time>
              </p>
            </div>
          </div>
        </div>

        {/* Secondary cards — 1 col, 3 stacked */}
        <div className="md:col-span-1 flex flex-col divide-y divide-gray-800 bg-gray-950">
          {secondary.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
              No additional stories
            </div>
          ) : (
            secondary.map((article) => (
              <article
                key={article.id}
                className="flex-1 relative group overflow-hidden min-h-[120px]"
              >
                {article.hero_image_url && (
                  <>
                    <Image
                      src={article.hero_image_url}
                      alt={article.hero_image_alt ?? article.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out brightness-50 group-hover:brightness-[0.55]"
                      sizes="33vw"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)' }}
                      aria-hidden="true"
                    />
                  </>
                )}
                {!article.hero_image_url && (
                  <div className="absolute inset-0 bg-gray-900" aria-hidden="true" />
                )}

                <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                  {article.category && (
                    <span className="inline-flex self-start items-center mb-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-amber-400 bg-amber-400/15">
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-3">
                    <Link
                      href={`/article/${article.slug}`}
                      className="hover:underline underline-offset-1 decoration-white/40"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-white/45 mt-1.5">
                    <time dateTime={article.published_at ?? undefined}>
                      {relativeTime(article.published_at)}
                    </time>
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

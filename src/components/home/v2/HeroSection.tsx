import Image from 'next/image'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils/slug'
import { HeroCarouselClient } from '@/components/home/v2/HeroCarouselClient'
import type { ArticleWithRelations } from '@/types'

interface HeroSectionProps {
  articles: ArticleWithRelations[]
}

function CategoryPill({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/category/${slug}`}
      className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-amber-400"
    >
      {name}
    </Link>
  )
}

function HeroPlaceholder() {
  return (
    <section aria-label="Featured stories" className="rounded-none bg-gray-900">
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

  const [main, ...rest] = articles
  const secondary = rest.slice(0, 3)

  return (
    <section aria-label="Featured stories">
      <div className="md:hidden">
        <HeroCarouselClient articles={articles} />
      </div>

      <div className="hidden gap-0 bg-gray-950 md:grid md:grid-cols-3">
        <div className="group relative overflow-hidden md:col-span-2">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {main.hero_image_url ? (
              <Image
                src={main.hero_image_url}
                alt={main.hero_image_alt ?? main.title}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1280px) 66vw, 853px"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"
                aria-hidden="true"
              />
            )}

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.05) 100%)',
              }}
              aria-hidden="true"
            />

            {main.category && (
              <div className="absolute left-4 top-4 z-10">
                <CategoryPill
                  name={main.category.name}
                  slug={main.category.slug}
                />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
              <h2 className="mb-3 text-2xl font-black leading-tight text-white lg:text-3xl xl:text-4xl">
                <Link
                  href={`/article/${main.slug}`}
                  className="underline-offset-2 decoration-white/40 hover:underline"
                >
                  {main.title}
                </Link>
              </h2>

              {main.excerpt && (
                <p className="mb-3 hidden line-clamp-2 text-sm leading-relaxed text-white/70 lg:block">
                  {main.excerpt}
                </p>
              )}

              <p className="text-xs text-white/50">
                {main.author?.full_name && (
                  <span className="font-medium text-white/70">
                    {main.author.full_name} ·{' '}
                  </span>
                )}
                <time dateTime={main.published_at ?? undefined}>
                  {relativeTime(main.published_at ?? null)}
                </time>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-gray-800 bg-gray-950 md:col-span-1">
          {secondary.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-600">
              No additional stories
            </div>
          ) : (
            secondary.map((article) => (
              <article
                key={article.id}
                className="group relative min-h-[120px] flex-1 overflow-hidden"
              >
                {article.hero_image_url ? (
                  <>
                    <Image
                      src={article.hero_image_url}
                      alt={article.hero_image_alt ?? article.title}
                      fill
                      className="object-cover brightness-50 transition-transform duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-[0.55]"
                      sizes="33vw"
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
                      }}
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0 bg-gray-900"
                    aria-hidden="true"
                  />
                )}

                <div className="absolute inset-0 z-10 flex flex-col justify-end p-4">
                  {article.category && (
                    <span className="mb-1.5 inline-flex self-start rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400">
                      {article.category.name}
                    </span>
                  )}

                  <h3 className="line-clamp-3 text-[13px] font-bold leading-snug text-white">
                    <Link
                      href={`/article/${article.slug}`}
                      className="underline-offset-1 decoration-white/40 hover:underline"
                    >
                      {article.title}
                    </Link>
                  </h3>

                  <p className="mt-1.5 text-[11px] text-white/45">
                    <time dateTime={article.published_at ?? undefined}>
                      {relativeTime(article.published_at ?? null)}
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
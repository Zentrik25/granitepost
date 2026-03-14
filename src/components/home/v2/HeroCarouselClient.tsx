'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils/slug'
import type { ArticleWithRelations } from '@/types'

interface HeroCarouselClientProps {
  articles: ArticleWithRelations[]
  /** When true: 16/9 ratio, used inside the desktop split layout */
  desktop?: boolean
}

const SWIPE_THRESHOLD = 50
const SLIDE_INTERVAL = 6000

export function HeroCarouselClient({ articles, desktop = false }: HeroCarouselClientProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const count = articles.length

  const goTo = useCallback(
    (i: number) => setCurrent(((i % count) + count) % count),
    [count]
  )
  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (count <= 1 || paused) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % count), SLIDE_INTERVAL)
    return () => clearInterval(id)
  }, [count, paused])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) >= SWIPE_THRESHOLD) delta > 0 ? next() : prev()
    touchStartX.current = null
  }

  const article = articles[current]
  if (!article) return null

  return (
    <div
      className={`relative w-full overflow-hidden bg-gray-950 ${desktop ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured stories"
    >
      {/* Slides */}
      {articles.map((a, i) => (
        <div
          key={a.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
          aria-hidden={i !== current}
        >
          {a.hero_image_url ? (
            <Image
              src={a.hero_image_url}
              alt={a.hero_image_alt ?? a.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes={desktop ? '66vw' : '100vw'}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950" />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Progress bar */}
      {count > 1 && (
        <div className="absolute top-0 left-0 right-0 z-40 flex h-[3px] gap-0.5">
          {articles.map((_, i) => (
            <div key={i} className="flex-1 overflow-hidden bg-white/20">
              <div
                className={`h-full bg-amber-400 ${i === current ? 'animate-progress' : i < current ? 'w-full' : 'w-0'}`}
                style={i === current && !paused ? { animationDuration: `${SLIDE_INTERVAL}ms` } : {}}
              />
            </div>
          ))}
        </div>
      )}

      {/* Category pill */}
      {article.category && (
        <Link
          href={`/category/${article.category.slug}`}
          className="absolute left-4 top-5 z-30 inline-flex items-center rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow transition-colors hover:bg-amber-400"
        >
          {article.category.name}
        </Link>
      )}

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6">
        <h2 className="mb-2 text-xl font-black leading-tight text-white drop-shadow-sm md:text-2xl lg:text-3xl">
          <Link
            href={`/article/${article.slug}`}
            className="hover:underline underline-offset-2 decoration-white/40"
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt && (
          <p className="mb-2 hidden line-clamp-2 text-sm leading-relaxed text-white/70 md:block">
            {article.excerpt}
          </p>
        )}

        <p className="text-xs text-white/55">
          {article.author?.full_name && (
            <span className="font-medium text-white/80">
              By {article.author.full_name} ·{' '}
            </span>
          )}
          <time dateTime={article.published_at ?? undefined}>
            {relativeTime(article.published_at ?? null)}
          </time>
        </p>
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous story"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next story"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-3 right-3 z-40 flex items-center gap-1.5">
          {articles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full shadow transition-all duration-300 focus:outline-none ${
                i === current ? 'h-2 w-5 bg-amber-400' : 'h-2 w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to story ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

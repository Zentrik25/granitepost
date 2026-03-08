'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'

interface HeroCarouselClientProps {
  articles: ArticleWithRelations[]
}

const SWIPE_THRESHOLD = 50

export function HeroCarouselClient({ articles }: HeroCarouselClientProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const count = articles.length

  const goTo = useCallback((i: number) => setCurrent(((i % count) + count) % count), [count])
  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (count <= 1 || paused) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % count), 6000)
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

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '16/9', background: '#0D1117' }}
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
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={i !== current}
        >
          {a.hero_image_url && (
            <Image
              src={a.hero_image_url}
              alt={a.hero_image_alt ?? a.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.05) 100%)' }}
        aria-hidden="true"
      />

      {/* Category badge — top-left */}
      {article.category && (
        <Link
          href={`/category/${article.category.slug}`}
          className="absolute top-3 left-3 z-30 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide text-white bg-amber-500 hover:bg-amber-400 shadow-sm transition-colors"
        >
          {article.category.name}
        </Link>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
        <h2 className="text-[18px] sm:text-2xl font-black text-white leading-tight mb-2 drop-shadow-sm">
          <Link href={`/article/${article.slug}`} className="hover:underline underline-offset-2">
            {article.title}
          </Link>
        </h2>
        <p className="text-xs text-white/60">
          {article.author?.full_name && (
            <span className="text-white/80 font-medium">{article.author.full_name} · </span>
          )}
          <time dateTime={article.published_at ?? undefined}>{relativeTime(article.published_at)}</time>
        </p>
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 flex items-center justify-center text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Previous story">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 flex items-center justify-center text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Next story">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-3 right-4 z-40 flex gap-1.5 items-center">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 focus:outline-none shadow-sm ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to story ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

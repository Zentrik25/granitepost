'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'
import { relativeTime } from '@/lib/utils/slug'
import { CategoryBadge } from '@/components/ui/CategoryBadge'

interface HeroCarouselProps {
  articles: ArticleWithRelations[]
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = articles.length

  const goTo = useCallback(
    (index: number) => setCurrent(((index % count) + count) % count),
    [count]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (count <= 1 || paused) return
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % count), 6000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [count, paused])

  if (count === 0) return null

  const article = articles[current]

  return (
    <div
      className="relative bg-brand-dark text-white overflow-hidden group/carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured stories carousel"
      aria-roledescription="carousel"
    >
      {/* Slides — cross-fade via opacity */}
      <div className="relative aspect-[16/9] w-full">
        {articles.map((a, i) => (
          <div
            key={a.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={i !== current}
          >
            {a.hero_image_url && (
              <Image
                src={a.hero_image_url}
                alt={a.hero_image_alt ?? a.title}
                fill
                className="object-cover opacity-75"
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            )}
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-20 pointer-events-none" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-30">
          {article.category && (
            <CategoryBadge
              name={article.category.name}
              href={`/category/${article.category.slug}`}
              variant="overlay"
              size="md"
              className="mb-2 self-start"
            />
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-2 text-white">
            <Link
              href={`/article/${article.slug}`}
              className="hover:underline underline-offset-2"
            >
              {article.title}
            </Link>
          </h2>
          {article.excerpt && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-2 hidden md:block leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {article.author?.full_name && (
              <span className="font-medium text-gray-300">{article.author.full_name} · </span>
            )}
            <time dateTime={article.published_at ?? undefined}>
              {relativeTime(article.published_at)}
            </time>
          </p>
        </div>

        {/* Prev button */}
        {count > 1 && (
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous story"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Next button */}
        {count > 1 && (
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next story"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Dot indicators */}
        {count > 1 && (
          <div className="absolute bottom-4 right-5 z-40 flex items-center gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 focus:outline-none ${
                  i === current
                    ? 'w-5 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to story ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'

interface BreakingTickerProps {
  articles: ArticleWithRelations[]
}

/**
 * Full-width breaking news ticker.
 * CSS keyframe animation — no client JS required.
 * Content is duplicated for a seamless infinite loop.
 */
export function BreakingTicker({ articles }: BreakingTickerProps) {
  if (!articles.length) return null

  // Duplicate items so the loop is seamless at translateX(-50%)
  const items = [...articles, ...articles]

  return (
    <div
      className="w-full flex items-stretch overflow-hidden"
      style={{ background: '#B8282A', minHeight: '38px' }}
      role="marquee"
      aria-label="Breaking news"
    >
      {/* CSS keyframes injected inline — no globals.css modification needed */}
      <style>{`
        @keyframes zno-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .zno-ticker-track {
          animation: zno-ticker ${Math.max(18, articles.length * 7)}s linear infinite;
          will-change: transform;
        }
        .zno-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* BREAKING badge */}
      <div
        className="flex-shrink-0 flex items-center px-4 z-10 text-white font-black text-[11px] tracking-[0.18em] uppercase border-r border-white/20"
        style={{ background: '#8B0000', minWidth: '100px' }}
        aria-hidden="true"
      >
        <span className="mr-1.5">●</span> Breaking
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden flex items-center">
        <div className="zno-ticker-track flex items-center gap-0 whitespace-nowrap">
          {items.map((article, i) => (
            <span key={`${article.id}-${i}`} className="inline-flex items-center">
              <Link
                href={`/article/${article.slug}`}
                className="inline-block px-5 text-[13px] font-medium text-white hover:text-yellow-200 transition-colors leading-none"
                tabIndex={i >= articles.length ? -1 : 0}
              >
                {article.title}
              </Link>
              <span className="text-white/30 text-lg leading-none" aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

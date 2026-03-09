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

  const items = [...articles, ...articles]

  return (
    <div
      className="flex w-full items-stretch overflow-hidden"
      style={{ background: '#B8282A', minHeight: '38px' }}
      role="marquee"
      aria-label="Breaking news"
    >
      <style>{`
        @keyframes zno-ticker {
          0% { transform: translateX(0); }
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

      <div
        className="z-10 flex min-w-[100px] flex-shrink-0 items-center border-r border-white/20 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white"
        style={{ background: '#8B0000' }}
        aria-hidden="true"
      >
        <span className="mr-1.5">●</span>
        Breaking
      </div>

      <div className="flex flex-1 items-center overflow-hidden">
        <div className="zno-ticker-track flex items-center gap-0 whitespace-nowrap">
          {items.map((article, i) => (
            <span key={`${article.id}-${i}`} className="inline-flex items-center">
              <Link
                href={`/article/${article.slug}`}
                className="inline-block px-5 text-[13px] font-medium leading-none text-white transition-colors hover:text-yellow-200"
                tabIndex={i >= articles.length ? -1 : 0}
              >
                {article.title}
              </Link>
              <span className="text-lg leading-none text-white/30" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
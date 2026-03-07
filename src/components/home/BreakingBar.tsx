import Link from 'next/link'
import type { ArticleWithRelations } from '@/types'

interface BreakingBarProps {
  articles: ArticleWithRelations[]
}

export function BreakingBar({ articles }: BreakingBarProps) {
  if (!articles.length) return null

  return (
    <div className="bg-granite-accent-gradient text-granite-primary text-sm py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <span className="font-black uppercase tracking-widest text-xs whitespace-nowrap flex-shrink-0 bg-granite-primary text-white px-2 py-0.5">
          Breaking
        </span>
        <div className="overflow-hidden flex-1">
          <ul className="flex gap-8 animate-none">
            {articles.map((article) => (
              <li key={article.id} className="whitespace-nowrap">
                <Link
                  href={`/article/${article.slug}`}
                  className="hover:underline font-medium"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

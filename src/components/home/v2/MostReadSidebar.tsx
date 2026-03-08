import Link from 'next/link'
import type { MostReadArticle } from '@/types'

interface MostReadSidebarProps {
  articles: MostReadArticle[]
}

export function MostReadSidebar({ articles }: MostReadSidebarProps) {
  if (!articles.length) return null

  return (
    <aside aria-label="Most read">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
          Most Read
        </h2>
      </div>

      <ol className="space-y-0 divide-y divide-gray-100">
        {articles.map((article, index) => (
          <li key={article.article_id} className="flex gap-3 py-3 items-start group">
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: index === 0 ? '#B45309' : '#374151' }}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-3 group-hover:text-amber-700 transition-colors">
              <Link href={`/article/${article.slug}`}>
                {article.title}
              </Link>
            </h3>
          </li>
        ))}
      </ol>
    </aside>
  )
}

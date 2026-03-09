import Link from 'next/link'

type MostReadArticle = {
  article_id: string
  slug: string
  title: string
}

interface MostReadSidebarProps {
  articles: MostReadArticle[]
}

export function MostReadSidebar({ articles }: MostReadSidebarProps) {
  if (!articles.length) return null

  return (
    <aside aria-label="Most read">
      <div className="mb-4 flex items-center gap-3 border-b-2 border-gray-900 pb-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
          Most Read
        </h2>
      </div>

      <ol className="divide-y divide-gray-100 space-y-0">
        {articles.map((article, index) => (
          <li
            key={article.article_id}
            className="group flex items-start gap-3 py-3"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
              style={{ background: index === 0 ? '#B45309' : '#374151' }}
              aria-hidden="true"
            >
              {index + 1}
            </span>

            <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-amber-700">
              <Link href={`/article/${article.slug}`}>{article.title}</Link>
            </h3>
          </li>
        ))}
      </ol>
    </aside>
  )
}
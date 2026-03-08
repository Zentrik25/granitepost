import type { TopArticleViews } from '@/lib/admin/analytics/types'

interface Props {
  articles: TopArticleViews[]
  label?: string
}

export function TopArticlesTable({ articles, label = 'Top Articles' }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">{label}</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Article</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Published</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((row, i) => (
              <tr key={row.article_id} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{i + 1}</td>
                <td className="px-5 py-3.5 font-medium max-w-xs">
                  <a
                    href={`/article/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-granite-primary transition-colors line-clamp-2"
                  >
                    {row.title}
                  </a>
                  <span className="block text-xs text-gray-400 font-mono mt-0.5 line-clamp-1">
                    {row.slug}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                  {row.category_name ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell whitespace-nowrap">
                  {row.published_at
                    ? new Date(row.published_at).toLocaleDateString('en-GB')
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-3.5 text-right font-bold tabular-nums text-gray-800">
                  {row.total_views.toLocaleString()}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
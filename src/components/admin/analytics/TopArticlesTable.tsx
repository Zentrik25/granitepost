import type { TopArticleViews } from '@/lib/admin/analytics/types'

interface Props {
  articles: TopArticleViews[]
  label?: string
}

export function TopArticlesTable({ articles, label = 'Top Articles' }: Props) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3">{label}</h2>
      <div className="bg-white border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray border-b border-brand-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold w-8">#</th>
              <th className="text-left px-4 py-2.5 font-semibold">Article</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Published</th>
              <th className="text-right px-4 py-2.5 font-semibold">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {articles.map((row, i) => (
              <tr key={row.article_id} className="hover:bg-brand-gray/50">
                <td className="px-4 py-3 text-brand-muted font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-3 font-medium max-w-xs">
                  <a
                    href={`/article/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-red line-clamp-2"
                  >
                    {row.title}
                  </a>
                  <span className="block text-xs text-brand-muted font-mono mt-0.5 line-clamp-1">
                    {row.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted hidden sm:table-cell">
                  {row.category_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-brand-muted hidden md:table-cell whitespace-nowrap">
                  {row.published_at
                    ? new Date(row.published_at).toLocaleDateString('en-GB')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">
                  {row.total_views.toLocaleString()}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-brand-muted">
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
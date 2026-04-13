import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/guards'
import { getAdminSubscribers } from '@/lib/newsletter/queries'
import type { SubscriberFilter } from '@/lib/newsletter/queries'

export const metadata: Metadata = { title: 'Newsletter — Admin' }
export const revalidate = 60

const FILTER_TABS: { label: string; value: SubscriberFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Unconfirmed', value: 'unconfirmed' },
  { label: 'Unsubscribed', value: 'unsubscribed' },
]

interface Props {
  searchParams: Promise<{ page?: string; filter?: string }>
}

export default async function AdminNewsletterPage({ searchParams }: Props) {
  await requireAuth()

  const { page: pageParam, filter: rawFilter = 'all' } = await searchParams
  const filter: SubscriberFilter = FILTER_TABS.some((t) => t.value === rawFilter)
    ? (rawFilter as SubscriberFilter)
    : 'all'
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 50

  const { data: subscribers, total } = await getAdminSubscribers(filter, page, limit)
  const hasMore = page * limit < total

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-black">Newsletter Subscribers</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-brand-muted">{total} total</span>
          <a
            href="/admin/newsletter/export"
            className="px-3 py-1.5 text-xs font-semibold border border-brand-border hover:bg-brand-gray transition-colors"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-brand-border">
        {FILTER_TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/newsletter?filter=${tab.value}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              filter === tab.value
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="bg-white border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray border-b border-brand-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold">Email</th>
              <th className="text-left px-4 py-2.5 font-semibold">Status</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">
                Subscribed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-brand-gray/50">
                <td className="px-4 py-3 font-medium">{sub.email}</td>
                <td className="px-4 py-3">
                  {sub.unsubscribed_at ? (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 font-semibold">
                      Unsubscribed
                    </span>
                  ) : sub.confirmed ? (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 font-semibold">
                      Confirmed
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 font-semibold">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-brand-muted hidden md:table-cell">
                  {new Date(sub.subscribed_at).toLocaleDateString('en-GB', { timeZone: 'Africa/Harare' })}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-brand-muted">
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(hasMore || page > 1) && (
        <div className="flex gap-3">
          {page > 1 && (
            <a
              href={`/admin/newsletter?filter=${filter}&page=${page - 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              &larr; Previous
            </a>
          )}
          {hasMore && (
            <a
              href={`/admin/newsletter?filter=${filter}&page=${page + 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              Next &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  )
}
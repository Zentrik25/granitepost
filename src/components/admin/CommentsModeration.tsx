'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDatetime } from '@/lib/utils/slug'
import { moderateCommentAction, bulkModerateAction } from '@/app/(admin)/admin/comments/actions'
import type { CommentWithArticle } from '@/lib/comments/queries'
import type { CommentStatus } from '@/types'

interface CommentsModerationProps {
  comments: CommentWithArticle[]
  currentStatus: CommentStatus
  page: number
  hasMore: boolean
  total: number
}

const STATUS_TABS: CommentStatus[] = ['PENDING', 'APPROVED', 'SPAM', 'DELETED']

const TAB_PILL: Record<CommentStatus, string> = {
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  SPAM:     'bg-orange-50 text-orange-600 border border-orange-200',
  REJECTED: 'bg-slate-100 text-slate-600 border border-slate-200',
  DELETED:  'bg-rose-50 text-rose-600 border border-rose-200',
}

export function CommentsModeration({
  comments,
  currentStatus,
  page,
  hasMore,
  total,
}: CommentsModerationProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function updateStatus(ids: string[], status: CommentStatus) {
    setError(null)
    const result =
      ids.length === 1
        ? await moderateCommentAction(ids[0], status)
        : await bulkModerateAction(ids, status)

    if (!result.success) {
      setError(result.error ?? 'Action failed')
      return
    }

    setSelected(new Set())
    startTransition(() => router.refresh())
  }

  async function bulkAction(status: CommentStatus) {
    if (!selected.size) return
    await updateStatus(Array.from(selected), status)
  }

  return (
    <div className="space-y-5">
      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/comments?status=${tab}`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              currentStatus === tab
                ? TAB_PILL[tab]
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </a>
        ))}
        <span className="ml-auto text-xs text-gray-400 font-medium">{total} total</span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 bg-granite-primary/8 border border-granite-primary/20 rounded-xl px-4 py-3 text-sm">
          <span className="font-semibold text-granite-primary">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => bulkAction('APPROVED')}
              disabled={isPending}
              className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => bulkAction('SPAM')}
              disabled={isPending}
              className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              Spam
            </button>
            <button
              onClick={() => bulkAction('DELETED')}
              disabled={isPending}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-5 py-3 w-8">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-granite-primary cursor-pointer"
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(comments.map((r) => r.id)) : new Set())
                  }
                  checked={selected.size === comments.length && comments.length > 0}
                  readOnly={comments.length === 0}
                />
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Comment</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Article</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-5 py-3.5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-granite-primary cursor-pointer"
                    checked={selected.has(comment.id)}
                    onChange={() => toggleSelect(comment.id)}
                  />
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-800">{comment.author_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{comment.author_email}</p>
                </td>
                <td className="px-5 py-3.5 max-w-xs">
                  <p className="line-clamp-3 text-sm text-gray-700">{comment.body}</p>
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {comment.article ? (
                    <a
                      href={`/article/${comment.article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-granite-primary hover:underline line-clamp-2"
                    >
                      {comment.article.title}
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400 hidden md:table-cell whitespace-nowrap">
                  {formatDatetime(comment.created_at)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2 justify-end">
                    {comment.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'APPROVED')}
                        disabled={isPending}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {comment.status !== 'SPAM' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'SPAM')}
                        disabled={isPending}
                        className="text-xs text-gray-400 hover:text-amber-600 disabled:opacity-50 transition-colors"
                      >
                        Spam
                      </button>
                    )}
                    {comment.status !== 'DELETED' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'DELETED')}
                        disabled={isPending}
                        className="text-xs text-gray-400 hover:text-rose-600 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  No {currentStatus.toLowerCase()} comments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(hasMore || page > 1) && (
        <div className="flex gap-3">
          {page > 1 && (
            <a
              href={`/admin/comments?status=${currentStatus}&page=${page - 1}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              ← Previous
            </a>
          )}
          {hasMore && (
            <a
              href={`/admin/comments?status=${currentStatus}&page=${page + 1}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
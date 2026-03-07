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
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex gap-0 border-b border-brand-border">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/comments?status=${tab}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              currentStatus === tab
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
          >
            {tab}
          </a>
        ))}
        <span className="ml-auto py-2 text-xs text-brand-muted self-center">{total} total</span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-brand-gray px-4 py-2.5 text-sm">
          <span className="font-semibold">{selected.size} selected</span>
          <button
            onClick={() => bulkAction('APPROVED')}
            disabled={isPending}
            className="text-green-700 font-semibold hover:underline disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => bulkAction('SPAM')}
            disabled={isPending}
            className="text-yellow-700 font-semibold hover:underline disabled:opacity-50"
          >
            Spam
          </button>
          <button
            onClick={() => bulkAction('DELETED')}
            disabled={isPending}
            className="text-brand-red font-semibold hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray border-b border-brand-border">
            <tr>
              <th className="px-4 py-2.5 w-8">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(comments.map((r) => r.id)) : new Set())
                  }
                  checked={selected.size === comments.length && comments.length > 0}
                  readOnly={comments.length === 0}
                />
              </th>
              <th className="text-left px-4 py-2.5 font-semibold">Author</th>
              <th className="text-left px-4 py-2.5 font-semibold">Comment</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden lg:table-cell">Article</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Date</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-brand-gray/50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selected.has(comment.id)}
                    onChange={() => toggleSelect(comment.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{comment.author_name}</p>
                  <p className="text-xs text-brand-muted">{comment.author_email}</p>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="line-clamp-3 text-sm">{comment.body}</p>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {comment.article ? (
                    <a
                      href={`/article/${comment.article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-red hover:underline line-clamp-2"
                    >
                      {comment.article.title}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-brand-muted hidden md:table-cell whitespace-nowrap">
                  {formatDatetime(comment.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    {comment.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'APPROVED')}
                        disabled={isPending}
                        className="text-xs font-semibold text-green-700 hover:underline disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {comment.status !== 'SPAM' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'SPAM')}
                        disabled={isPending}
                        className="text-xs text-brand-muted hover:text-yellow-700 disabled:opacity-50"
                      >
                        Spam
                      </button>
                    )}
                    {comment.status !== 'DELETED' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'DELETED')}
                        disabled={isPending}
                        className="text-xs text-brand-muted hover:text-brand-red disabled:opacity-50"
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
                <td colSpan={6} className="px-4 py-10 text-center text-brand-muted">
                  No {currentStatus.toLowerCase()} comments.
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
              href={`/admin/comments?status=${currentStatus}&page=${page - 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              &larr; Previous
            </a>
          )}
          {hasMore && (
            <a
              href={`/admin/comments?status=${currentStatus}&page=${page + 1}`}
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
'use client'

import { useActionState } from 'react'
import {
  publishArticleAction,
  archiveArticleAction,
} from '@/app/(admin)/admin/articles/actions'
import { roleCanPublish, roleCanArchive, type ActionResult } from '@/lib/admin/articles/validation'

interface Props {
  articleId: string
  currentStatus: string
  role: string
}

const INITIAL: ActionResult = { success: false }

export function ArticleStatusActions({ articleId, currentStatus, role }: Props) {
  const [publishState, publishAction, isPublishing] = useActionState(
    publishArticleAction,
    INITIAL
  )
  const [archiveState, archiveAction, isArchiving] = useActionState(
    archiveArticleAction,
    INITIAL
  )

  const showPublish = roleCanPublish(role) && currentStatus !== 'PUBLISHED'
  const showArchive = roleCanArchive(role) && currentStatus !== 'ARCHIVED'

  if (!showPublish && !showArchive) return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showPublish && (
        <form action={publishAction} className="contents">
          <input type="hidden" name="id" value={articleId} />
          <button
            type="submit"
            disabled={isPublishing}
            className="px-5 py-2 bg-green-700 text-white text-sm font-bold hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {isPublishing ? 'Publishing…' : 'Publish'}
          </button>
          {!isPublishing && publishState.error && (
            <span className="text-sm text-red-600">{publishState.error}</span>
          )}
          {!isPublishing && publishState.success && (
            <span className="text-sm text-green-700 font-semibold">Published.</span>
          )}
        </form>
      )}

      {showArchive && (
        <form action={archiveAction} className="contents">
          <input type="hidden" name="id" value={articleId} />
          <button
            type="submit"
            disabled={isArchiving}
            className="px-5 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray disabled:opacity-50 transition-colors"
          >
            {isArchiving ? 'Archiving…' : 'Archive'}
          </button>
          {!isArchiving && archiveState.error && (
            <span className="text-sm text-red-600">{archiveState.error}</span>
          )}
          {!isArchiving && archiveState.success && (
            <span className="text-sm text-brand-muted">Archived.</span>
          )}
        </form>
      )}
    </div>
  )
}

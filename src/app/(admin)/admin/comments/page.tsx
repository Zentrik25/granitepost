import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/guards'
import { getAdminComments } from '@/lib/comments/queries'
import { CommentsModeration } from '@/components/admin/CommentsModeration'
import type { CommentStatus } from '@/types'

export const metadata: Metadata = { title: 'Comments — Admin' }
export const revalidate = 60

const VALID_STATUSES: CommentStatus[] = ['PENDING', 'APPROVED', 'SPAM', 'DELETED']

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminCommentsPage({ searchParams }: Props) {
  await requireAuth()

  const { status: rawStatus = 'PENDING', page: pageParam } = await searchParams
  const status: CommentStatus = VALID_STATUSES.includes(rawStatus as CommentStatus)
    ? (rawStatus as CommentStatus)
    : 'PENDING'
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 30

  const { data: comments, total } = await getAdminComments(status, page, limit)
  const hasMore = page * limit < total

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Comments</h1>
      <CommentsModeration
        comments={comments}
        currentStatus={status}
        page={page}
        hasMore={hasMore}
        total={total}
      />
    </div>
  )
}
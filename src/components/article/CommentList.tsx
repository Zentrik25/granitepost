import type { Database } from '@/types/database'
import { formatDatetime } from '@/lib/utils/slug'

type Comment = Database['public']['Tables']['comments']['Row']

interface Props {
  comments: Comment[]
}

export function CommentList({ comments }: Props) {
  if (comments.length === 0) return null

  return (
    <div className="mt-10 border-t border-brand-border pt-8">
      <h2 className="mb-6 border-b-2 border-brand-red pb-2 text-sm font-black uppercase tracking-widest">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      <ol className="space-y-6">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-4">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 select-none items-center justify-center rounded-full bg-brand-gray text-sm font-bold uppercase text-brand-muted"
            >
              {comment.author_name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold">{comment.author_name}</span>
                <time
                  dateTime={comment.created_at}
                  className="text-xs text-brand-muted"
                >
                  {formatDatetime(comment.created_at)}
                </time>
              </div>

              <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                {comment.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
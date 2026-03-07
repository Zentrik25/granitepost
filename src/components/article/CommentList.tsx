import type { Comment } from '@/types'
import { formatDatetime } from '@/lib/utils/slug'

interface Props {
  comments: Comment[]
}

export function CommentList({ comments }: Props) {
  if (comments.length === 0) return null

  return (
    <div className="mt-10 pt-8 border-t border-brand-border">
      <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-brand-red pb-2 mb-6">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      <ol className="space-y-6">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-4">
            {/* Avatar placeholder */}
            <div
              aria-hidden="true"
              className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-gray flex items-center justify-center text-sm font-bold text-brand-muted uppercase select-none"
            >
              {comment.author_name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                <span className="font-semibold text-sm">{comment.author_name}</span>
                <time
                  dateTime={comment.created_at}
                  className="text-xs text-brand-muted"
                >
                  {formatDatetime(comment.created_at)}
                </time>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

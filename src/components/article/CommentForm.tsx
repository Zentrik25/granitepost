'use client'

import { useState, useRef } from 'react'

interface Props {
  articleId: string
}

type State = 'idle' | 'submitting' | 'success' | 'error'

export function CommentForm({ articleId }: Props) {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setMessage('')

    const fd = new FormData(e.currentTarget)
    const payload = {
      articleId,
      authorName: fd.get('authorName') as string,
      authorEmail: fd.get('authorEmail') as string,
      body: fd.get('body') as string,
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        setState('error')
        setMessage(json.error ?? 'Failed to submit comment.')
      } else {
        setState('success')
        setMessage(json.message ?? 'Comment submitted and awaiting moderation.')
        formRef.current?.reset()
      }
    } catch {
      setState('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="mt-10 pt-8 border-t border-brand-border">
      <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-granite-primary pb-2 mb-6">
        Leave a Comment
      </h2>

      {state === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          {message}
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comment-name" className="block text-xs font-semibold mb-1">
                Name <span className="text-granite-primary">*</span>
              </label>
              <input
                id="comment-name"
                name="authorName"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                disabled={state === 'submitting'}
                className="w-full border border-granite-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-granite-primary/40 focus:border-granite-primary disabled:opacity-50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="comment-email" className="block text-xs font-semibold mb-1">
                Email <span className="text-granite-primary">*</span>{' '}
                <span className="font-normal text-brand-muted">(not published)</span>
              </label>
              <input
                id="comment-email"
                name="authorEmail"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                disabled={state === 'submitting'}
                className="w-full border border-granite-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-granite-primary/40 focus:border-granite-primary disabled:opacity-50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="comment-body" className="block text-xs font-semibold mb-1">
              Comment <span className="text-granite-primary">*</span>
            </label>
            <textarea
              id="comment-body"
              name="body"
              required
              rows={5}
              maxLength={2000}
              disabled={state === 'submitting'}
              className="w-full border border-granite-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-granite-primary/40 focus:border-granite-primary disabled:opacity-50 resize-y transition-colors"
            />
            <p className="text-xs text-brand-muted mt-1">Min 10 characters · max 2,000 · max 2 links. Comments are moderated.</p>
          </div>

          {state === 'error' && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="bg-granite-gradient text-white px-6 py-2.5 text-sm font-semibold rounded-lg hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-granite-primary/50 focus:ring-offset-2"
          >
            {state === 'submitting' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Submitting…
              </span>
            ) : 'Submit Comment'}
          </button>
        </form>
      )}
    </div>
  )
}

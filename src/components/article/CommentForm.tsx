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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-brand-red pb-2 mb-6">
        Leave a Comment
      </h2>

      {state === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">
          {message}
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comment-name" className="block text-xs font-semibold mb-1">
                Name <span className="text-brand-red">*</span>
              </label>
              <input
                id="comment-name"
                name="authorName"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                disabled={state === 'submitting'}
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:border-brand-red disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="comment-email" className="block text-xs font-semibold mb-1">
                Email <span className="text-brand-red">*</span>{' '}
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
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:border-brand-red disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="comment-body" className="block text-xs font-semibold mb-1">
              Comment <span className="text-brand-red">*</span>
            </label>
            <textarea
              id="comment-body"
              name="body"
              required
              rows={5}
              maxLength={2000}
              disabled={state === 'submitting'}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:border-brand-red disabled:opacity-50 resize-y"
            />
            <p className="text-xs text-brand-muted mt-1">Max 2,000 characters. Comments are moderated.</p>
          </div>

          {state === 'error' && (
            <p className="text-sm text-brand-red">{message}</p>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="bg-brand-red text-white px-5 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {state === 'submitting' ? 'Submitting…' : 'Submit Comment'}
          </button>
        </form>
      )}
    </div>
  )
}

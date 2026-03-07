'use client'

import { useState } from 'react'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function NewsletterForm() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setMessage('')

    const email = (new FormData(e.currentTarget).get('email') as string).trim()

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setState('error')
        setMessage(json.error ?? 'Failed to subscribe.')
      } else {
        setState('success')
        setMessage(json.message ?? 'Subscribed! Check your email to confirm.')
      }
    } catch {
      setState('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="bg-brand-dark text-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-red mb-1">Newsletter</p>
      <h3 className="font-black text-base leading-snug mb-3">
        Zimbabwe news in your inbox
      </h3>
      <p className="text-xs text-gray-300 mb-4 leading-relaxed">
        Get the biggest stories delivered daily. Unsubscribe at any time.
      </p>

      {state === 'success' ? (
        <p className="text-sm text-green-400">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            disabled={state === 'submitting'}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-brand-red disabled:opacity-50"
          />
          {state === 'error' && (
            <p className="text-xs text-red-400">{message}</p>
          )}
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="w-full bg-brand-red text-white py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {state === 'submitting' ? 'Subscribing…' : 'Subscribe Free'}
          </button>
        </form>
      )}
    </div>
  )
}

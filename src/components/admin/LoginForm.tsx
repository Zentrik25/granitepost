'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const redirectTo = searchParams.get('redirectTo') ?? '/admin'
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-brand-red font-medium">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-red text-white py-2.5 text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

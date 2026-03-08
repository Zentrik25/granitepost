'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

interface AdminHeaderProps {
  user: { id: string; email: string }
  role: UserRole
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
    </svg>
  )
}

export function AdminHeader({ user, role }: AdminHeaderProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  // Short display name from email (before @)
  const displayName = user.email.split('@')[0]

  return (
    <header className="bg-brand-surface border-b border-brand-border px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* Left: user info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar bubble */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold uppercase"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)' }}
          aria-hidden="true"
        >
          {displayName.charAt(0)}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-primary truncate leading-none">{user.email}</p>
          <p className="text-[10px] text-brand-muted mt-0.5 leading-none uppercase tracking-wider font-medium">{role}</p>
        </div>
      </div>

      {/* Right: sign out */}
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border text-sm font-medium text-brand-secondary hover:border-brand-ink hover:text-brand-primary hover:bg-brand-canvas active:bg-brand-border transition-all duration-150"
      >
        <SignOutIcon />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  )
}
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
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
      {/* Left: user info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar bubble */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold uppercase shadow-sm"
          style={{ background: 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)' }}
          aria-hidden="true"
        >
          {displayName.charAt(0)}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate leading-none">{user.email}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-none uppercase tracking-wider font-medium">{role}</p>
        </div>
      </div>

      {/* Right: sign out */}
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-all duration-150"
      >
        <SignOutIcon />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  )
}
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

interface AdminHeaderProps {
  user: { id: string; email: string }
  role: UserRole
}

export function AdminHeader({ user, role }: AdminHeaderProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-brand-border px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="text-sm text-brand-muted">
        Signed in as{' '}
        <span className="font-semibold text-brand-dark">
          {user.email}
        </span>{' '}
        <span className="text-xs bg-brand-gray text-brand-muted px-1.5 py-0.5 ml-1">
          {role}
        </span>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="text-sm text-brand-muted hover:text-brand-red transition-colors font-medium"
      >
        Sign out
      </button>
    </header>
  )
}
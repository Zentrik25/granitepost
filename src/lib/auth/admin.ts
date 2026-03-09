import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export const ADMIN_ROLES = ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'] as const

export interface AdminSession {
  user: {
    id: string
    email: string
  }
  role: UserRole
}

export async function getAdminSessionOrRedirect(): Promise<AdminSession> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/admin/login')
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleError) {
    throw new Error(`Failed to load admin role: ${roleError.message}`)
  }

  if (!roleData?.role) {
    redirect('/admin/access-denied')
  }

  const role = roleData.role as UserRole

  if (!ADMIN_ROLES.includes(role)) {
    redirect('/admin/access-denied')
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
    },
    role,
  }
}

export async function requireAdminRole(allowedRoles: UserRole[]) {
  const session = await getAdminSessionOrRedirect()

  if (!allowedRoles.includes(session.role)) {
    redirect('/admin/access-denied')
  }

  return session
}
import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

type AuthContext = {
  userId: string
  email: string
  role: UserRole
} | null

const getAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!roleData) return null

  return {
    userId: user.id,
    email: user.email ?? '',
    role: roleData.role as UserRole,
  }
})

export async function getUserRole(): Promise<UserRole | null> {
  const ctx = await getAuthContext()
  return ctx?.role ?? null
}

export async function requireAuth(): Promise<{
  user: { id: string; email: string }
  role: UserRole
}> {
  const ctx = await getAuthContext()

  if (!ctx) redirect('/admin/login')

  return {
    user: { id: ctx.userId, email: ctx.email },
    role: ctx.role,
  }
}

export async function requireRole(
  allowed: UserRole | UserRole[]
): Promise<{ user: { id: string; email: string }; role: UserRole }> {
  const { user, role } = await requireAuth()
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed]

  if (!allowedRoles.includes(role)) {
    redirect('/admin')
  }

  return { user, role }
}
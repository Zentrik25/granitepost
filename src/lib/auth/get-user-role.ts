import 'server-only'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types'

// Fetch the role for the currently authenticated user.
// Accepts any typed or untyped Supabase client (SupabaseClient<any>).
export async function getUserRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role as UserRole
}

export function hasRole(role: UserRole | null, required: UserRole[]): boolean {
  if (!role) return false
  return required.includes(role)
}

export function isAdmin(role: UserRole | null): boolean {
  return role === 'ADMIN'
}

export function canPublish(role: UserRole | null): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}

export function canWrite(role: UserRole | null): boolean {
  return role === 'ADMIN' || role === 'EDITOR' || role === 'AUTHOR'
}

export function canModerate(role: UserRole | null): boolean {
  return role === 'ADMIN' || role === 'EDITOR' || role === 'MODERATOR'
}

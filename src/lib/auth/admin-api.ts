import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export async function requireAdminApi(allowedRoles: UserRole[]) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleError || !roleData?.role) {
    return { ok: false as const, status: 403, error: 'Forbidden' }
  }

  const role = roleData.role as UserRole

  if (!allowedRoles.includes(role)) {
    return { ok: false as const, status: 403, error: 'Forbidden' }
  }

  return {
    ok: true as const,
    user,
    role,
    supabase,
  }
}
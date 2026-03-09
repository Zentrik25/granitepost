'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  redirectTo: z.string().optional(),
})

export type LoginState = {
  error: string | null
}

function normalizeRedirectTo(input?: string) {
  if (!input || !input.startsWith('/admin')) {
    return '/admin'
  }

  return input
}

function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return requestHeaders.get('x-real-ip') ?? 'unknown'
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    redirectTo: String(formData.get('redirectTo') ?? ''),
  })

  if (!parsed.success) {
    return { error: 'Invalid login data.' }
  }

  const { email, password, redirectTo } = parsed.data
  const emailLower = email.trim().toLowerCase()
  const ipAddress = getClientIp(await headers())

  const service = createServiceRoleSupabaseClient()
  const serviceAny = service as any

  const { data: allowed, error: rateError } = await serviceAny.rpc(
    'check_admin_login_rate_limit',
    {
      p_email: emailLower,
      p_ip: ipAddress,
    }
  )

  if (rateError) {
    console.error('Rate limit RPC error:', rateError)
    return { error: `Unable to verify login access right now. Details: ${rateError.message}` }
  }

  if (!allowed) {
    return { error: 'Too many login attempts. Try again later.' }
  }

  const supabase = await createClient()

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: emailLower,
    password,
  })

  if (authError) {
    await serviceAny.rpc('record_admin_login_attempt', {
      p_email: emailLower,
      p_ip: ipAddress,
      p_success: false,
      p_reason: 'invalid_credentials',
    })

    return { error: 'Invalid email or password.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Login session could not be established.' }
  }

  const { data: roleData, error: roleError } = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleError || !roleData?.role) {
    await serviceAny.rpc('record_admin_login_attempt', {
      p_email: emailLower,
      p_ip: ipAddress,
      p_success: false,
      p_reason: 'missing_admin_role',
    })

    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }

  await serviceAny.rpc('record_admin_login_attempt', {
    p_email: emailLower,
    p_ip: ipAddress,
    p_success: true,
    p_reason: 'ok',
  })

  await service.from('audit_logs').insert({
    actor_user_id: user.id,
    action: 'admin_login_success',
    target_table: 'auth',
    target_id: user.id,
    metadata: {
      email: emailLower,
      ip: ipAddress,
    },
  })

  redirect(normalizeRedirectTo(redirectTo))
}
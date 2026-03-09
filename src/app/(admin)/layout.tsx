import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { UserRole } from '@/types'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    .single()

  if (roleError || !roleData?.role) {
    redirect('/admin/login')
  }

  const role = roleData.role as UserRole

  return (
    <div className="h-screen w-full bg-brand-canvas flex overflow-hidden">
      <AdminSidebar role={role} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <AdminHeader
          user={{
            id: user.id,
            email: user.email ?? '',
          }}
          role={role}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
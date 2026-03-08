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
  } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!roleData) {
    return <>{children}</>
  }

  const role = roleData.role as UserRole

  return (
    <div className="h-screen bg-brand-canvas flex overflow-hidden">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader user={{ id: user.id, email: user.email ?? '' }} role={role} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/SettingsForm'

export const metadata: Metadata = { title: 'Settings — Admin' }
export const revalidate = 60

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')

  const settingsMap: Record<string, string> = {}
  for (const row of settings ?? []) {
    settingsMap[row.key] = row.value
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Site Settings</h1>
      <SettingsForm settings={settingsMap} />
    </div>
  )
}

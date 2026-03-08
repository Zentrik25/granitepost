import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { AdminPageHeader, AdminCard } from '@/components/admin/ui/AdminCard'

export const metadata: Metadata = { title: 'Settings — Admin' }
export const revalidate = 60

function PagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
    </svg>
  )
}

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
    <div className="space-y-8 max-w-4xl">
      <AdminPageHeader title="Settings" />

      {/* CMS Pages shortcut */}
      <AdminCard>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-canvas border border-brand-border text-brand-muted mt-0.5">
              <PagesIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-primary">CMS Pages</p>
              <p className="text-xs text-brand-muted mt-0.5">
                Edit About Us, Contact, Editorial Policy, Corrections, Ownership, Privacy Policy, and Terms of Use.
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings/pages"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-brand-border text-brand-secondary hover:border-brand-ink hover:text-brand-primary hover:bg-brand-canvas transition-all duration-150"
          >
            Manage Pages →
          </Link>
        </div>
      </AdminCard>

      {/* Site settings form */}
      <div>
        <h2 className="text-lg font-black text-brand-primary mb-4">Site Configuration</h2>
        <SettingsForm settings={settingsMap} />
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Authors — Admin' }

export default async function AuthorsPage() {
  const { user, role } = await requireAuth()
  const supabase = await createClient()

  // ADMIN sees all profiles; others only see their own
  let query = supabase
    .from('profiles')
    .select('id, full_name, slug, title, avatar_url, updated_at')
    .order('full_name')

  if (role !== 'ADMIN') {
    query = query.eq('id', user.id)
  }

  const { data: profiles } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Authors</h1>

      <div className="border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border bg-gray-50 text-xs font-bold uppercase tracking-widest text-brand-muted">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Title / Role</th>
              <th className="px-4 py-3 text-left">Public page</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">
                  {p.full_name ?? <span className="italic text-brand-muted">Unnamed</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">
                  {p.slug ?? <span className="text-red-500">not set</span>}
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {p.title ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {p.slug ? (
                    <Link
                      href={`/author/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 hover:underline"
                    >
                      /author/{p.slug} ↗
                    </Link>
                  ) : (
                    <span className="text-xs text-brand-muted italic">Set a slug to publish</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/authors/${p.id}`}
                    className="text-xs font-semibold text-brand-dark hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {(profiles ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-brand-muted">
                  No profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

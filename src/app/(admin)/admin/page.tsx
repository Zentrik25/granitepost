import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableHead,
  adminTableRowClass,
} from '@/components/admin/ui/AdminCard'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    allArticles,
    publishedArticles,
    draftArticles,
    pendingComments,
    categories,
    viewData,
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT'),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('view_count').eq('status', 'PUBLISHED'),
  ])

  const totalViews = (viewData.data ?? []).reduce(
    (sum, a) => sum + (a.view_count ?? 0),
    0
  )

  return {
    totalArticles:    allArticles.count ?? 0,
    publishedArticles: publishedArticles.count ?? 0,
    draftArticles:    draftArticles.count ?? 0,
    totalViews,
    pendingComments:  pendingComments.count ?? 0,
    totalCategories:  categories.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [stats, recentResult] = await Promise.all([
    getDashboardStats(supabase),
    supabase
      .from('articles')
      .select('id, title, slug, status, published_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const recentArticles = recentResult.data

  return (
    <div className="space-y-8 max-w-[1400px]">
      <AdminPageHeader title="Dashboard" description="Your newsroom at a glance" />

      {/* ── 6 KPI cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Total Articles"
          value={stats.totalArticles}
          icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8"
          gradient="linear-gradient(145deg, #142B6F 0%, #1a3a8f 100%)"
          glow="rgba(20,43,111,0.35)"
        />
        <KpiCard
          label="Published"
          value={stats.publishedArticles}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          gradient="linear-gradient(145deg, #065f46 0%, #047857 100%)"
          glow="rgba(6,95,70,0.35)"
        />
        <KpiCard
          label="Drafts"
          value={stats.draftArticles}
          icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5 M17.586 3.586a2 2 0 112.828 2.828L12 15l-4 1 1-4 8.586-8.414z"
          gradient="linear-gradient(145deg, #312e81 0%, #4338ca 100%)"
          glow="rgba(49,46,129,0.35)"
        />
        <KpiCard
          label="Total Views"
          value={stats.totalViews}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          gradient="linear-gradient(145deg, #5b21b6 0%, #7c3aed 100%)"
          glow="rgba(91,33,182,0.35)"
          formatLarge
        />
        <KpiCard
          label="Pending Comments"
          value={stats.pendingComments}
          icon="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          gradient="linear-gradient(145deg, #92400e 0%, #c2410c 100%)"
          glow="rgba(146,64,14,0.35)"
        />
        <KpiCard
          label="Categories"
          value={stats.totalCategories}
          icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          gradient="linear-gradient(145deg, #0c4a6e 0%, #0369a1 100%)"
          glow="rgba(12,74,110,0.35)"
        />
      </div>

      {/* ── Quick actions ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'New Article',   href: '/admin/articles/new', icon: 'M12 4v16m8-8H4',                        color: 'bg-[#142B6F] hover:bg-[#1a3a8f]' },
          { label: 'Comments',      href: '/admin/comments',     icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', color: 'bg-amber-700 hover:bg-amber-800' },
          { label: 'Media Library', href: '/admin/media',        icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-violet-700 hover:bg-violet-800' },
          { label: 'Settings',      href: '/admin/settings',     icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-slate-600 hover:bg-slate-700' },
        ] as { label: string; href: string; icon: string; color: string }[]).map(({ label, href, icon, color }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white text-sm font-semibold transition-colors ${color}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            {label}
          </Link>
        ))}
      </div>

      {/* ── Recent articles ─────────────────────────────────────────────────────── */}
      <AdminCard
        title="Recent Articles"
        padded={false}
        action={<Link href="/admin/articles" className="text-brand-ink hover:underline">View all →</Link>}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-canvas/60">
              <AdminTableHead>Title</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead>Updated</AdminTableHead>
              <AdminTableHead><span className="sr-only">Actions</span></AdminTableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {(recentArticles ?? []).map((article) => (
              <tr key={article.id} className={adminTableRowClass()}>
                <td className="px-5 py-3.5 font-medium text-brand-primary max-w-xs">
                  <span className="line-clamp-2 leading-snug">{article.title}</span>
                </td>
                <td className="px-5 py-3.5">
                  <AdminStatusBadge status={article.status} />
                </td>
                <td className="px-5 py-3.5 text-brand-muted text-xs hidden md:table-cell">
                  {new Date(article.updated_at).toLocaleDateString('en-GB')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/articles/${article.id}`} className="text-xs font-semibold text-brand-ink hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(recentArticles ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-brand-muted">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  gradient,
  glow,
  formatLarge = false,
}: {
  label: string
  value: number
  icon: string
  gradient: string
  glow: string
  formatLarge?: boolean
}) {
  const display = formatLarge
    ? value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : value >= 1_000
        ? `${(value / 1_000).toFixed(1)}k`
        : value.toLocaleString()
    : value.toLocaleString()

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden flex flex-col gap-3"
      style={{
        background: gradient,
        boxShadow: `0 4px 24px -4px ${glow}, 0 1px 4px rgba(0,0,0,0.12)`,
      }}
    >
      {/* Large faint background icon for depth */}
      <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-white">
          <path d={icon} />
        </svg>
      </div>

      {/* Icon badge */}
      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.75}
          strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]" aria-hidden="true">
          <path d={icon} />
        </svg>
      </div>

      {/* Value + label */}
      <div className="relative z-10">
        <p className="text-[28px] font-black text-white leading-none tracking-tight">
          {display}
        </p>
        <p className="text-xs font-semibold text-white/65 mt-1.5 uppercase tracking-wide leading-none">
          {label}
        </p>
      </div>
    </div>
  )
}


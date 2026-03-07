import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { getSubscribersForExport } from '@/lib/newsletter/queries'

// GET /admin/newsletter/export
// Returns a CSV of all confirmed, active newsletter subscribers.
// Protected: admin auth required.
export async function GET() {
  await requireAuth()

  const subscribers = await getSubscribersForExport()

  const rows = [
    ['email', 'confirmed', 'subscribed_at'],
    ...subscribers.map((s) => [
      s.email,
      s.confirmed ? 'true' : 'false',
      new Date(s.subscribed_at).toISOString(),
    ]),
  ]

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Access Denied',
  robots: { index: false },
}

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm text-slate-600">
          This account is signed in but does not have a valid Granite Post admin role.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/login"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to login
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            View site
          </Link>
        </div>
      </div>
    </div>
  )
}
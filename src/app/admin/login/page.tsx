import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(165deg, #060f1e 0%, #0d1e50 50%, #142B6F 100%)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFD601 0%, #F5C800 100%)' }}
            >
              <span className="text-granite-primary font-black text-sm">GP</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">Granite Post</span>
          </div>
          <p className="text-slate-400 text-sm">Sign in to the admin portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Welcome back</h2>
          <Suspense fallback={<div className="h-[200px] animate-pulse bg-gray-100 rounded-lg" aria-label="Loading login form..."></div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Restricted access · Authorised staff only
        </p>
      </div>
    </div>
  )
}
import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Zimbabwe News Online
          </h1>
          <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
        </div>
        <div className="bg-white p-8 shadow-xl">
          <h2 className="text-lg font-bold mb-6">Sign in</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

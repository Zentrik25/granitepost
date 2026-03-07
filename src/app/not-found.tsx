import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-brand-red mb-4">404</h1>
        <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
        <p className="text-brand-muted mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-brand-dark text-white text-sm font-bold hover:bg-brand-red transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

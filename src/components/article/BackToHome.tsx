import Link from 'next/link'

export function BackToHome() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 mb-4 group"
    >
      <svg
        className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 12L6 8l4-4" />
      </svg>
      <span>Back to Home</span>
    </Link>
  )
}

/**
 * Security headers for production hardening.
 *
 * CSP uses 'unsafe-inline' for scripts and styles because Next.js App Router
 * requires it for hydration and Tailwind inline styles. For a stricter policy,
 * implement nonce-based CSP via middleware (see Next.js docs on CSP with nonces).
 */

const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? ''

const supabaseWs = supabaseHost.replace(/^https?:/, 'wss:')

// Build CSP directives. Kept in a data structure so callers can extend if needed.
const CSP_DIRECTIVES: [string, string[]][] = [
  ['default-src', ["'self'"]],
  // unsafe-eval needed by Next.js dev mode; omit in production builds if possible
  ['script-src', ["'self'", "'unsafe-inline'"]],
  ['style-src', ["'self'", "'unsafe-inline'"]],
  // https: covers Supabase Storage CDN, hero images, OG images from any domain
  ['img-src', ["'self'", 'data:', 'blob:', 'https:']],
  ['font-src', ["'self'"]],
  [
    'connect-src',
    [
      "'self'",
      supabaseHost,
      supabaseWs,
      // Vercel speed insights + analytics (add only if you use them)
      'https://vitals.vercel-insights.com',
      'https://va.vercel-scripts.com',
    ].filter(Boolean),
  ],
  ['media-src', ["'self'", 'https:']],
  ['object-src', ["'none'"]],
  ['base-uri', ["'self'"]],
  ['form-action', ["'self'"]],
  // Prevent the site from being embedded in iframes anywhere
  ['frame-ancestors', ["'none'"]],
  // Force HTTPS for all sub-resources
  ['upgrade-insecure-requests', []],
]

function buildCsp(): string {
  return CSP_DIRECTIVES.map(([directive, values]) =>
    values.length ? `${directive} ${values.join(' ')}` : directive
  ).join('; ')
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': buildCsp(),
    // Redundant with frame-ancestors CSP but kept for older browsers
    'X-Frame-Options': 'DENY',
    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Control referrer information sent with requests
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Restrict browser APIs not needed by this site
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    // 1 year HSTS — only set this when HTTPS is fully configured
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Allow cross-origin resource sharing for the RSS feed and sitemaps
    'Cross-Origin-Resource-Policy': 'same-origin',
  }
}
/**
 * Image URL utilities — server-safe, no imports from server-only modules.
 */

/**
 * Convert a Supabase Storage URL to a permanent public URL.
 *
 * Supabase Storage has two URL shapes:
 *   Signed  : …/storage/v1/object/sign/<bucket>/<path>?token=eyJ…
 *   Public  : …/storage/v1/object/public/<bucket>/<path>
 *
 * WhatsApp and Google crawlers cache OG images at index time. Signed URLs
 * expire, so we must always expose the public variant.  For non-Supabase
 * URLs the input is returned unchanged.
 */
export function toPublicImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Strip query string from any Supabase storage URL (signed tokens, cache-busters)
  const isSupabaseStorage = url.includes('/storage/v1/object/')
  if (!isSupabaseStorage) {
    // Non-Supabase URL — return as-is but ensure it's absolute
    try {
      new URL(url) // throws if not absolute
      return url
    } catch {
      return null
    }
  }

  // Convert signed → public variant
  let clean = url
    .replace('/storage/v1/object/sign/', '/storage/v1/object/public/')
    .split('?')[0] // strip ?token=… and any other query params

  // Remove stray trailing slash that Supabase sometimes produces
  clean = clean.replace(/\/$/, '')

  return clean
}

/**
 * Pick the best OG image from an article's fields and return a clean
 * public URL, or null if neither field has a usable value.
 *
 * Priority: og_image_url → hero_image_url
 */
export function resolveOgImage(
  ogImageUrl: string | null | undefined,
  heroImageUrl: string | null | undefined
): string | null {
  return toPublicImageUrl(ogImageUrl) ?? toPublicImageUrl(heroImageUrl)
}
-- ============================================================
-- 012_storage_bucket.sql
-- Creates the 'media' Supabase Storage bucket and its object
-- access policies.  Also seeds the whatsapp_url site setting.
--
-- The bucket name 'media' matches STORAGE.MEDIA in src/db/schema.ts
-- and the storage_path column in the media table.
--
-- Run this in Supabase Studio → SQL Editor.
-- ============================================================

-- ── Create bucket ─────────────────────────────────────────────────────────────
-- public = true  → objects served at the CDN public URL without a signed URL.
-- file_size_limit = 10 MB (matches MAX_BYTES in MediaLibrary.tsx).
-- allowed_mime_types restricts uploads at the Storage layer as a second defence.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- ── Storage object policies ───────────────────────────────────────────────────
-- Policies live on storage.objects, not on the media DB table.
-- The DB-level RLS (media table) applies separately to the metadata row.

-- 1. Anyone can read/download public media files (CDN-public bucket).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can read media objects'
  ) THEN
    CREATE POLICY "Public can read media objects"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'media');
  END IF;
END $$;

-- 2. Any authenticated user (staff) can upload to the media bucket.
--    The DB-level RLS on the media table (is_author() check) applies separately.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload media'
  ) THEN
    CREATE POLICY "Authenticated users can upload media"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 3. Any authenticated user can delete objects from the media bucket.
--    (DB-level RLS on media table restricts this to editors+ separately.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can delete media'
  ) THEN
    CREATE POLICY "Authenticated users can delete media"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- ── Add whatsapp_url setting ──────────────────────────────────────────────────
INSERT INTO site_settings (key, value, description)
VALUES (
  'whatsapp_url',
  '',
  'WhatsApp channel or community link shown in the top navigation bar. Leave empty to hide.'
)
ON CONFLICT (key) DO NOTHING;

-- ── Allow public (anon) to read site_settings ─────────────────────────────────
-- The public layout fetches settings server-side using the service-role client
-- (createAdminClient), which bypasses RLS.  No policy change needed for that path.
-- This policy is kept for completeness if you ever want anon reads directly.
-- It is NOT required for the current implementation.
-- (Leave commented out — the admin client approach is safer.)
-- CREATE POLICY "Public can read site settings"
--   ON site_settings FOR SELECT
--   USING (true);

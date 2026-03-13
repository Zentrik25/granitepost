-- Add slug and title columns to profiles for public author pages

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS title text;

-- Fast slug lookups (author page ISR + generateStaticParams)
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles (slug);

-- RLS: public can read profiles (slug, full_name, bio, etc.) — no secrets exposed
-- Existing RLS policy on profiles already allows SELECT for authenticated;
-- add a policy for anon read of non-sensitive columns.
-- Only profiles that have a slug set are surfaced as author pages.
DROP POLICY IF EXISTS "Public can read profiles with slug" ON profiles;
CREATE POLICY "Public can read profiles with slug"
  ON profiles FOR SELECT
  TO anon
  USING (slug IS NOT NULL);

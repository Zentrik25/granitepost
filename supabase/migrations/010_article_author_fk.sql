-- Migration 010: Add FK from articles.author_id → profiles.id
-- This is required for PostgREST to resolve the author:profiles(...) join in ARTICLE_SELECT.
-- Without this FK in the public schema, the join fails with PGRST200 and all article queries return null.

-- Step 1: Ensure every auth.users row has a matching profiles row.
-- (handle_new_user() trigger covers sign-ups, but admin-API-created users may be missing.)
INSERT INTO public.profiles (id, full_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'Staff')
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add the FK constraint.
-- ON DELETE RESTRICT prevents orphaned articles.
ALTER TABLE public.articles
  ADD CONSTRAINT fk_articles_author_profile
  FOREIGN KEY (author_id) REFERENCES public.profiles(id)
  ON DELETE RESTRICT;

-- Optional: set a readable name for any admin user whose full_name is still null.
-- Adjust the WHERE clause to target specific user IDs if needed.
UPDATE public.profiles
SET full_name = 'Admin'
WHERE full_name IS NULL
  AND id IN (
    SELECT user_id FROM public.user_roles WHERE role = 'ADMIN'
  );
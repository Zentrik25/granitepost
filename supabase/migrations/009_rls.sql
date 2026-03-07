-- ============================================================
-- 009_rls.sql
-- Comprehensive, idempotent Row Level Security for all tables.
-- Supersedes the inline RLS blocks in 001–008.
-- Depends on: 001_profiles_roles.sql (RBAC helper functions)
-- ============================================================

-- ── Helper: ownership check for articles ─────────────────────────────────────
-- Returns true when the calling authenticated user authored the given article.
-- Used in WITH CHECK clauses to prevent authors from touching others' work.
create or replace function is_article_author(p_author_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select auth.uid() is not null and auth.uid() = p_author_id;
$$;

-- ── Helper: check whether status transition is author-safe ───────────────────
-- Authors may write DRAFT or REVIEW only; PUBLISHED/ARCHIVED require editor+.
create or replace function is_author_safe_status(p_status text)
returns boolean language sql immutable as $$
  select p_status in ('DRAFT', 'REVIEW');
$$;

-- ═════════════════════════════════════════════════════════════════════════════
-- profiles
-- ═════════════════════════════════════════════════════════════════════════════
alter table profiles enable row level security;

drop policy if exists "Public can view profiles"               on profiles;
drop policy if exists "Users can update their own profile"     on profiles;
drop policy if exists "Users can upsert their own profile"     on profiles;

-- Any visitor can see profile display data (used for article bylines).
create policy "Public can view profiles"
  on profiles for select
  using (true);

-- A user may only update their own row.
create policy "Users can update their own profile"
  on profiles for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow the handle_new_user() trigger path via service role;
-- direct client inserts are blocked (no anon/authenticated insert policy).

-- ═════════════════════════════════════════════════════════════════════════════
-- user_roles
-- ═════════════════════════════════════════════════════════════════════════════
alter table user_roles enable row level security;

drop policy if exists "Staff can view roles"        on user_roles;
drop policy if exists "Admins can manage roles"     on user_roles;
drop policy if exists "Admins can insert roles"     on user_roles;
drop policy if exists "Admins can update roles"     on user_roles;
drop policy if exists "Admins can delete roles"     on user_roles;

-- Any authenticated staff member may read the role table (needed for RBAC
-- functions to resolve their own role without privilege escalation).
create policy "Staff can view roles"
  on user_roles for select
  using (is_staff());

-- Only admins may grant or revoke roles.
create policy "Admins can insert roles"
  on user_roles for insert
  with check (is_admin());

create policy "Admins can update roles"
  on user_roles for update
  using  (is_admin())
  with check (is_admin());

create policy "Admins can delete roles"
  on user_roles for delete
  using (is_admin());

-- ═════════════════════════════════════════════════════════════════════════════
-- categories
-- ═════════════════════════════════════════════════════════════════════════════
alter table categories enable row level security;

drop policy if exists "Categories are publicly readable"   on categories;
drop policy if exists "Editors can manage categories"      on categories;
drop policy if exists "Editors can insert categories"      on categories;
drop policy if exists "Editors can update categories"      on categories;
drop policy if exists "Editors can delete categories"      on categories;

-- Public nav menus and article pages need category data.
create policy "Categories are publicly readable"
  on categories for select
  using (true);

-- Only editors+ may create, rename, or remove categories.
create policy "Editors can insert categories"
  on categories for insert
  with check (is_editor());

create policy "Editors can update categories"
  on categories for update
  using  (is_editor())
  with check (is_editor());

create policy "Editors can delete categories"
  on categories for delete
  using (is_editor());

-- ═════════════════════════════════════════════════════════════════════════════
-- tags
-- ═════════════════════════════════════════════════════════════════════════════
alter table tags enable row level security;

drop policy if exists "Tags are publicly readable"  on tags;
drop policy if exists "Authors can manage tags"     on tags;
drop policy if exists "Authors can insert tags"     on tags;
drop policy if exists "Authors can update tags"     on tags;
drop policy if exists "Editors can delete tags"     on tags;

-- Tags appear on public article pages.
create policy "Tags are publicly readable"
  on tags for select
  using (true);

-- Any staff author or above may create new tags (needed when filing articles).
create policy "Authors can insert tags"
  on tags for insert
  with check (is_author());

-- Renaming a tag is an editorial action; restrict to editor+.
create policy "Editors can update tags"
  on tags for update
  using  (is_editor())
  with check (is_editor());

-- Deleting a tag is destructive (cascades to article_tags); editor+ only.
create policy "Editors can delete tags"
  on tags for delete
  using (is_editor());

-- ═════════════════════════════════════════════════════════════════════════════
-- articles
-- ═════════════════════════════════════════════════════════════════════════════
alter table articles enable row level security;

drop policy if exists "Published articles are public"                        on articles;
drop policy if exists "Authors can create articles"                          on articles;
drop policy if exists "Authors update own articles; editors update any"      on articles;
drop policy if exists "Editors can delete articles"                          on articles;
drop policy if exists "Public reads published articles"                      on articles;
drop policy if exists "Authors read own articles"                            on articles;
drop policy if exists "Editors read all articles"                            on articles;
drop policy if exists "Authors insert own articles"                          on articles;
drop policy if exists "Authors update own draft articles"                    on articles;
drop policy if exists "Editors update any article"                           on articles;

-- Public: PUBLISHED articles only.
create policy "Public reads published articles"
  on articles for select
  using (status = 'PUBLISHED');

-- Authors: read their own articles regardless of status (drafts, review, etc.)
create policy "Authors read own articles"
  on articles for select
  using (is_author() and auth.uid() = author_id);

-- Editors+: read everything (all statuses, all authors).
create policy "Editors read all articles"
  on articles for select
  using (is_editor());

-- Authors may create articles only for themselves and only in non-published states.
create policy "Authors insert own articles"
  on articles for insert
  with check (
    is_author()
    and auth.uid() = author_id
    and is_author_safe_status(status::text)
  );

-- Authors may update their own articles but cannot set status to PUBLISHED/ARCHIVED.
create policy "Authors update own draft articles"
  on articles for update
  using  (is_author() and auth.uid() = author_id and status in ('DRAFT', 'REVIEW'))
  with check (
    is_author()
    and auth.uid() = author_id
    and is_author_safe_status(status::text)
  );

-- Editors may update any article and set any status (including PUBLISHED).
create policy "Editors update any article"
  on articles for update
  using  (is_editor())
  with check (is_editor());

-- Only editors+ may delete articles.
create policy "Editors delete articles"
  on articles for delete
  using (is_editor());

-- ═════════════════════════════════════════════════════════════════════════════
-- article_tags
-- ═════════════════════════════════════════════════════════════════════════════
alter table article_tags enable row level security;

drop policy if exists "Article tags are publicly readable"  on article_tags;
drop policy if exists "Authors can manage article tags"     on article_tags;
drop policy if exists "Public reads article tags"           on article_tags;
drop policy if exists "Authors manage own article tags"     on article_tags;
drop policy if exists "Editors manage any article tags"     on article_tags;

-- Tag join is needed for public article pages and tag listing pages.
create policy "Public reads article tags"
  on article_tags for select
  using (true);

-- Authors may manage tags only on articles they authored.
create policy "Authors manage own article tags"
  on article_tags for insert
  with check (
    is_author()
    and exists (
      select 1 from articles
      where id = article_id and author_id = auth.uid()
    )
  );

create policy "Authors delete own article tags"
  on article_tags for delete
  using (
    is_author()
    and exists (
      select 1 from articles
      where id = article_id and author_id = auth.uid()
    )
  );

-- Editors may manage tags on any article.
create policy "Editors manage any article tags"
  on article_tags for insert
  with check (is_editor());

create policy "Editors delete any article tags"
  on article_tags for delete
  using (is_editor());

-- ═════════════════════════════════════════════════════════════════════════════
-- media
-- ═════════════════════════════════════════════════════════════════════════════
alter table media enable row level security;

drop policy if exists "Media is publicly readable"              on media;
drop policy if exists "Staff can upload media"                  on media;
drop policy if exists "Uploaders and editors can update media"  on media;
drop policy if exists "Editors can delete media"                on media;

-- Media URLs are public CDN links; metadata must be readable for rendering.
create policy "Media is publicly readable"
  on media for select
  using (true);

-- Only authenticated staff (author+) may upload.
create policy "Authors can upload media"
  on media for insert
  with check (
    is_author()
    and auth.uid() = uploaded_by
  );

-- Uploaders may update their own assets' metadata; editors may update any.
create policy "Uploaders update own media"
  on media for update
  using  (is_author() and uploaded_by = auth.uid())
  with check (is_author() and uploaded_by = auth.uid());

create policy "Editors update any media"
  on media for update
  using  (is_editor())
  with check (is_editor());

-- Only editors+ may delete media records (also requires Storage object removal
-- at the application layer).
create policy "Editors delete media"
  on media for delete
  using (is_editor());

-- ═════════════════════════════════════════════════════════════════════════════
-- article_media
-- ═════════════════════════════════════════════════════════════════════════════
alter table article_media enable row level security;

drop policy if exists "Article media is publicly readable"  on article_media;
drop policy if exists "Authors can manage article media"    on article_media;
drop policy if exists "Public reads article media"          on article_media;
drop policy if exists "Authors manage own article media"    on article_media;
drop policy if exists "Editors manage any article media"    on article_media;

-- Needed to render inline images in published articles.
create policy "Public reads article media"
  on article_media for select
  using (true);

-- Authors may attach media only to their own articles.
create policy "Authors manage own article media"
  on article_media for insert
  with check (
    is_author()
    and exists (
      select 1 from articles
      where id = article_id and author_id = auth.uid()
    )
  );

create policy "Authors delete own article media"
  on article_media for delete
  using (
    is_author()
    and exists (
      select 1 from articles
      where id = article_id and author_id = auth.uid()
    )
  );

-- Editors may attach or remove media on any article.
create policy "Editors manage any article media"
  on article_media for insert
  with check (is_editor());

create policy "Editors delete any article media"
  on article_media for delete
  using (is_editor());

-- ═════════════════════════════════════════════════════════════════════════════
-- article_views_daily
-- ═════════════════════════════════════════════════════════════════════════════
alter table article_views_daily enable row level security;

drop policy if exists "Staff can read view data"  on article_views_daily;

-- Raw view data is an internal metric; staff only.
-- No INSERT/UPDATE/DELETE policies exist by design.
-- All writes go through record_article_view() (security definer), which
-- bypasses RLS entirely. Public and authenticated roles cannot write directly.
create policy "Staff can read view data"
  on article_views_daily for select
  using (is_staff());

-- ═════════════════════════════════════════════════════════════════════════════
-- comments
-- ═════════════════════════════════════════════════════════════════════════════
alter table comments enable row level security;

drop policy if exists "Public reads approved comments"   on comments;
drop policy if exists "Anyone can submit comments"       on comments;
drop policy if exists "Moderators can update comments"   on comments;
drop policy if exists "Moderators can delete comments"   on comments;
drop policy if exists "Moderators read all comments"     on comments;

-- Public: only APPROVED comments are visible.
create policy "Public reads approved comments"
  on comments for select
  using (status = 'APPROVED');

-- Moderators+: read all statuses (moderation queue).
create policy "Moderators read all comments"
  on comments for select
  using (is_moderator());

-- Anyone (including unauthenticated) may submit a comment.
-- Enforced constraints:
--   • status must be PENDING (application cannot self-approve)
--   • moderation fields must be null (cannot pre-set moderator identity)
--   • fingerprint hashes are set by the server action, not the client
create policy "Anyone can submit comments"
  on comments for insert
  with check (
    status = 'PENDING'
    and moderated_by   is null
    and moderated_at   is null
    and moderation_note is null
  );

-- Only moderators+ may change comment status, add moderation notes, etc.
-- Public users have no UPDATE policy at all.
create policy "Moderators update comments"
  on comments for update
  using  (is_moderator())
  with check (is_moderator());

-- Moderators may hard-delete comments (soft-delete via status='DELETED' preferred).
create policy "Moderators delete comments"
  on comments for delete
  using (is_moderator());

-- ═════════════════════════════════════════════════════════════════════════════
-- comment_moderation_log
-- ═════════════════════════════════════════════════════════════════════════════
alter table comment_moderation_log enable row level security;

drop policy if exists "Admins can read moderation log"          on comment_moderation_log;
drop policy if exists "Moderators can append to moderation log" on comment_moderation_log;

-- Moderation log is PII-adjacent (actions on user-submitted content); admins only.
create policy "Admins read moderation log"
  on comment_moderation_log for select
  using (is_admin());

-- Moderators may append entries; no UPDATE or DELETE — log is append-only.
create policy "Moderators append to moderation log"
  on comment_moderation_log for insert
  with check (
    is_moderator()
    and auth.uid() = moderator_id
  );

-- ═════════════════════════════════════════════════════════════════════════════
-- newsletter_subscribers
-- ═════════════════════════════════════════════════════════════════════════════
alter table newsletter_subscribers enable row level security;

drop policy if exists "Admins can read subscribers"    on newsletter_subscribers;
drop policy if exists "Anyone can subscribe"           on newsletter_subscribers;
drop policy if exists "Admins can update subscribers"  on newsletter_subscribers;
drop policy if exists "Admins can delete subscribers"  on newsletter_subscribers;

-- Subscriber list is PII; admins only.
create policy "Admins read subscribers"
  on newsletter_subscribers for select
  using (is_admin());

-- Public subscription endpoint.
-- Enforced constraints prevent clients from:
--   • self-confirming (confirmed must be false)
--   • setting confirmed_at
--   • backdating subscribed_at
--   • pre-setting the unsubscribe path
-- Tokens are generated by DB defaults; the application may not supply them.
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (
    confirmed       = false
    and confirmed_at  is null
    and unsubscribed_at is null
  );

-- Admins manage the subscriber lifecycle (confirm, reactivate, GDPR delete).
create policy "Admins update subscribers"
  on newsletter_subscribers for update
  using  (is_admin())
  with check (is_admin());

create policy "Admins delete subscribers"
  on newsletter_subscribers for delete
  using (is_admin());

-- ═════════════════════════════════════════════════════════════════════════════
-- site_settings
-- ═════════════════════════════════════════════════════════════════════════════
alter table site_settings enable row level security;

drop policy if exists "Staff can read site settings"     on site_settings;
drop policy if exists "Admins can manage site settings"  on site_settings;
drop policy if exists "Admins insert site settings"      on site_settings;
drop policy if exists "Admins update site settings"      on site_settings;
drop policy if exists "Admins delete site settings"      on site_settings;

-- All staff need to read settings for feature-flag checks (e.g. comments_enabled).
create policy "Staff read site settings"
  on site_settings for select
  using (is_staff());

-- Only admins may create, change, or remove settings.
create policy "Admins insert site settings"
  on site_settings for insert
  with check (is_admin());

create policy "Admins update site settings"
  on site_settings for update
  using  (is_admin())
  with check (is_admin());

create policy "Admins delete site settings"
  on site_settings for delete
  using (is_admin());

-- ═════════════════════════════════════════════════════════════════════════════
-- audit_logs
-- ═════════════════════════════════════════════════════════════════════════════
alter table audit_logs enable row level security;

drop policy if exists "Admins can read audit logs"  on audit_logs;

-- Audit log is security-sensitive; admins only.
-- No INSERT/UPDATE/DELETE policies exist by design.
-- All writes go through insert_audit_log() (security definer), which
-- bypasses RLS. Direct client writes are impossible.
create policy "Admins read audit logs"
  on audit_logs for select
  using (is_admin());

-- ═════════════════════════════════════════════════════════════════════════════
-- Grants for helper functions
-- ═════════════════════════════════════════════════════════════════════════════
grant execute on function is_article_author(uuid) to authenticated;
grant execute on function is_author_safe_status(text) to authenticated;

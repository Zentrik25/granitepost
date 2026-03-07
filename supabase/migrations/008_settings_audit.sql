-- ============================================================
-- 008_settings_audit.sql
-- Site settings (key/value store) and immutable audit log
-- Depends on: 001_profiles_roles.sql
-- ============================================================

-- ── site_settings ─────────────────────────────────────────────────────────────
-- Key/value table for runtime configuration.
-- Changes tracked in audit_logs via insert_audit_log() RPC.
create table site_settings (
  key          text        primary key,
  value        text        not null,
  -- Human-readable description of what the setting controls
  description  text,
  updated_by   uuid        references auth.users(id) on delete set null,
  updated_at   timestamptz not null default now()
);

-- ── Default settings seed ────────────────────────────────────────────────────
insert into site_settings (key, value, description) values
  ('site_name',          'Zimbabwe News Online',
   'Display name used in the site header, OG tags, and emails'),
  ('site_description',   'Breaking news and in-depth coverage from Zimbabwe and across Africa.',
   'Default meta description for the homepage'),
  ('contact_email',      'newsroom@zimbabwenewsonline.com',
   'Public newsroom contact email shown on the contact page'),
  ('twitter_handle',     '',
   'Twitter handle without the @ symbol'),
  ('facebook_url',       '',
   'Full URL of the Facebook page'),
  ('comments_enabled',   'true',
   'Set to "false" to disable comment submission site-wide'),
  ('newsletter_enabled', 'true',
   'Set to "false" to hide the newsletter signup form site-wide'),
  ('breaking_auto_expire_hours', '24',
   'Hours after which breaking news status is automatically expired');

-- ── audit_logs ────────────────────────────────────────────────────────────────
-- Append-only record of security-sensitive and editorially important actions.
-- Written via insert_audit_log() security-definer RPC — clients never write directly.
create table audit_logs (
  id            uuid        primary key default gen_random_uuid(),
  -- NULL when action is performed by an unauthenticated process / system
  user_id       uuid        references auth.users(id) on delete set null,

  -- Dot-namespaced action identifier, e.g. 'article.publish', 'comment.approve'
  action        text        not null,

  -- The table and primary key of the affected row (for fast lookup)
  target_table  text,
  target_id     uuid,

  -- JSON snapshots for diffing (old_values only set on UPDATE / DELETE)
  old_values    jsonb,
  new_values    jsonb,

  -- Request context
  ip_address    inet,
  user_agent    text,

  created_at    timestamptz not null default now(),

  constraint chk_audit_action_format check (action ~ '^[a-z_]+\.[a-z_]+$')
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- User activity feed
create index idx_audit_user_date
  on audit_logs(user_id, created_at desc);

-- Entity history (e.g. all changes to a specific article)
create index idx_audit_target
  on audit_logs(target_table, target_id, created_at desc);

-- Action-type reporting (e.g. all publish events)
create index idx_audit_action_date
  on audit_logs(action, created_at desc);

-- Overall chronological feed
create index idx_audit_created_at
  on audit_logs(created_at desc);

-- ── RPC: insert_audit_log ────────────────────────────────────────────────────
-- Called from server actions and route handlers.
-- Runs as security definer so it can always write audit_logs
-- regardless of the caller's RLS context.
create or replace function insert_audit_log(
  p_action       text,
  p_target_table text    default null,
  p_target_id    uuid    default null,
  p_old_values   jsonb   default null,
  p_new_values   jsonb   default null,
  p_ip_address   inet    default null,
  p_user_agent   text    default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Validate action format (e.g. 'article.publish')
  if p_action !~ '^[a-z_]+\.[a-z_]+$' then
    raise exception 'Invalid audit action format: %', p_action;
  end if;

  insert into audit_logs (
    user_id,
    action,
    target_table,
    target_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) values (
    auth.uid(),
    p_action,
    p_target_table,
    p_target_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent
  );
end;
$$;

grant execute on function insert_audit_log(text, text, uuid, jsonb, jsonb, inet, text)
  to authenticated;

-- ── RLS: site_settings ────────────────────────────────────────────────────────
alter table site_settings enable row level security;

-- Any staff member can read settings (needed for conditional feature flags)
create policy "Staff can read site settings"
  on site_settings for select
  using (is_staff());

-- Only admins can modify settings
create policy "Admins can manage site settings"
  on site_settings for all
  using (is_admin());

-- ── RLS: audit_logs ──────────────────────────────────────────────────────────
alter table audit_logs enable row level security;

-- Admins can read; nobody has a direct insert/update/delete policy.
-- All writes go through insert_audit_log() which runs as security definer.
create policy "Admins can read audit logs"
  on audit_logs for select
  using (is_admin());

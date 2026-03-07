-- ============================================================
-- 006_comments.sql
-- Comments, threading, and moderation audit log
-- Depends on: 001_profiles_roles.sql, 003_articles.sql
-- ============================================================

-- ── Enum: comment moderation states ──────────────────────────────────────────
create type comment_status as enum (
  'PENDING',    -- Awaiting moderation (default)
  'APPROVED',   -- Visible to the public
  'REJECTED',   -- Declined — not spam, but off-topic / rule-breaking
  'SPAM',       -- Flagged as spam
  'DELETED'     -- Soft-deleted (kept for audit; never shown)
);

-- ── comments ─────────────────────────────────────────────────────────────────
create table comments (
  id               uuid           primary key default gen_random_uuid(),
  article_id       uuid           not null references articles(id) on delete cascade,
  -- Self-referencing for threaded replies (max one level recommended for news)
  parent_id        uuid           references comments(id) on delete cascade,

  -- ── Commenter (no auth required) ──────────────────────────────────────────
  author_name      text           not null,
  author_email     citext         not null,
  author_url       text,           -- Optional website link

  -- ── Content ───────────────────────────────────────────────────────────────
  body             text           not null,

  -- ── Moderation ────────────────────────────────────────────────────────────
  status           comment_status not null default 'PENDING',
  moderated_by     uuid           references auth.users(id) on delete set null,
  moderated_at     timestamptz,
  moderation_note  text,           -- Internal note visible only to moderators

  -- ── Anti-abuse fingerprinting (never exposed to public) ───────────────────
  -- SHA-256(ip_address + salt). Used for rate-limiting and spam detection.
  ip_hash          text,
  user_agent_hash  text,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at       timestamptz    not null default now(),
  updated_at       timestamptz    not null default now(),

  -- ── Constraints ───────────────────────────────────────────────────────────
  constraint chk_comment_body_length    check (char_length(body) between 1 and 2000),
  constraint chk_comment_author_name    check (char_length(author_name) between 1 and 100),
  constraint chk_author_url_format      check (
    author_url is null
    or author_url ~* '^https?://'
  ),
  constraint chk_moderation_consistency check (
    -- moderated_by and moderated_at must both be set or both be null
    (moderated_by is null) = (moderated_at is null)
  ),
  constraint chk_no_self_parent check (parent_id <> id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Public comment feed for an article (approved only, chronological)
create index idx_comments_article_approved
  on comments(article_id, created_at asc)
  where status = 'APPROVED';

-- Admin moderation queue (by status, newest first)
create index idx_comments_status_date
  on comments(status, created_at desc);

-- Article-level moderation view (all statuses)
create index idx_comments_article_status
  on comments(article_id, status, created_at desc);

-- Thread lookup
create index idx_comments_parent_id
  on comments(parent_id)
  where parent_id is not null;

create trigger trg_comments_updated_at
  before update on comments
  for each row execute procedure set_updated_at();

-- ── comment_moderation_log ───────────────────────────────────────────────────
-- Immutable audit trail for every moderation decision.
-- Append-only: no UPDATE or DELETE policies.
create table comment_moderation_log (
  id            uuid        primary key default gen_random_uuid(),
  comment_id    uuid        not null references comments(id) on delete cascade,
  moderator_id  uuid        references auth.users(id) on delete set null,
  -- Action taken: mirrors comment_status values + 'RESTORED'
  action        text        not null,
  -- Reason / internal note
  note          text,
  created_at    timestamptz not null default now(),

  constraint chk_moderation_action check (
    action in ('APPROVED', 'REJECTED', 'SPAM', 'DELETED', 'RESTORED', 'PENDING')
  )
);

create index idx_mod_log_comment    on comment_moderation_log(comment_id, created_at desc);
create index idx_mod_log_moderator  on comment_moderation_log(moderator_id, created_at desc);

-- ── RLS: comments ────────────────────────────────────────────────────────────
alter table comments                enable row level security;
alter table comment_moderation_log  enable row level security;

-- Public: only APPROVED comments
create policy "Public reads approved comments"
  on comments for select
  using (status = 'APPROVED' or is_moderator());

-- Anyone can submit a comment; application layer sets status = 'PENDING'.
create policy "Anyone can submit comments"
  on comments for insert
  with check (status = 'PENDING');

-- Only moderators can change status, add notes, etc.
create policy "Moderators can update comments"
  on comments for update
  using (is_moderator());

create policy "Moderators can delete comments"
  on comments for delete
  using (is_moderator());

-- ── RLS: comment_moderation_log ──────────────────────────────────────────────
-- Only admins read; inserts happen in server actions (authenticated role).
create policy "Admins can read moderation log"
  on comment_moderation_log for select
  using (is_admin());

create policy "Moderators can append to moderation log"
  on comment_moderation_log for insert
  with check (is_moderator());

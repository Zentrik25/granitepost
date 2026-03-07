-- ============================================================
-- 007_newsletter.sql
-- Newsletter subscribers with double-opt-in and unsubscribe tokens
-- Depends on: 001_profiles_roles.sql
-- ============================================================

-- ── newsletter_subscribers ────────────────────────────────────────────────────
create table newsletter_subscribers (
  id                  uuid        primary key default gen_random_uuid(),
  email               citext      not null,

  -- ── Consent state ─────────────────────────────────────────────────────────
  confirmed           boolean     not null default false,
  confirmed_at        timestamptz,

  -- ── Tokens ────────────────────────────────────────────────────────────────
  -- Used in the double-opt-in confirmation email link.
  confirmation_token  text        unique default encode(gen_random_bytes(32), 'hex'),
  -- Used in all unsubscribe links. Separate from confirmation_token so that
  -- the act of confirming does not expose the unsubscribe token, and vice versa.
  unsubscribe_token   text        unique not null default encode(gen_random_bytes(32), 'hex'),

  -- ── Attribution ───────────────────────────────────────────────────────────
  -- Where the subscription originated (e.g. 'website', 'article_footer', 'admin')
  source              text        not null default 'website',

  -- ── Lifecycle ─────────────────────────────────────────────────────────────
  subscribed_at       timestamptz not null default now(),
  unsubscribed_at     timestamptz,

  -- ── Constraints ───────────────────────────────────────────────────────────
  constraint uq_newsletter_email          unique (email),
  constraint chk_email_format             check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- confirmed_at must be set when confirmed = true
  constraint chk_confirmed_at_consistency check (
    (confirmed = false) or (confirmed_at is not null)
  ),
  -- Cannot be both confirmed and unsubscribed at the same time
  -- (re-subscribe first resets unsubscribed_at)
  constraint chk_not_both_states check (
    not (confirmed = true and unsubscribed_at is not null)
    or unsubscribed_at is not null  -- allow unsubscribed after confirmed
  )
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Admin lookup by email
create index idx_newsletter_email
  on newsletter_subscribers(email);

-- Admin list: confirmed subscribers, newest first
create index idx_newsletter_confirmed_date
  on newsletter_subscribers(confirmed, subscribed_at desc);

-- Token lookups (confirmation and unsubscribe links)
-- Partial indexes on active rows only for speed
create index idx_newsletter_confirmation_token
  on newsletter_subscribers(confirmation_token)
  where confirmed = false and confirmation_token is not null;

create index idx_newsletter_unsubscribe_token
  on newsletter_subscribers(unsubscribe_token)
  where unsubscribed_at is null;

-- Source attribution reporting
create index idx_newsletter_source
  on newsletter_subscribers(source, subscribed_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table newsletter_subscribers enable row level security;

-- Only admins can read the subscriber list (PII protection)
create policy "Admins can read subscribers"
  on newsletter_subscribers for select
  using (is_admin());

-- Anyone can subscribe (unauthenticated POST /api/newsletter/subscribe)
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

-- Admins update (confirm, re-activate) and manage subscribers
create policy "Admins can update subscribers"
  on newsletter_subscribers for update
  using (is_admin());

create policy "Admins can delete subscribers"
  on newsletter_subscribers for delete
  using (is_admin());

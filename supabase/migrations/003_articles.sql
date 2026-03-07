-- ============================================================
-- 003_articles.sql
-- Articles and article_tags pivot table
-- Depends on: 001_profiles_roles.sql, 002_taxonomy.sql
-- ============================================================

-- ── Enum: editorial workflow states ──────────────────────────────────────────
create type article_status as enum ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- ── articles ──────────────────────────────────────────────────────────────────
create table articles (
  id                   uuid           primary key default gen_random_uuid(),

  -- ── Core content ──────────────────────────────────────────────────────────
  title                text           not null,
  slug                 citext         not null,
  excerpt              text,
  -- HTML body stored as text; sanitised before insert via server action.
  body_html            text           not null default '',

  -- ── Editorial classification ───────────────────────────────────────────────
  status               article_status not null default 'DRAFT',
  category_id          uuid           references categories(id) on delete set null,
  author_id            uuid           not null references auth.users(id) on delete restrict,

  -- ── Hero image ────────────────────────────────────────────────────────────
  hero_image_url       text,
  hero_image_alt       text,
  hero_image_caption   text,
  hero_image_credit    text,   -- Photographer / agency credit line

  -- ── Editorial signals ─────────────────────────────────────────────────────
  -- NULL = not featured. 1 = lead hero. Higher integers = lower priority.
  featured_rank        smallint,
  is_breaking          boolean        not null default false,
  -- If set, is_breaking should be auto-cleared after this timestamp.
  breaking_expires_at  timestamptz,

  -- ── SEO / Open Graph overrides ────────────────────────────────────────────
  og_title             text,
  og_description       text,
  -- Must be >= 1200 × 630 px per OG spec; validated at application layer.
  og_image_url         text,
  -- Set only when the canonical differs from /article/slug (e.g. syndication).
  canonical_url        text,

  -- ── Denormalised metrics (updated by RPC, never by direct client writes) ──
  view_count           bigint         not null default 0,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  published_at         timestamptz,
  created_at           timestamptz    not null default now(),
  updated_at           timestamptz    not null default now(),

  -- ── Constraints ───────────────────────────────────────────────────────────
  constraint uq_articles_slug           unique (slug),
  constraint chk_featured_rank          check (featured_rank is null or featured_rank > 0),
  constraint chk_breaking_expiry        check (
    breaking_expires_at is null or is_breaking = true
  ),
  constraint chk_published_at_required  check (
    status <> 'PUBLISHED' or published_at is not null
  ),
  constraint chk_view_count_nonneg      check (view_count >= 0)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Primary feed query: published articles by date
create index idx_articles_status_published
  on articles(status, published_at desc);

-- Slug lookup (article page, ISR revalidation)
create index idx_articles_slug
  on articles(slug);

-- Category page: published articles in a category
create index idx_articles_category_status
  on articles(category_id, published_at desc)
  where status = 'PUBLISHED';

-- Author management view
create index idx_articles_author_status
  on articles(author_id, updated_at desc);

-- Homepage hero query: featured articles
create index idx_articles_featured_rank
  on articles(featured_rank asc, published_at desc)
  where status = 'PUBLISHED' and featured_rank is not null;

-- Breaking bar: active breaking news
create index idx_articles_breaking
  on articles(is_breaking, published_at desc)
  where is_breaking = true and status = 'PUBLISHED';

-- RSS / sitemap: all published, ordered by date
create index idx_articles_published_desc
  on articles(published_at desc)
  where status = 'PUBLISHED';

create trigger trg_articles_updated_at
  before update on articles
  for each row execute procedure set_updated_at();

-- ── article_tags ──────────────────────────────────────────────────────────────
create table article_tags (
  article_id  uuid not null references articles(id) on delete cascade,
  tag_id      uuid not null references tags(id)     on delete cascade,
  primary key (article_id, tag_id)
);

-- Reverse lookup: all articles for a given tag
create index idx_article_tags_tag_id on article_tags(tag_id);

-- ── RLS: articles ────────────────────────────────────────────────────────────
alter table articles enable row level security;

-- Public can only see PUBLISHED articles.
-- Staff (any role) can see all statuses.
create policy "Published articles are public"
  on articles for select
  using (status = 'PUBLISHED' or is_author());

create policy "Authors can create articles"
  on articles for insert
  with check (is_author() and auth.uid() = author_id);

-- Authors edit their own; editors and admins edit any.
create policy "Authors update own articles; editors update any"
  on articles for update
  using (
    is_editor()
    or (is_author() and auth.uid() = author_id)
  );

create policy "Editors can delete articles"
  on articles for delete
  using (is_editor());

-- ── RLS: article_tags ────────────────────────────────────────────────────────
alter table article_tags enable row level security;

create policy "Article tags are publicly readable"
  on article_tags for select
  using (true);

create policy "Authors can manage article tags"
  on article_tags for all
  using (is_author());

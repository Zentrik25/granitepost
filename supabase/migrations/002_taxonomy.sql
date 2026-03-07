-- ============================================================
-- 002_taxonomy.sql
-- Categories and Tags
-- Depends on: 001_profiles_roles.sql (set_updated_at, RBAC functions)
-- ============================================================

-- ── categories ───────────────────────────────────────────────────────────────
create table categories (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  slug             citext      not null,
  description      text,
  seo_title        text,
  seo_description  text,
  -- Hierarchical support (one level of nesting is sufficient for news)
  parent_id        uuid        references categories(id) on delete set null,
  display_order    int         not null default 0,
  is_active        boolean     not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint uq_categories_slug unique (slug),
  constraint chk_no_self_parent check (parent_id <> id)
);

-- Fast lookup by slug (all queries use this)
create index idx_categories_slug        on categories(slug);
-- Homepage nav ordering
create index idx_categories_order       on categories(display_order) where is_active = true;
-- Subcategory lookups
create index idx_categories_parent_id   on categories(parent_id) where parent_id is not null;

create trigger trg_categories_updated_at
  before update on categories
  for each row execute procedure set_updated_at();

-- ── tags ─────────────────────────────────────────────────────────────────────
create table tags (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        citext      not null,
  created_at  timestamptz not null default now(),
  constraint uq_tags_slug  unique (slug),
  constraint uq_tags_name  unique (name)
);

create index idx_tags_slug on tags(slug);

-- ── RLS: categories ──────────────────────────────────────────────────────────
alter table categories enable row level security;

create policy "Categories are publicly readable"
  on categories for select
  using (true);

create policy "Editors can manage categories"
  on categories for all
  using (is_editor());

-- ── RLS: tags ────────────────────────────────────────────────────────────────
alter table tags enable row level security;

create policy "Tags are publicly readable"
  on tags for select
  using (true);

create policy "Authors can manage tags"
  on tags for all
  using (is_author());

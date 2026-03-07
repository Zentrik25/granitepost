-- ============================================================
-- 004_media.sql
-- Media assets (backed by Supabase Storage bucket "media")
-- Depends on: 001_profiles_roles.sql, 003_articles.sql
-- ============================================================

-- ── Enum: asset type ─────────────────────────────────────────────────────────
create type media_type as enum ('IMAGE', 'VIDEO', 'DOCUMENT');

-- ── media ─────────────────────────────────────────────────────────────────────
-- One row per file uploaded to Supabase Storage.
-- Deleting this row should be paired with deleting the storage object
-- (handled in the application layer, not a DB trigger, to avoid coupling).
create table media (
  id            uuid        primary key default gen_random_uuid(),

  -- Storage
  filename      text        not null,
  storage_path  text        not null,  -- Path within the "media" bucket
  url           text        not null,  -- Public CDN URL

  -- Descriptive metadata
  alt_text      text,
  credit        text,        -- Photographer / agency / copyright line
  caption       text,

  -- Technical metadata
  mime_type     text        not null,
  media_type    media_type  not null default 'IMAGE',
  width         int,
  height        int,
  size_bytes    bigint      not null default 0,

  -- Ownership
  uploaded_by   uuid        not null references auth.users(id) on delete restrict,

  created_at    timestamptz not null default now(),

  constraint uq_media_storage_path  unique (storage_path),
  constraint uq_media_url           unique (url),
  constraint chk_media_width        check (width  is null or width  > 0),
  constraint chk_media_height       check (height is null or height > 0),
  constraint chk_media_size         check (size_bytes >= 0)
);

create index idx_media_uploaded_by_date on media(uploaded_by, created_at desc);
create index idx_media_type_date        on media(media_type,  created_at desc);

-- ── article_media ─────────────────────────────────────────────────────────────
-- Optional junction: attach multiple media assets to an article in-body.
-- The hero image is stored directly on articles.hero_image_url for simplicity;
-- this table handles body / gallery assets and future multi-image features.
create table article_media (
  id          uuid        primary key default gen_random_uuid(),
  article_id  uuid        not null references articles(id) on delete cascade,
  media_id    uuid        not null references media(id)    on delete restrict,
  -- Ordering within the article
  position    smallint    not null default 0,
  -- Role of the asset in the article context
  role        text        not null default 'body',
    -- 'hero'    – alternative/duplicate hero reference
    -- 'body'    – inline image in article body
    -- 'gallery' – gallery item
  created_at  timestamptz not null default now(),

  constraint uq_article_media_pair unique (article_id, media_id),
  constraint chk_article_media_role check (role in ('hero', 'body', 'gallery'))
);

create index idx_article_media_article on article_media(article_id, position asc);
create index idx_article_media_media   on article_media(media_id);

-- ── RLS: media ───────────────────────────────────────────────────────────────
alter table media         enable row level security;
alter table article_media enable row level security;

-- Public can read all media metadata (URLs are CDN-public anyway)
create policy "Media is publicly readable"
  on media for select
  using (true);

create policy "Staff can upload media"
  on media for insert
  with check (is_author());

-- Uploaders can update their own; editors can update any
create policy "Uploaders and editors can update media"
  on media for update
  using (
    is_editor()
    or (is_author() and uploaded_by = auth.uid())
  );

create policy "Editors can delete media"
  on media for delete
  using (is_editor());

-- article_media
create policy "Article media is publicly readable"
  on article_media for select
  using (true);

create policy "Authors can manage article media"
  on article_media for all
  using (is_author());

-- ============================================================
-- 005_views.sql
-- Article view tracking (daily buckets) + analytics RPCs
-- Depends on: 001_profiles_roles.sql, 003_articles.sql
-- ============================================================

-- ── article_views_daily ───────────────────────────────────────────────────────
-- One row per (article, day). Written ONLY via record_article_view() RPC.
-- Public users cannot insert or update directly — enforced by RLS + no policy.
create table article_views_daily (
  id          uuid    primary key default gen_random_uuid(),
  article_id  uuid    not null references articles(id) on delete cascade,
  day         date    not null default current_date,
  view_count  bigint  not null default 0,

  constraint uq_article_views_day unique (article_id, day),
  constraint chk_view_count check (view_count >= 0)
);

-- Primary query pattern: views for one article over a date range
create index idx_views_article_day
  on article_views_daily(article_id, day desc);

-- Aggregate across all articles for a given day (dashboard overview)
create index idx_views_day
  on article_views_daily(day desc);

-- ── RLS: article_views_daily ─────────────────────────────────────────────────
alter table article_views_daily enable row level security;

-- Only staff can read raw view data; public never needs it.
-- There is intentionally NO insert/update policy — the RPC runs as
-- security definer and bypasses RLS.
create policy "Staff can read view data"
  on article_views_daily for select
  using (is_staff());

-- ── RPC: record_article_view ─────────────────────────────────────────────────
-- Called by POST /api/views.
-- Validates the article is PUBLISHED before counting.
-- Upserts the daily row and increments the denormalised view_count on articles.
create or replace function record_article_view(p_article_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Guard: only count views on published articles
  if not exists (
    select 1 from articles
    where id = p_article_id and status = 'PUBLISHED'
  ) then
    return;
  end if;

  -- Upsert today's daily bucket
  insert into article_views_daily (article_id, day, view_count)
  values (p_article_id, current_date, 1)
  on conflict (article_id, day)
  do update set view_count = article_views_daily.view_count + 1;

  -- Increment the denormalised rolling total
  update articles
  set view_count = view_count + 1
  where id = p_article_id;
end;
$$;

-- ── RPC: most_read_24h ────────────────────────────────────────────────────────
-- Top N articles by views in the last 24 hours.
-- Used by: homepage Most Read widget, article page sidebar.
create or replace function most_read_24h(p_limit int default 5)
returns table (
  article_id     uuid,
  title          text,
  slug           text,
  hero_image_url text,
  total_views    bigint
) language sql security definer stable set search_path = public as $$
  select
    a.id,
    a.title,
    a.slug,
    a.hero_image_url,
    coalesce(sum(v.view_count), 0) as total_views
  from articles a
  left join article_views_daily v
    on v.article_id = a.id
    and v.day >= current_date - interval '1 day'
  where a.status = 'PUBLISHED'
  group by a.id, a.title, a.slug, a.hero_image_url
  order by total_views desc, a.published_at desc
  limit p_limit;
$$;

-- ── RPC: most_read_7d ─────────────────────────────────────────────────────────
-- Top N articles by views over the last 7 days.
-- Used by: admin analytics dashboard.
create or replace function most_read_7d(p_limit int default 10)
returns table (
  article_id     uuid,
  title          text,
  slug           text,
  hero_image_url text,
  total_views    bigint
) language sql security definer stable set search_path = public as $$
  select
    a.id,
    a.title,
    a.slug,
    a.hero_image_url,
    coalesce(sum(v.view_count), 0) as total_views
  from articles a
  left join article_views_daily v
    on v.article_id = a.id
    and v.day >= current_date - interval '7 days'
  where a.status = 'PUBLISHED'
  group by a.id, a.title, a.slug, a.hero_image_url
  order by total_views desc, a.published_at desc
  limit p_limit;
$$;

-- ── RPC: views_series ─────────────────────────────────────────────────────────
-- Daily view series for a single article over a rolling window.
-- Used by: article analytics chart in the admin editor.
create or replace function views_series(
  p_article_id uuid,
  p_days       int default 30
)
returns table (
  day        date,
  view_count bigint
) language sql security definer stable set search_path = public as $$
  select
    gs.day::date,
    coalesce(v.view_count, 0) as view_count
  from generate_series(
    current_date - (p_days - 1) * interval '1 day',
    current_date,
    interval '1 day'
  ) as gs(day)
  left join article_views_daily v
    on v.article_id = p_article_id
    and v.day = gs.day::date
  order by gs.day asc;
$$;

-- ── RPC: top_articles ─────────────────────────────────────────────────────────
-- Top N articles by views over a configurable day window.
-- Used by: admin analytics page.
create or replace function top_articles(
  p_days  int default 7,
  p_limit int default 20
)
returns table (
  article_id     uuid,
  title          text,
  slug           text,
  category_name  text,
  hero_image_url text,
  total_views    bigint,
  published_at   timestamptz
) language sql security definer stable set search_path = public as $$
  select
    a.id,
    a.title,
    a.slug,
    c.name                               as category_name,
    a.hero_image_url,
    coalesce(sum(v.view_count), 0)       as total_views,
    a.published_at
  from articles a
  left join categories c
    on c.id = a.category_id
  left join article_views_daily v
    on v.article_id = a.id
    and v.day >= current_date - (p_days - 1) * interval '1 day'
  where a.status = 'PUBLISHED'
  group by
    a.id, a.title, a.slug, c.name, a.hero_image_url, a.published_at
  order by total_views desc, a.published_at desc
  limit p_limit;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
-- Public RPCs (called from /api/views and public components)
grant execute on function record_article_view(uuid)  to anon, authenticated;
grant execute on function most_read_24h(int)          to anon, authenticated;
grant execute on function most_read_7d(int)           to anon, authenticated;
-- Admin-only RPCs
grant execute on function views_series(uuid, int)     to authenticated;
grant execute on function top_articles(int, int)      to authenticated;

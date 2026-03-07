-- ============================================================
-- Zimbabwe News Online — RPC / Analytics Functions
-- ============================================================

-- ── record_article_view ───────────────────────────────────────────────────────
-- Called by the public-facing API route to increment view counts safely.
-- Runs as security definer so it can write to article_views_daily
-- and articles.view_count without exposing direct table writes.
create or replace function record_article_view(p_article_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Upsert daily row
  insert into article_views_daily (article_id, day, view_count)
  values (p_article_id, current_date, 1)
  on conflict (article_id, day)
  do update set view_count = article_views_daily.view_count + 1;

  -- Increment rolling total on the article
  update articles
  set view_count = view_count + 1
  where id = p_article_id;
end;
$$;

-- ── most_read_24h ─────────────────────────────────────────────────────────────
create or replace function most_read_24h(p_limit int default 5)
returns table (
  article_id    uuid,
  title         text,
  slug          text,
  hero_image_url text,
  total_views   bigint
) language sql security definer stable set search_path = public as $$
  select
    a.id           as article_id,
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

-- ── most_read_7d ──────────────────────────────────────────────────────────────
create or replace function most_read_7d(p_limit int default 10)
returns table (
  article_id     uuid,
  title          text,
  slug           text,
  hero_image_url text,
  total_views    bigint
) language sql security definer stable set search_path = public as $$
  select
    a.id           as article_id,
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

-- ── views_series ──────────────────────────────────────────────────────────────
-- Returns daily view counts for a specific article over a date range.
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
  order by gs.day;
$$;

-- ── top_articles ──────────────────────────────────────────────────────────────
-- Admin dashboard: top articles by views in a given day range.
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
    a.id           as article_id,
    a.title,
    a.slug,
    c.name         as category_name,
    a.hero_image_url,
    coalesce(sum(v.view_count), 0) as total_views,
    a.published_at
  from articles a
  left join categories c on c.id = a.category_id
  left join article_views_daily v
    on v.article_id = a.id
    and v.day >= current_date - (p_days - 1) * interval '1 day'
  where a.status = 'PUBLISHED'
  group by a.id, a.title, a.slug, c.name, a.hero_image_url, a.published_at
  order by total_views desc, a.published_at desc
  limit p_limit;
$$;

-- ── insert_audit_log ─────────────────────────────────────────────────────────
-- Server-side helper to write audit entries safely.
create or replace function insert_audit_log(
  p_user_id     uuid,
  p_action      text,
  p_target_table text default null,
  p_target_id   uuid default null,
  p_payload     jsonb default null,
  p_ip_address  inet default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs (user_id, action, target_table, target_id, payload, ip_address)
  values (p_user_id, p_action, p_target_table, p_target_id, p_payload, p_ip_address);
end;
$$;

-- ── Grant execute to anon/authenticated for public RPCs ───────────────────────
grant execute on function record_article_view(uuid)   to anon, authenticated;
grant execute on function most_read_24h(int)          to anon, authenticated;
grant execute on function most_read_7d(int)           to anon, authenticated;
-- views_series and top_articles are admin-only
grant execute on function views_series(uuid, int)     to authenticated;
grant execute on function top_articles(int, int)      to authenticated;

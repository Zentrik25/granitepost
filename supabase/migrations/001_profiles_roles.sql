-- ============================================================
-- 001_profiles_roles.sql
-- Profiles, user roles, shared helper functions, and RLS
-- Run first — all other migrations depend on the RBAC functions.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Shared trigger: set updated_at on every UPDATE ───────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Enum: staff roles ─────────────────────────────────────────────────────────
create type user_role as enum ('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR');

-- ── profiles ──────────────────────────────────────────────────────────────────
-- One row per auth.users row. Auto-created by trigger on sign-up.
create table profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  full_name       text,
  avatar_url      text,
  bio             text,
  twitter_handle  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- Auto-create profile row when a new auth.users row is inserted.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── user_roles ────────────────────────────────────────────────────────────────
-- One role per user (single-role model; extend to many-to-many if needed later).
create table user_roles (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  role        user_role   not null,
  granted_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint uq_user_roles_user_id unique (user_id)
);

create index idx_user_roles_user_id on user_roles(user_id);

-- ── RBAC helper functions ─────────────────────────────────────────────────────
-- These are called inside RLS policies on every table.
-- security definer + hardened search_path prevents privilege escalation.

create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function is_editor()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role in ('ADMIN', 'EDITOR')
  );
$$;

create or replace function is_author()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role in ('ADMIN', 'EDITOR', 'AUTHOR')
  );
$$;

create or replace function is_moderator()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role in ('ADMIN', 'EDITOR', 'MODERATOR')
  );
$$;

create or replace function is_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from user_roles where user_id = auth.uid()
  );
$$;

-- ── RLS: profiles ────────────────────────────────────────────────────────────
alter table profiles enable row level security;

create policy "Public can view profiles"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ── RLS: user_roles ──────────────────────────────────────────────────────────
alter table user_roles enable row level security;

create policy "Staff can view roles"
  on user_roles for select
  using (is_staff());

create policy "Admins can manage roles"
  on user_roles for all
  using (is_admin());

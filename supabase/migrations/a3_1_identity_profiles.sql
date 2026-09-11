-- A3-1 · Minimum identity schema for Supabase Auth (including Anonymous)
-- Apply in Supabase SQL Editor (or CLI) against the LIVV project.
-- Does NOT enable Anonymous Sign-ins (Dashboard → Authentication → Providers).
-- Does NOT create records / pack_state / subscriptions (later batches).
-- Idempotent where practical.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users id (anonymous or linked)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null default '',
  bio text not null default '',
  photo_url text,
  accent text not null default '#4C8DFF',
  appearance text not null default 'dark',
  -- Display/cache only until server entitlements exist. Not payment authority.
  tier text not null default 'spark',
  embers integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    char_length(username) >= 3 and char_length(username) <= 32
  )
);

-- Unique username (required for claim later; anon placeholders are unique by uid)
create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username));

create index if not exists profiles_created_at_idx
  on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------------
-- Bootstrap profile on every new auth user (anonymous or registered)
-- Placeholder username: anon_<12 hex chars from uid> — unique, valid length
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  placeholder text;
begin
  placeholder := 'anon_' || substr(replace(new.id::text, '-', ''), 1, 12);

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    placeholder,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS: own row only (works for anonymous and linked users — same auth.uid())
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy: users should not delete their profile row via client.
-- Cascade from auth.users handles account deletion.

-- ---------------------------------------------------------------------------
-- Grants (authenticated role includes anonymous sessions in Supabase)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;

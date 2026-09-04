-- LIVV core schema (run in Supabase SQL editor when ready)
-- Enables multi-device sync + real accounts later.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text not null default '',
  bio text not null default '',
  photo_url text,
  accent text not null default '#4C8DFF',
  appearance text not null default 'dark',
  tier text not null default 'spark',
  embers int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.records (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.pack_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tier text not null default 'spark',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.pack_state enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "records_own" on public.records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "packs_own" on public.pack_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subs_own" on public.subscriptions
  for select using (auth.uid() = user_id);

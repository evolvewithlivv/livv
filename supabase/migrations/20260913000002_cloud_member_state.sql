-- Persist member-owned application state in Supabase so progress survives
-- browser/device loss. One row belongs to exactly one authenticated user.
create table if not exists public.member_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists member_state_updated_at_idx
  on public.member_state (updated_at desc);

alter table public.member_state enable row level security;

drop policy if exists "member_state_select_own" on public.member_state;
create policy "member_state_select_own"
  on public.member_state
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "member_state_insert_own" on public.member_state;
create policy "member_state_insert_own"
  on public.member_state
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "member_state_update_own" on public.member_state;
create policy "member_state_update_own"
  on public.member_state
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.member_state to authenticated;

create or replace function public.set_member_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists member_state_set_updated_at on public.member_state;
create trigger member_state_set_updated_at
  before update on public.member_state
  for each row
  execute function public.set_member_state_updated_at();

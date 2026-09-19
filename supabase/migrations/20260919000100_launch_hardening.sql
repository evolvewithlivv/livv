-- LIVV launch hardening: billing RLS + EVALA rate limiting.
-- Keep this migration idempotent so it can reconcile an environment where the
-- billing policy changes were already applied manually.

drop function if exists public.consume_evala_rate_limit(integer, integer);
drop table if exists private.evala_rate_limits;

create table if not exists public.evala_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  constraint evala_rate_limits_count_nonnegative check (request_count >= 0)
);

alter table public.evala_rate_limits enable row level security;

drop policy if exists "evala_rate_limits_select_own" on public.evala_rate_limits;
create policy "evala_rate_limits_select_own" on public.evala_rate_limits
for select to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

drop policy if exists "evala_rate_limits_insert_own" on public.evala_rate_limits;
create policy "evala_rate_limits_insert_own" on public.evala_rate_limits
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

drop policy if exists "evala_rate_limits_update_own" on public.evala_rate_limits;
create policy "evala_rate_limits_update_own" on public.evala_rate_limits
for update to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
)
with check (
  (select auth.uid()) = user_id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

create index if not exists evala_rate_limits_window_idx
  on public.evala_rate_limits (window_started_at);

create or replace function public.consume_evala_rate_limit(
  p_limit integer default 20,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_started timestamptz;
  v_count integer;
  v_now timestamptz := clock_timestamp();
begin
  v_user_id := (select auth.uid());

  if v_user_id is null
     or coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false)
  then
    return false;
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.evala_rate_limits (user_id, window_started_at, request_count)
  values (v_user_id, v_now, 1)
  on conflict (user_id) do nothing;

  select window_started_at, request_count
    into v_started, v_count
    from public.evala_rate_limits
   where user_id = v_user_id
   for update;

  if v_now >= v_started + make_interval(secs => p_window_seconds) then
    update public.evala_rate_limits
       set window_started_at = v_now,
           request_count = 1
     where user_id = v_user_id;
    return true;
  end if;

  if v_count >= p_limit then
    return false;
  end if;

  update public.evala_rate_limits
     set request_count = request_count + 1
   where user_id = v_user_id;

  return true;
end;
$$;

revoke execute on function public.consume_evala_rate_limit(integer, integer) from public;
revoke execute on function public.consume_evala_rate_limit(integer, integer) from anon;
grant execute on function public.consume_evala_rate_limit(integer, integer) to authenticated;

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
for select to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

drop policy if exists "pack_purchases_select_own" on public.pack_purchases;
drop policy if exists "members can read own pack purchases" on public.pack_purchases;
create policy "pack_purchases_select_own" on public.pack_purchases
for select to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

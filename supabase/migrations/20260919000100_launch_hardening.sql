-- LIVV launch hardening: billing RLS + EVALA rate limiting.
-- Keep this migration idempotent so it can reconcile an environment where the
-- billing policy changes were already applied manually.

create schema if not exists private;

create table if not exists private.evala_rate_limits (
  user_id uuid primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  constraint evala_rate_limits_count_nonnegative check (request_count >= 0)
);

create index if not exists evala_rate_limits_window_idx
  on private.evala_rate_limits (window_started_at);

create or replace function public.consume_evala_rate_limit(
  p_limit integer default 20,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_started timestamptz;
  v_count integer;
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

  insert into private.evala_rate_limits (user_id, window_started_at, request_count)
  values (v_user_id, clock_timestamp(), 1)
  on conflict (user_id) do nothing;

  select window_started_at, request_count
    into v_started, v_count
    from private.evala_rate_limits
   where user_id = v_user_id
   for update;

  if clock_timestamp() >= v_started + make_interval(secs => p_window_seconds) then
    update private.evala_rate_limits
       set window_started_at = clock_timestamp(),
           request_count = 1
     where user_id = v_user_id;
    return true;
  end if;

  if v_count >= p_limit then
    return false;
  end if;

  update private.evala_rate_limits
     set request_count = request_count + 1
   where user_id = v_user_id;

  return true;
end;
$$;

revoke execute on function public.consume_evala_rate_limit(integer, integer) from public;
revoke execute on function public.consume_evala_rate_limit(integer, integer) from anon;
grant execute on function public.consume_evala_rate_limit(integer, integer) to authenticated;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

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

-- LIVV launch hardening: billing RLS + EVALA rate limiting.
-- Idempotent. Reconciles environments where billing policy changes were applied manually.
--
-- Rate-limit design notes:
-- * Table is NOT directly writable by clients (revoked).
-- * consume_evala_rate_limit is SECURITY DEFINER so it can write the table while still
--   binding strictly to auth.uid() — this is required correctness, not convenience:
--   with SECURITY INVOKER + UPDATE-own policies, a client could zero request_count and
--   bypass the limiter entirely.
-- * Client-supplied p_limit / p_window_seconds are clamped server-side.

drop function if exists public.consume_evala_rate_limit(integer, integer);
drop table if exists private.evala_rate_limits;
drop table if exists public.evala_rate_limits;

create table public.evala_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  constraint evala_rate_limits_count_nonnegative check (request_count >= 0)
);

alter table public.evala_rate_limits enable row level security;
alter table public.evala_rate_limits force row level security;

-- No client policies: clients must not read or write this table directly.
drop policy if exists "evala_rate_limits_select_own" on public.evala_rate_limits;
drop policy if exists "evala_rate_limits_insert_own" on public.evala_rate_limits;
drop policy if exists "evala_rate_limits_update_own" on public.evala_rate_limits;

create index if not exists evala_rate_limits_window_idx
  on public.evala_rate_limits (window_started_at);

-- Table privileges: nobody on the client roles.
revoke all on table public.evala_rate_limits from public;
revoke all on table public.evala_rate_limits from anon;
revoke all on table public.evala_rate_limits from authenticated;

create or replace function public.consume_evala_rate_limit(
  p_limit integer default 20,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_started timestamptz;
  v_count integer;
  v_now timestamptz := clock_timestamp();
  v_limit integer;
  v_window integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null
     or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  then
    return false;
  end if;

  -- Clamp so a direct RPC call cannot request an unlimited window.
  v_limit := least(greatest(coalesce(p_limit, 20), 1), 20);
  v_window := greatest(coalesce(p_window_seconds, 600), 600);

  insert into public.evala_rate_limits (user_id, window_started_at, request_count)
  values (v_user_id, v_now, 1)
  on conflict (user_id) do nothing;

  select window_started_at, request_count
    into v_started, v_count
    from public.evala_rate_limits
   where user_id = v_user_id
   for update;

  if not found then
    return false;
  end if;

  if v_now >= v_started + make_interval(secs => v_window) then
    update public.evala_rate_limits
       set window_started_at = v_now,
           request_count = 1
     where user_id = v_user_id;
    return true;
  end if;

  if v_count >= v_limit then
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

-- Billing reads: permanent authenticated users only (reject anonymous JWT role).
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

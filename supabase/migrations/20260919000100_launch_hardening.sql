-- LIVV launch hardening: billing RLS + EVALA rate limiting + Stripe webhook claims.
-- Idempotent and safe to rerun.
--
-- EVALA limiter:
-- * state lives in the non-exposed private schema
-- * private SECURITY DEFINER function uses search_path=''
-- * public RPC wrapper is SECURITY INVOKER
-- * client roles have no table access
-- * identity comes only from auth.uid(); anonymous users are rejected
-- * limit is clamped to <=20 requests / >=600 seconds

create schema if not exists private;

drop function if exists public.consume_evala_rate_limit(integer, integer);
drop function if exists private.consume_evala_rate_limit(integer, integer);

create table if not exists private.evala_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  constraint private_evala_rate_limits_count_nonnegative check (request_count >= 0)
);

create index if not exists private_evala_rate_limits_window_idx
  on private.evala_rate_limits (window_started_at);

create or replace function private.consume_evala_rate_limit(
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

  v_limit := least(greatest(coalesce(p_limit, 20), 1), 20);
  v_window := greatest(coalesce(p_window_seconds, 600), 600);

  insert into private.evala_rate_limits (user_id, window_started_at, request_count)
  values (v_user_id, v_now, 1)
  on conflict (user_id) do nothing;

  select window_started_at, request_count
    into v_started, v_count
    from private.evala_rate_limits
   where user_id = v_user_id
   for update;

  if not found then
    return false;
  end if;

  if v_now >= v_started + make_interval(secs => v_window) then
    update private.evala_rate_limits
       set window_started_at = v_now,
           request_count = 1
     where user_id = v_user_id;
    return true;
  end if;

  if v_count >= v_limit then
    return false;
  end if;

  update private.evala_rate_limits
     set request_count = request_count + 1
   where user_id = v_user_id;

  return true;
end;
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on table private.evala_rate_limits from public, anon, authenticated;
revoke execute on function private.consume_evala_rate_limit(integer, integer) from public, anon;
grant execute on function private.consume_evala_rate_limit(integer, integer) to authenticated;

create or replace function public.consume_evala_rate_limit(
  p_limit integer default 20,
  p_window_seconds integer default 600
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.consume_evala_rate_limit(
    least(greatest(coalesce(p_limit, 20), 1), 20),
    greatest(coalesce(p_window_seconds, 600), 600)
  );
$$;

revoke execute on function public.consume_evala_rate_limit(integer, integer) from public, anon;
grant execute on function public.consume_evala_rate_limit(integer, integer) to authenticated;

-- Billing reads: permanent authenticated users only.
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

-- Stripe webhook claim ledger.
alter table public.stripe_webhook_events
  add column if not exists status text not null default 'processed';
alter table public.stripe_webhook_events
  add column if not exists claimed_at timestamptz;
alter table public.stripe_webhook_events
  add constraint stripe_webhook_events_status_check
  check (status in ('processing', 'processed'));
create index if not exists stripe_webhook_events_processing_idx
  on public.stripe_webhook_events (status, claimed_at);

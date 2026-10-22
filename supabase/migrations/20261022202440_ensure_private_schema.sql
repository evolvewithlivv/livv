-- LR-14. Forward migration only. Do not edit 20260921194418 in place.
-- Idempotent. Production already has private.ember_awards.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

-- 20260921194418 alters private.evala_rate_limits, and 20260924154942 drops
-- that table. A clean replay still executes the ALTER before this file, so
-- this guard cannot make that earlier statement succeed. If a leftover table
-- is present, keep it inaccessible. Do not recreate EVALA.
do $$
begin
  if to_regclass('private.evala_rate_limits') is not null then
    execute 'alter table private.evala_rate_limits enable row level security';
    execute 'revoke all on table private.evala_rate_limits from public, anon, authenticated';
  end if;
end
$$;

-- Rollback:
-- Do not drop schema private. It holds ember_awards and ember_redemptions.
-- revoke usage on schema private from service_role;

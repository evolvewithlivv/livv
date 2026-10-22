-- Revoke TRUNCATE and the extra anon grants left by default privileges.
-- RLS does not apply to TRUNCATE. anon could truncate member_state, crews,
-- crew_members, crew_challenges, crew_challenge_members, and crew_completions.
-- Those same tables, plus pack_purchases, still had TRUNCATE, REFERENCES,
-- and TRIGGER for authenticated. member_state also had full anon DML and an
-- authenticated DELETE the browser does not use.
--
-- Client usage checked in src/ (browser client, not service role):
--   profiles: SELECT and UPDATE of display_name, bio, goal, photo_url,
--     accent, appearance, theme, onboarding_completed_at.
--     Username changes use public.change_username, not a column update.
--   member_state: SELECT and UPSERT (INSERT + UPDATE) in cloud-state.ts.
--   change_username / is_username_available: EXECUTE for authenticated.
-- Crew, entitlement, pack, and webhook reads and writes in this repo go
-- through the service role. Authenticated SELECT stays where a policy
-- already allows the signed-in member to read their own row.
-- service_role grants are not changed.
-- Idempotent.

revoke all on table
  public.profiles,
  public.entitlements,
  public.member_state,
  public.pack_purchases,
  public.stripe_webhook_events,
  public.crews,
  public.crew_members,
  public.crew_challenges,
  public.crew_challenge_members,
  public.crew_completions,
  public.crew_invitations,
  public.crew_audit_events,
  public.crew_updates,
  public.crew_encouragements
from public, anon;

revoke truncate, references, trigger on table
  public.profiles,
  public.entitlements,
  public.member_state,
  public.pack_purchases,
  public.stripe_webhook_events,
  public.crews,
  public.crew_members,
  public.crew_challenges,
  public.crew_challenge_members,
  public.crew_completions,
  public.crew_invitations,
  public.crew_audit_events,
  public.crew_updates,
  public.crew_encouragements
from authenticated;

revoke delete, insert, update on table
  public.crew_challenge_members,
  public.crew_completions,
  public.crew_invitations,
  public.crew_audit_events,
  public.stripe_webhook_events
from authenticated;

revoke delete on table public.member_state from authenticated;

revoke update (username) on public.profiles from authenticated;

grant select on table public.profiles to authenticated;
grant update (
  display_name,
  bio,
  photo_url,
  accent,
  appearance,
  theme,
  goal,
  onboarding_completed_at
) on table public.profiles to authenticated;

grant select on table public.entitlements to authenticated;
grant select, insert, update on table public.member_state to authenticated;
grant select on table public.pack_purchases to authenticated;
grant select on table
  public.crews,
  public.crew_members,
  public.crew_challenges,
  public.crew_updates,
  public.crew_encouragements
to authenticated;

do $$
declare
  seq record;
begin
  for seq in
    select n.nspname as schema_name, c.relname as sequence_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'S'
  loop
    execute format(
      'revoke all on sequence %I.%I from public, anon, authenticated',
      seq.schema_name,
      seq.sequence_name
    );
  end loop;
end
$$;

-- New tables, sequences, and functions created by postgres must not be
-- granted to anon or authenticated. service_role keeps its default grant.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;

-- Dashboard SQL runs as supabase_admin. Migrations run as postgres, which
-- cannot always change another role's defaults. Skip that role when so.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    return;
  end if;
  execute 'alter default privileges for role supabase_admin in schema public revoke all on tables from anon, authenticated';
  execute 'alter default privileges for role supabase_admin in schema public revoke all on sequences from anon, authenticated';
  execute 'alter default privileges for role supabase_admin in schema public revoke all on functions from anon, authenticated';
exception
  when insufficient_privilege then
    raise notice 'skipped supabase_admin default privileges: %', sqlerrm;
end
$$;

-- Rollback restores the previous grants, including anon TRUNCATE. Do not run
-- it unless this migration itself is being reverted.
-- grant all on table public.member_state to anon, authenticated;
-- grant select, references, trigger, truncate on table public.crews, public.crew_members, public.crew_challenges to anon;
-- grant references, trigger, truncate on table public.crews, public.crew_members, public.crew_challenges, public.crew_challenge_members, public.crew_completions, public.pack_purchases to authenticated;
-- grant references, trigger, truncate on table public.crew_challenge_members, public.crew_completions to anon;
-- grant delete on table public.member_state to authenticated;
-- grant all on sequence public.crew_audit_events_id_seq, public.pack_purchases_id_seq to anon, authenticated;
-- alter default privileges for role postgres in schema public grant all on tables to anon, authenticated;
-- alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated;
-- alter default privileges for role postgres in schema public grant all on functions to anon, authenticated;
-- alter default privileges for role supabase_admin in schema public grant all on tables to anon, authenticated;
-- alter default privileges for role supabase_admin in schema public grant all on sequences to anon, authenticated;
-- alter default privileges for role supabase_admin in schema public grant all on functions to anon, authenticated;

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const changeUsernamePath = join(root, "supabase/migrations/20261022202439_lock_function_search_path.sql");
const migrationPath = join(root, "supabase/migrations/20261022203801_username_placeholder_claim.sql");
const changeUsernameSql = readFileSync(changeUsernamePath, "utf8");
const migration = readFileSync(migrationPath, "utf8");
const database = "livv_username_cooldown";

const fixture = `
create schema if not exists auth;

create table auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id),
  username text,
  username_changed_at timestamptz,
  username_change_count integer not null default 0
);

create unique index profiles_username_lower_key on public.profiles (lower(username));

create or replace function public.crew_accept_invitation(p_token_hash text, p_user_id uuid, p_display_name text)
returns jsonb
language sql
as $$ select '{}'::jsonb $$;
`;

const cases = `
insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222'),
  ('33333333-3333-4333-8333-333333333333'),
  ('44444444-4444-4444-8444-444444444444');

insert into public.profiles (id, username, username_changed_at, username_change_count) values
  ('11111111-1111-4111-8111-111111111111', 'anon_111111111111', null, 0),
  ('22222222-2222-4222-8222-222222222222', null, null, 0),
  ('33333333-3333-4333-8333-333333333333', 'alreadyreal', now(), 1),
  ('44444444-4444-4444-8444-444444444444', 'anon_444444444444', null, 0);

-- The placeholder claim does not start the cooldown.
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
select set_config('request.jwt.claims', '{"is_anonymous":false}', false);

do $$
begin
  perform public.claim_initial_username('anon_abcdefabcdef');
  raise exception 'placeholder pattern was accepted as a username';
exception
  when others then
    if sqlerrm not like '%Choose a different username%' then
      raise;
    end if;
end $$;

do $$
declare
  row public.profiles;
begin
  perform public.claim_initial_username('suggested');
  select * into row from public.profiles where id = '11111111-1111-4111-8111-111111111111';
  if row.username is distinct from 'suggested'
     or row.username_changed_at is not null
     or row.username_change_count is distinct from 0 then
    raise exception 'placeholder claim started the cooldown: % % %',
      row.username, row.username_changed_at, row.username_change_count;
  end if;

  -- First real pick, right after the placeholder claim, is allowed and starts the clock.
  perform public.change_username('firstpick');
  select * into row from public.profiles where id = '11111111-1111-4111-8111-111111111111';
  if row.username is distinct from 'firstpick'
     or row.username_changed_at is null
     or row.username_change_count is distinct from 1 then
    raise exception 'first real pick after a placeholder claim was blocked: % % %',
      row.username, row.username_changed_at, row.username_change_count;
  end if;
end $$;

select 'PASS first real pick is allowed right after the placeholder' as result;

-- A second change inside 30 days is blocked.
do $$
begin
  perform public.change_username('latename');
  raise exception 'second change was allowed';
exception
  when others then
    if sqlerrm not like '%once every 30 days%' then
      raise;
    end if;
end $$;

do $$
declare
  row public.profiles;
begin
  select * into row from public.profiles where id = '11111111-1111-4111-8111-111111111111';
  if row.username is distinct from 'firstpick' or row.username_change_count is distinct from 1 then
    raise exception 'blocked change still wrote a username: % %', row.username, row.username_change_count;
  end if;
end $$;

select 'PASS second change inside 30 days is blocked' as result;

-- Null username is the same initial state.
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);

do $$
declare
  row public.profiles;
begin
  perform public.claim_initial_username('fromnull');
  select * into row from public.profiles where id = '22222222-2222-4222-8222-222222222222';
  if row.username is distinct from 'fromnull'
     or row.username_changed_at is not null
     or row.username_change_count is distinct from 0 then
    raise exception 'null username claim started the cooldown: % % %',
      row.username, row.username_changed_at, row.username_change_count;
  end if;
  perform public.change_username('fromnullnext');
  begin
    perform public.change_username('fromnullblocked');
    raise exception 'second change after a null claim was allowed';
  exception
    when others then
      if sqlerrm not like '%once every 30 days%' then
        raise;
      end if;
  end;
end $$;

select 'PASS null username claim does not start the cooldown' as result;

-- claim_initial_username refuses a username that is already real.
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', false);

do $$
declare
  row public.profiles;
begin
  begin
    perform public.claim_initial_username('stolen');
    raise exception 'claim rewrote a real username';
  exception
    when others then
      if sqlerrm not like '%already claimed%' then
        raise;
      end if;
  end;
  select * into row from public.profiles where id = '33333333-3333-4333-8333-333333333333';
  if row.username is distinct from 'alreadyreal' then
    raise exception 'failed claim changed the username to %', row.username;
  end if;
end $$;

-- A member who already used their counted change is still blocked.
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', false);

do $$
begin
  perform public.change_username('shouldfail');
  raise exception 'change inside an open cooldown was allowed';
exception
  when others then
    if sqlerrm not like '%once every 30 days%' then
      raise;
    end if;
end $$;

select 'PASS open cooldown still blocks a username change' as result;

-- change_username itself still counts a move off the placeholder, so the
-- client must use claim_initial_username for that step.
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', false);

do $$
declare
  row public.profiles;
begin
  perform public.change_username('directpick');
  select * into row from public.profiles where id = '44444444-4444-4444-8444-444444444444';
  if row.username is distinct from 'directpick'
     or row.username_changed_at is null
     or row.username_change_count is distinct from 1 then
    raise exception 'change_username from a placeholder did not start the cooldown: % % %',
      row.username, row.username_changed_at, row.username_change_count;
  end if;
  begin
    perform public.change_username('directnext');
    raise exception 'second change_username from a placeholder path was allowed';
  exception
    when others then
      if sqlerrm not like '%once every 30 days%' then
        raise;
      end if;
  end;
end $$;
`;

function psqlAdmin(sql) {
  return execFileSync("sudo", ["-u", "postgres", "psql", "-v", "ON_ERROR_STOP=1", "-d", "postgres", "-c", sql], {
    encoding: "utf8",
  });
}

function psqlFile(file) {
  const result = spawnSync(
    "sudo",
    ["-u", "postgres", "psql", "-v", "ON_ERROR_STOP=1", "-d", database, "-f", file],
    { encoding: "utf8" },
  );
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.status !== 0) {
    throw new Error(output);
  }
  return output;
}

const dir = mkdtempSync(join(tmpdir(), "livv-username-"));
chmodSync(dir, 0o755);
const fixtureFile = join(dir, "fixture.sql");
const changeUsernameFile = join(dir, "change-username.sql");
const migrationFile = join(dir, "migration.sql");
const casesFile = join(dir, "cases.sql");
writeFileSync(fixtureFile, fixture);
writeFileSync(changeUsernameFile, changeUsernameSql);
writeFileSync(migrationFile, migration);
writeFileSync(casesFile, cases);
chmodSync(fixtureFile, 0o644);
chmodSync(changeUsernameFile, 0o644);
chmodSync(migrationFile, 0o644);
chmodSync(casesFile, 0o644);

psqlAdmin(`
  select pg_terminate_backend(pid)
  from pg_stat_activity
  where datname = '${database}' and pid <> pg_backend_pid();
`);
psqlAdmin(`drop database if exists ${database};`);
psqlAdmin(`create database ${database};`);

psqlFile(fixtureFile);
psqlFile(changeUsernameFile);
psqlFile(migrationFile);
const output = psqlFile(casesFile);

for (const line of [
  "PASS first real pick is allowed right after the placeholder",
  "PASS second change inside 30 days is blocked",
  "PASS null username claim does not start the cooldown",
  "PASS open cooldown still blocks a username change",
]) {
  assert.match(output, new RegExp(line));
}

console.log(output.trim());
console.log("username cooldown tests passed");

-- The bootstrap username is anon_<12 hex> (see handle_new_user), not a change
-- the member chose. Claiming the first real name from that placeholder, or
-- from a null username, must not set username_changed_at. change_username
-- still starts the 30-day cooldown, so the next change inside that window
-- is blocked.
-- Idempotent: create or replace. search_path stays empty.

create or replace function public.claim_initial_username(new_username text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile public.profiles;
  clean_username text;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Authentication required';
  end if;

  clean_username := lower(regexp_replace(trim(new_username), '^@', ''));
  clean_username := regexp_replace(clean_username, '[^a-z0-9_]', '', 'g');

  if char_length(clean_username) < 3 or char_length(clean_username) > 24 then
    raise exception 'Username must be 3 to 24 characters';
  end if;

  if clean_username ~ '^anon_[0-9a-f]{12}$' then
    raise exception 'Choose a different username';
  end if;

  select * into current_profile
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if current_profile.username is not null
     and current_profile.username !~ '^anon_[0-9a-f]{12}$' then
    raise exception 'Initial username is already claimed';
  end if;

  if current_profile.username is not null
     and clean_username = lower(current_profile.username) then
    return current_profile;
  end if;

  update public.profiles
  set username = clean_username
  where id = auth.uid()
  returning * into current_profile;

  return current_profile;
exception
  when unique_violation then
    raise exception 'That username is already taken';
end;
$$;

revoke all on function public.claim_initial_username(text) from public, anon;
grant execute on function public.claim_initial_username(text) to authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'revoke all on function public.claim_initial_username(text) from service_role';
    execute 'grant execute on function public.claim_initial_username(text) to service_role';
  end if;
end $$;

alter function public.claim_initial_username(text) set search_path = '';

-- Rollback:
-- drop function if exists public.claim_initial_username(text);

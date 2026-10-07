-- V1 username hardening: unique usernames are enforced by the existing
-- lower(username) unique index. This function adds a server-authoritative
-- change limit so clients cannot bypass the cooldown with local state.

alter table public.profiles
  add column if not exists username_changed_at timestamptz,
  add column if not exists username_change_count integer not null default 0;

create or replace function public.change_username(new_username text)
returns public.profiles
language plpgsql
security definer
set search_path = public
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

  select * into current_profile
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if clean_username = lower(current_profile.username) then
    return current_profile;
  end if;

  if current_profile.username_changed_at is not null
     and current_profile.username_changed_at > now() - interval '30 days' then
    raise exception 'Username can only be changed once every 30 days';
  end if;

  update public.profiles
  set username = clean_username,
      username_changed_at = now(),
      username_change_count = username_change_count + 1
  where id = auth.uid()
  returning * into current_profile;

  return current_profile;
exception
  when unique_violation then
    raise exception 'That username is already taken';
end;
$$;

revoke all on function public.change_username(text) from public, anon;
grant execute on function public.change_username(text) to authenticated;

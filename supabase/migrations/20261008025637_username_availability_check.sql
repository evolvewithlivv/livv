-- Already applied on production (schema_migrations 20261008025637).
-- Kept so Supabase Preview can reconcile history. Do not assign a new version.
create or replace function public.is_username_available(candidate text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_username text;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Authentication required';
  end if;

  clean_username := lower(regexp_replace(trim(candidate), '^@', ''));
  clean_username := regexp_replace(clean_username, '[^a-z0-9_]', '', 'g');

  if char_length(clean_username) < 3 or char_length(clean_username) > 24 then
    return false;
  end if;

  return not exists (
    select 1 from public.profiles
    where lower(username) = clean_username
      and id <> auth.uid()
  );
end;
$$;

revoke all on function public.is_username_available(text) from public, anon;
grant execute on function public.is_username_available(text) to authenticated;

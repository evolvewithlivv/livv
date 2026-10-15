-- Already applied on production (schema_migrations 20261007112132).
-- Kept so Supabase Preview can reconcile history. Do not assign a new version.
update public.profiles set theme = case when appearance = 'dark' then 'midnight' else 'daylight' end;
alter table public.profiles drop constraint if exists profiles_theme_check;
alter table public.profiles add constraint profiles_theme_check check (theme = any (array['daylight'::text,'midnight'::text]));
create or replace function private.protect_membership_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.tier := 'spark';
    new.embers := 0;
    if new.theme is null or new.theme not in ('daylight','midnight') then new.theme := 'daylight'; end if;
    if new.accent is null or new.accent = '' then new.accent := '#0F7FFF'; end if;
    return new;
  end if;
  if new.tier is distinct from old.tier or new.embers is distinct from old.embers then
    raise exception 'membership-controlled fields are server managed';
  end if;
  if new.theme is distinct from old.theme and new.theme not in ('daylight','midnight') then
    raise exception 'invalid LIVV theme';
  end if;
  return new;
end;
$$;

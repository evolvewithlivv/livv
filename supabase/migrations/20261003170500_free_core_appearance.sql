-- V1 is free-core: appearance/theme customization is not gated by retired paid tiers.
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
    return new;
  end if;

  if new.tier is distinct from old.tier or new.embers is distinct from old.embers then
    raise exception 'membership-controlled fields are server managed';
  end if;

  return new;
end;
$$;

revoke execute on function private.protect_membership_fields() from public, anon, authenticated;

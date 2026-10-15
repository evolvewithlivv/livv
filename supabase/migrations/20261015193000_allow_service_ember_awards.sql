-- grant_embers updates profiles.embers. The membership trigger treated that
-- update as a client write and raised, so POST /api/embers/award returned 503.
-- Service-role and security-definer award calls have no end-user JWT.
-- Signed-in members still cannot change tier or embers.

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
    if new.theme is null or new.theme not in ('daylight', 'midnight') then
      new.theme := 'daylight';
    end if;
    if new.accent is null or new.accent = '' then
      new.accent := '#0F7FFF';
    end if;
    return new;
  end if;

  if auth.uid() is null then
    return new;
  end if;

  if new.tier is distinct from old.tier or new.embers is distinct from old.embers then
    raise exception 'membership-controlled fields are server managed';
  end if;

  if new.theme is distinct from old.theme and new.theme not in ('daylight', 'midnight') then
    raise exception 'invalid LIVV theme';
  end if;

  return new;
end;
$$;

revoke execute on function private.protect_membership_fields() from public, anon, authenticated;

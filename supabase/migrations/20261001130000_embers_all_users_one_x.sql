-- V1 Ember policy: every LIVV user earns at exactly 1x.
-- Historical tier/entitlement columns remain for database history, but they no longer
-- influence Ember awards.
create or replace function public.grant_embers(
  p_user_id uuid,
  p_event_key text,
  p_base_amount integer
)
returns table(awarded integer, total integer, tier text, multiplier integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_awarded integer := 0;
  v_total integer := 0;
  v_awards_today integer := 0;
begin
  if p_user_id is null then raise exception 'user id required'; end if;
  if p_event_key is null or length(trim(p_event_key)) < 12 or length(p_event_key) > 120 then raise exception 'invalid event key'; end if;
  if p_base_amount is null or p_base_amount not in (4,6,8,10,12,15,16,20,25,30,40,50,75,150) then raise exception 'invalid ember award'; end if;

  select count(*)::integer into v_awards_today
  from private.ember_awards
  where user_id = p_user_id
    and created_at >= date_trunc('day', now())
    and created_at < date_trunc('day', now()) + interval '1 day';

  if v_awards_today >= 20 then raise exception 'daily ember award limit reached'; end if;

  insert into private.ember_awards (user_id,event_key,base_amount,multiplier,awarded_amount)
  values (p_user_id,trim(p_event_key),p_base_amount,1,p_base_amount)
  on conflict (event_key) do nothing;

  if found then
    v_awarded := p_base_amount;
    update public.profiles
      set embers = greatest(0, coalesce(embers,0) + v_awarded), updated_at = now()
    where id = p_user_id
    returning embers into v_total;
  else
    select coalesce(p.embers,0) into v_total from public.profiles p where p.id=p_user_id;
  end if;

  if v_total is null then raise exception 'profile not found'; end if;
  return query select v_awarded,v_total,'spark',1;
end;
$$;

revoke execute on function public.grant_embers(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.grant_embers(uuid,text,integer) to service_role;

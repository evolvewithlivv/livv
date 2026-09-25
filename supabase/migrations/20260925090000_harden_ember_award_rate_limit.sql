-- Bound server-authoritative Ember awards even if a client forges event keys.
-- Legitimate V1 actions award a small number of times per day; this prevents
-- an attacker from minting an unbounded Ember balance with synthetic events.
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
  v_tier text := 'spark';
  v_status text := 'none';
  v_multiplier integer := 1;
  v_awarded integer := 0;
  v_total integer := 0;
  v_awards_today integer := 0;
begin
  if p_user_id is null then raise exception 'user id required'; end if;
  if p_event_key is null or length(trim(p_event_key)) < 12 or length(p_event_key) > 120 then raise exception 'invalid event key'; end if;
  if p_base_amount is null or p_base_amount not in (4,6,8,10,12,15,16,20,25,30,40,50,75,150) then raise exception 'invalid ember award'; end if;

  select coalesce(e.tier, 'spark'), coalesce(e.status, 'none')
    into v_tier, v_status
  from public.entitlements e
  where e.user_id = p_user_id;

  if v_status not in ('active','trialing','past_due') then v_tier := 'spark'; end if;

  v_multiplier := case v_tier
    when 'circle' then 6
    when 'apex' then 4
    when 'rise' then 2
    else 1
  end;

  select count(*)::integer
    into v_awards_today
  from private.ember_awards
  where user_id = p_user_id
    and created_at >= date_trunc('day', now())
    and created_at < date_trunc('day', now()) + interval '1 day';

  if v_awards_today >= 20 then
    raise exception 'daily ember award limit reached';
  end if;

  insert into private.ember_awards (user_id,event_key,base_amount,multiplier,awarded_amount)
  values (p_user_id,trim(p_event_key),p_base_amount,v_multiplier,p_base_amount*v_multiplier)
  on conflict (event_key) do nothing;

  if found then
    v_awarded := p_base_amount * v_multiplier;
    update public.profiles
      set embers = greatest(0, coalesce(embers,0) + v_awarded), updated_at = now()
    where id = p_user_id
    returning embers into v_total;
  else
    select coalesce(p.embers,0) into v_total from public.profiles p where p.id=p_user_id;
  end if;

  if v_total is null then raise exception 'profile not found'; end if;
  return query select v_awarded,v_total,v_tier,v_multiplier;
end;
$$;

revoke execute on function public.grant_embers(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.grant_embers(uuid,text,integer) to service_role;
